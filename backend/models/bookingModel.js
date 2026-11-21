import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    items:{type:Array,required:true},             // [{roomId,name,price,quantity}]
    checkIn:{type:Date,required:true},
    checkOut:{type:Date,required:true},
    nights:{type:Number,required:true},
    guests:{type:Number,required:true},
    amount:{type:Number,required:true},
    guest:{type:Object,required:true},            // name, email, phone, country, requests
    status:{type:String,default:"Confirmed"},
    date:{type:Date,default:Date.now},            // when the booking was made
    payment:{type:Boolean,default:false},
    stripeSessionId:{type:String}
})

const bookingModel = mongoose.models.booking || mongoose.model("booking",bookingSchema);
export default bookingModel;
