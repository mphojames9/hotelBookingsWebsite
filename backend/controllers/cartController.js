import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import roomModel from "../models/roomModel.js";

const addToCart = async (req,res) => {
    try {
        const {itemId} = req.body;
        if (!mongoose.isValidObjectId(itemId)) {
            return res.json({success:false,message:"Invalid item"})
        }
        await userModel.findByIdAndUpdate(req.userId,{$inc:{[`cartData.${itemId}`]:1}});
        res.json({success:true,message:"Added to cart"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const removeFromCart = async (req,res) => {
    try {
        const {itemId} = req.body;
        if (!mongoose.isValidObjectId(itemId)) {
            return res.json({success:false,message:"Invalid item"})
        }
        const user = await userModel.findById(req.userId);
        const cartData = {...(user.cartData || {})};
        if (req.body.all === true) {
            delete cartData[itemId];          // the guest closed the whole row
        } else if (cartData[itemId] > 1) {
            cartData[itemId] -= 1;
        } else {
            delete cartData[itemId];
        }
        await userModel.findByIdAndUpdate(req.userId,{cartData});
        res.json({success:true,message:"Removed from cart"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const getCart = async (req,res) => {
    try {
        const user = await userModel.findById(req.userId);
        const saved = user.cartData || {};
        // rooms the admin has removed since the guest last visited must not linger in the cart
        const ids = Object.keys(saved).filter(id => mongoose.isValidObjectId(id));
        const alive = new Set((await roomModel.find({_id:{$in:ids}},"_id")).map(r => String(r._id)));
        const cartData = Object.fromEntries(Object.entries(saved).filter(([id]) => alive.has(id)));
        if (Object.keys(cartData).length !== Object.keys(saved).length) {
            await userModel.findByIdAndUpdate(req.userId,{cartData});
        }
        res.json({success:true,cartData})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// Adds a guest cart ({productId: qty}) into the saved cart when someone logs in
const mergeCart = async (req,res) => {
    try {
        const items = req.body.items || {};
        const user = await userModel.findById(req.userId);
        const cartData = {...(user.cartData || {})};
        const ids = [...new Set([...Object.keys(cartData),...Object.keys(items)])].filter(id => mongoose.isValidObjectId(id));
        const alive = new Set((await roomModel.find({_id:{$in:ids}},"_id totalRooms")).map(r => String(r._id)));
        for (const id of Object.keys(cartData)) if (!alive.has(id)) delete cartData[id];
        for (const [id,qty] of Object.entries(items)) {
            const n = Number(qty);
            if (!alive.has(id) || !Number.isInteger(n) || n < 1) continue;
            cartData[id] = (cartData[id] || 0) + n;
        }
        await userModel.findByIdAndUpdate(req.userId,{cartData});
        res.json({success:true,cartData})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export {addToCart,removeFromCart,getCart,mergeCart}
