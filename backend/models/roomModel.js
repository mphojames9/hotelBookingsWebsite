import mongoose from "mongoose"

const roomSchema = new mongoose.Schema({
    name: {type:String,required:true},
    description: {type:String,required:true},
    price:{type:Number,required:true},            // price per night
    image:{type:String,required:true},            // cover photo (always the first of `images`)
    images:{type:[String],default:[]},            // every photo, in slideshow order
    category:{type:String,required:true},         // room type, e.g. "Deluxe"
    location:{type:String,default:""},            // which hotel: Sandton, Sea Point or Umhlanga ("" = not assigned yet)
    maxGuests:{type:Number,default:2,min:1},      // guests per room
    totalRooms:{type:Number,default:1,min:1},     // how many rooms of this type the hotel has
    // amenities shown on the room card, e.g. {label:"Bed", value:"King"}
    specs:{type:[{label:{type:String,required:true},value:{type:String,required:true},_id:false}],default:[]}
})

const roomModel = mongoose.models.room || mongoose.model("room",roomSchema);
export default roomModel;
