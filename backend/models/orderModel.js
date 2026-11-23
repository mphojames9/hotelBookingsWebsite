import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    items:{type:Array,required:true},
    amount:{type:Number,required:true},
    address:{type:Object,required:true},
    status:{type:String,default:"Processing"},
    statusHistory:{type:Array,default:[]}, // [{status, at}] each time the status changed
    date:{type:Date,default:Date.now},
    payment:{type:Boolean,default:false},
    stripeSessionId:{type:String},
    promoCode:{type:String},
    discount:{type:Number,default:0}
})

const orderModel = mongoose.models.order || mongoose.model("order",orderSchema);
export default orderModel;
