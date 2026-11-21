import roomModel from "../models/roomModel.js";
import imageModel from "../models/imageModel.js";
import fs from 'fs';
import mongoose from 'mongoose';

// amenities arrive as a JSON string (multipart form); keep only complete, sensibly sized rows
const MAX_SPECS = 12;
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
const imageName = (file) => `${Date.now()}-${file.originalname}`.replace(/[^\w.-]/g,"_");

const addRoom = async (req,res) => {
    try {
        if (!req.file) return res.json({success:false,message:"Please upload a room photo"})
        const f = readFields(req.body);
        if (!valid(f)) return res.json({success:false,message:"Name, description, room type and a valid nightly rate are required"})

        const filename = imageName(req.file);
        await imageModel.create({filename,contentType:req.file.mimetype,data:req.file.buffer});
        try {
            await new roomModel({...f,specs:sanitizeSpecs(req.body.specs),image:filename}).save();
        } catch (error) {
            await imageModel.deleteOne({filename}).catch(()=>{});
            throw error;
        }
        res.json({success:true,message:"Room Added"})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    }
}

const listRooms = async (req,res) => {
    try {
        res.json({success:true,data:await roomModel.find({})})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const removeRoom = async (req,res) => {
    try {
        const room = await roomModel.findById(req.body.id);
        if (!room) return res.json({success:false,message:"Room not found"})
        await imageModel.deleteOne({filename:room.image});
        fs.unlink(`uploads/${room.image}`,()=>{})
        await roomModel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Room Removed"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const updateRoom = async (req,res) => {
    try {
        const id = req.body.id;
        if (!mongoose.isValidObjectId(id)) return res.json({success:false,message:"Room not found"})
        const room = await roomModel.findById(id);
        if (!room) return res.json({success:false,message:"Room not found"})

        const f = readFields(req.body);
        if (!valid(f)) return res.json({success:false,message:"Name, description, room type and a valid nightly rate are required"})

        const oldImage = room.image;
        let newImage = null;
        if (req.file) {
            newImage = imageName(req.file);
            await imageModel.create({filename:newImage,contentType:req.file.mimetype,data:req.file.buffer});
        }
        try {
            Object.assign(room,f);
            if (req.body.specs !== undefined) room.specs = sanitizeSpecs(req.body.specs);
            if (newImage) room.image = newImage;
            await room.save();
        } catch (error) {
            if (newImage) await imageModel.deleteOne({filename:newImage}).catch(()=>{});
            throw error;
        }
        if (newImage && oldImage && oldImage !== newImage && !(await roomModel.exists({image:oldImage}))) {
            await imageModel.deleteOne({filename:oldImage}).catch(()=>{});
            fs.unlink(`uploads/${oldImage}`,()=>{})
        }
        res.json({success:true,message:"Room Updated",data:room})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    }
}

export {addRoom, listRooms, removeRoom, updateRoom}
