import mongoose from "mongoose";
import validator from "validator";
import contactModel from "../models/contactModel.js";
import { LOCATIONS } from "../config/locations.js";

const clean = (v,max) => String(v ?? "").replace(/\s+/g," ").trim().slice(0,max);

// very small in-memory throttle: 5 submissions per 10 minutes per address
const hits = new Map();
const throttled = (ip) => {
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter(t => now - t < 10*60*1000);
    recent.push(now);
    hits.set(ip,recent);
    return recent.length > 5;
}

// public: contact form ({name,email,phone,topic,location,message}) or newsletter ({kind:"newsletter",email})
const sendMessage = async (req,res) => {
    try {
        if (throttled(req.ip)) return res.status(429).json({success:false,message:"Too many messages. Please try again in a few minutes."})
        const kind = req.body.kind === "newsletter" ? "newsletter" : "message";
        const email = clean(req.body.email,120).toLowerCase();
        if (!validator.isEmail(email)) return res.json({success:false,message:"Please enter a valid email address"})

        if (kind === "newsletter") {
            if (await contactModel.exists({kind,email})) return res.json({success:true,message:"You are already on our list"})
            await contactModel.create({kind,email});
            return res.json({success:true,message:"Thank you, you are on the list"})
        }

        const name = clean(req.body.name,80);
        const message = String(req.body.message ?? "").trim().slice(0,2000);
        if (!name) return res.json({success:false,message:"Please enter your name"})
        if (message.length < 5) return res.json({success:false,message:"Please write a short message"})
        const location = LOCATIONS.includes(req.body.location) ? req.body.location : "";
        await contactModel.create({kind,name,email,phone:clean(req.body.phone,30),topic:clean(req.body.topic,60),location,message});
        res.json({success:true,message:"Thank you, we will reply within one working day"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Could not send your message. Please try again."})
    }
}

// admin
const listMessages = async (req,res) => {
    try {
        res.json({success:true,data:await contactModel.find({}).sort({date:-1}).limit(500)})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const markRead = async (req,res) => {
    try {
        const {id,read} = req.body;
        if (!mongoose.isValidObjectId(id) || typeof read !== "boolean") return res.json({success:false,message:"Invalid request"})
        await contactModel.findByIdAndUpdate(id,{read});
        res.json({success:true,message:read ? "Marked as read" : "Marked as unread"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const deleteMessage = async (req,res) => {
    try {
        if (!mongoose.isValidObjectId(req.body.id)) return res.json({success:false,message:"Invalid request"})
        await contactModel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Message deleted"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export {sendMessage,listMessages,markRead,deleteMessage}
