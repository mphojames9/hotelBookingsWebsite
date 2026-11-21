import mongoose from "mongoose"

const roomSchema = new mongoose.Schema({
    name: {type:String,required:true},
    description: {type:String,required:true},
    price:{type:Number,required:true},            // price per night
    image:{type:String,required:true},
    category:{type:String,required:true},         // room type, e.g. "Deluxe"
    maxGuests:{type:Number,default:2,min:1},      // guests per room
    totalRooms:{type:Number,default:1,min:1},     // how many rooms of this type the hotel has
    // amenities shown on the room card, e.g. {label:"Bed", value:"King"}
    specs:{type:[{label:{type:String,required:true},value:{type:String,required:true},_id:false}],default:[]}
})

const roomModel = mongoose.models.room || mongoose.model("room",roomSchema);
export default roomModel;
