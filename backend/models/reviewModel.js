import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    foodId:{type:String,required:true,index:true},
    userId:{type:String,required:true},
    userName:{type:String,required:true},
    rating:{type:Number,required:true,min:1,max:5},
    comment:{type:String,default:""},
    hidden:{type:Boolean,default:false},   // hidden by an admin: kept, but not shown to shoppers
    verified:{type:Boolean,default:false}, // the reviewer has a paid order containing this product
    date:{type:Date,default:Date.now}
})

// one review per shopper per product (writing again updates it)
reviewSchema.index({foodId:1,userId:1},{unique:true});

const reviewModel = mongoose.models.review || mongoose.model("review",reviewSchema);
export default reviewModel;
