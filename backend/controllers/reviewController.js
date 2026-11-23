import mongoose from "mongoose";
import reviewModel from "../models/reviewModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import roomModel from "../models/roomModel.js";
import { summarise, cleanRating, cleanComment } from "../utils/reviewStats.js";

// public: average + count for every product that has reviews, as { [foodId]: {average,count} }
const ratingSummary = async (req,res) => {
    try {
        const rows = await reviewModel.aggregate([{$match:{hidden:{$ne:true}}},{$group:{_id:"$foodId",average:{$avg:"$rating"},count:{$sum:1}}}]);
        const data = {};
        for (const row of rows) data[row._id] = {average:Math.round(row.average*10)/10,count:row.count};
        res.json({success:true,data})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// public: the reviews for one product (the shopper's user id is never sent out)
const listReviews = async (req,res) => {
    try {
        const {foodId} = req.query;
        if (!mongoose.isValidObjectId(foodId)) return res.json({success:false,message:"Invalid product"})
        const reviews = await reviewModel.find({foodId,hidden:{$ne:true}}).sort({date:-1}).limit(100);
        const stats = summarise(reviews.map(r => r.rating));
        res.json({
            success:true,
            ...stats,
            reviews:reviews.map(r => ({name:r.userName,rating:r.rating,comment:r.comment,verified:r.verified,date:r.date}))
        })
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// customer: their own review of a product, if they wrote one
const myReview = async (req,res) => {
    try {
        const {foodId} = req.body;
        if (!mongoose.isValidObjectId(foodId)) return res.json({success:false,message:"Invalid product"})
        const review = await reviewModel.findOne({foodId,userId:req.userId});
        res.json({success:true,review:review ? {rating:review.rating,comment:review.comment} : null})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// customer: write a review, or replace the one they already wrote
const addReview = async (req,res) => {
    try {
        const {foodId} = req.body;
        if (!mongoose.isValidObjectId(foodId) || !(await foodModel.exists({_id:foodId}))) {
            return res.json({success:false,message:"Product not found"})
        }
        const rating = cleanRating(req.body.rating);
        if (rating === undefined) return res.json({success:false,message:"Please choose a rating from 1 to 5 stars"})
        const comment = cleanComment(req.body.comment);

        const user = await userModel.findById(req.userId);
        if (!user) return res.status(401).json({success:false,message:"Not authorised, please log in again"})
        const firstName = String(user.name || "").trim().split(/\s+/)[0] || "Shopper";
        const verified = !!(await orderModel.exists({userId:req.userId,payment:true,"items.foodId":String(foodId)}));

        await reviewModel.findOneAndUpdate(
            {foodId,userId:req.userId},
            {$set:{userName:firstName,rating,comment,verified,date:new Date()}},
            {upsert:true,setDefaultsOnInsert:true}
        );
        res.json({success:true,message:"Thanks for your review"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Could not save your review"})
    }
}

// customer: delete their own review
const removeReview = async (req,res) => {
    try {
        const {foodId} = req.body;
        if (!mongoose.isValidObjectId(foodId)) return res.json({success:false,message:"Invalid product"})
        await reviewModel.deleteOne({foodId,userId:req.userId});
        res.json({success:true,message:"Review removed"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// ---------- admin moderation ----------

// admin: every review, newest first, with the product's name
const adminListReviews = async (req,res) => {
    try {
        const reviews = await reviewModel.find({}).sort({date:-1}).limit(500);
        const ids = [...new Set(reviews.map(r => r.foodId))].filter(id => mongoose.isValidObjectId(id));
        // reviews can belong to a room (hotel) or to an old shop product
        const [rooms,foods] = await Promise.all([
            roomModel.find({_id:{$in:ids}},"name"),
            foodModel.find({_id:{$in:ids}},"name")
        ]);
        const names = new Map([...foods,...rooms].map(f => [String(f._id),f.name]));
        res.json({
            success:true,
            data:reviews.map(r => ({
                _id:r._id,
                foodId:r.foodId,
                productName:names.get(r.foodId) || "Removed room",
                userName:r.userName,
                rating:r.rating,
                comment:r.comment,
                verified:r.verified,
                hidden:!!r.hidden,
                date:r.date
            }))
        })
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Could not load reviews"})
    }
}

// admin: hide a review from shoppers, or show it again (nothing is deleted)
const adminHideReview = async (req,res) => {
    try {
        const {id,hidden} = req.body;
        if (!mongoose.isValidObjectId(id) || typeof hidden !== "boolean") return res.json({success:false,message:"Invalid request"})
        const review = await reviewModel.findByIdAndUpdate(id,{hidden});
        if (!review) return res.json({success:false,message:"Review not found"})
        res.json({success:true,message:hidden ? "Review hidden from shoppers" : "Review is visible again"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// admin: delete a review for good
const adminDeleteReview = async (req,res) => {
    try {
        const {id} = req.body;
        if (!mongoose.isValidObjectId(id)) return res.json({success:false,message:"Invalid request"})
        const review = await reviewModel.findByIdAndDelete(id);
        if (!review) return res.json({success:false,message:"Review not found"})
        res.json({success:true,message:"Review deleted"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export {ratingSummary,listReviews,myReview,addReview,removeReview,adminListReviews,adminHideReview,adminDeleteReview}
