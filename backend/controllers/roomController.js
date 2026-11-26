import roomModel from "../models/roomModel.js";
import imageModel from "../models/imageModel.js";
import reviewModel from "../models/reviewModel.js";
import fs from 'fs';
import mongoose from 'mongoose';

// amenities arrive as a JSON string (multipart form); keep only complete, sensibly sized rows
const MAX_SPECS = 12;
const MAX_IMAGES = 8;
const sanitizeSpecs = (input) => {
    let list = input;
    if (typeof input === 'string') {
        try { list = JSON.parse(input); } catch { return []; }
    }
    if (!Array.isArray(list)) return [];
    const specs = [];
    for (const row of list) {
        const label = String(row?.label ?? '').trim().slice(0,40);
        const value = String(row?.value ?? '').trim().slice(0,80);
        if (!label || !value) continue;
        specs.push({label,value});
        if (specs.length >= MAX_SPECS) break;
    }
    return specs;
}

const readFields = (body) => ({
    name:String(body.name || "").trim(),
    description:String(body.description || "").trim(),
    category:String(body.category || "").trim(),
    price:Number(body.price),
    maxGuests:Math.max(1,parseInt(body.maxGuests) || 2),
    totalRooms:Math.max(1,parseInt(body.totalRooms) || 1)
});
const valid = (f) => f.name && f.description && f.category && f.price > 0;
let uploadCounter = 0;
const imageName = (file) => `${Date.now()}-${uploadCounter++}-${file.originalname}`.replace(/[^\w.-]/g,"_");

// every photo of a room, cover first. Rooms saved before galleries existed only have `image`.
const photosOf = (room) => (room.images && room.images.length ? [...room.images] : room.image ? [room.image] : []);
const withPhotos = (room) => ({...room.toObject(),images:photosOf(room)});

const uploadedFiles = (req) => [...(req.files?.images || []),...(req.files?.image || [])];

// saves the uploaded files to MongoDB and returns their names (in the same order); all or nothing
const storeImages = async (files) => {
    const names = [];
    try {
        for (const file of files) {
            const filename = imageName(file);
            await imageModel.create({filename,contentType:file.mimetype,data:file.buffer});
            names.push(filename);
        }
    } catch (error) {
        await imageModel.deleteMany({filename:{$in:names}}).catch(()=>{});
        throw error;
    }
    return names;
}

// deletes photos that no room uses any more (call after the room has been saved or removed)
const dropImages = async (names) => {
    for (const filename of names) {
        if (!filename) continue;
        if (await roomModel.exists({$or:[{image:filename},{images:filename}]})) continue;
        await imageModel.deleteOne({filename}).catch(()=>{});
        fs.unlink(`uploads/${filename}`,()=>{})
    }
}

const addRoom = async (req,res) => {
    let names = [];
    try {
        const files = uploadedFiles(req);
        if (files.length === 0) return res.json({success:false,message:"Please upload at least one room photo"})
        if (files.length > MAX_IMAGES) return res.json({success:false,message:`A room can have up to ${MAX_IMAGES} photos`})
        const f = readFields(req.body);
        if (!valid(f)) return res.json({success:false,message:"Name, description, room type and a valid nightly rate are required"})

        names = await storeImages(files);
        await new roomModel({...f,specs:sanitizeSpecs(req.body.specs),image:names[0],images:names}).save();
        res.json({success:true,message:"Room Added"})
    } catch (error) {
        console.log(error)
        if (names.length) await imageModel.deleteMany({filename:{$in:names}}).catch(()=>{});
        res.json({success:false,message:"Error"})
    }
}

const listRooms = async (req,res) => {
    try {
        const rooms = await roomModel.find({});
        res.json({success:true,data:rooms.map(withPhotos)})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const removeRoom = async (req,res) => {
    try {
        const room = await roomModel.findById(req.body.id);
        if (!room) return res.json({success:false,message:"Room not found"})
        await roomModel.findByIdAndDelete(req.body.id);
        await reviewModel.deleteMany({foodId:String(req.body.id)}).catch(()=>{});   // reviews of a removed room go with it
        await dropImages(photosOf(room));
        res.json({success:true,message:"Room Removed"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const updateRoom = async (req,res) => {
    let added = [];
    try {
        const id = req.body.id;
        if (!mongoose.isValidObjectId(id)) return res.json({success:false,message:"Room not found"})
        const room = await roomModel.findById(id);
        if (!room) return res.json({success:false,message:"Room not found"})

        const f = readFields(req.body);
        if (!valid(f)) return res.json({success:false,message:"Name, description, room type and a valid nightly rate are required"})

        const files = uploadedFiles(req);
        const current = photosOf(room);

        // `layout` is the final photo order: {name} keeps a saved photo, {upload:n} places the n-th uploaded file.
        // Without it every saved photo stays and the uploads are added at the end.
        let plan = [...current.map((name)=>({name})),...files.map((_,upload)=>({upload}))];
        if (req.body.layout !== undefined) {
            try { plan = JSON.parse(req.body.layout); } catch { return res.json({success:false,message:"Invalid photo order"}) }
            if (!Array.isArray(plan)) return res.json({success:false,message:"Invalid photo order"})
        }

        const seen = new Set();
        const order = [];
        for (const entry of plan) {
            if (typeof entry?.name === "string" && current.includes(entry.name) && !seen.has(entry.name)) {
                seen.add(entry.name);
                order.push({name:entry.name});
            } else if (Number.isInteger(entry?.upload) && entry.upload >= 0 && entry.upload < files.length && !seen.has(`#${entry.upload}`)) {
                seen.add(`#${entry.upload}`);
                order.push({upload:entry.upload});
            }
        }
        if (order.length === 0) return res.json({success:false,message:"A room needs at least one photo"})
        if (order.length > MAX_IMAGES) return res.json({success:false,message:`A room can have up to ${MAX_IMAGES} photos`})

        // only the uploads that made it into the final order are stored
        const wanted = order.filter((o)=>o.upload !== undefined).map((o)=>o.upload);
        added = await storeImages(wanted.map((i)=>files[i]));
        const nameOfUpload = new Map(wanted.map((i,k)=>[i,added[k]]));
        const finalNames = order.map((o)=>o.name ?? nameOfUpload.get(o.upload));

        Object.assign(room,f);
        if (req.body.specs !== undefined) room.specs = sanitizeSpecs(req.body.specs);
        room.images = finalNames;
        room.image = finalNames[0];
        await room.save();
        added = [];   // saved: from here on the new photos belong to the room

        await dropImages(current.filter((name)=>!finalNames.includes(name)));
        res.json({success:true,message:"Room Updated",data:withPhotos(room)})
    } catch (error) {
        console.log(error)
        if (added.length) await imageModel.deleteMany({filename:{$in:added}}).catch(()=>{});
        res.json({success:false,message:"Error"})
    }
}

export {addRoom, listRooms, removeRoom, updateRoom}
