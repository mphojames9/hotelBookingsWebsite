import mongoose from "mongoose";

// Messages from the website's contact form and newsletter sign-ups (read in the admin panel)
const contactSchema = new mongoose.Schema({
    kind:{type:String,enum:["message","newsletter"],default:"message"},
    name:{type:String,default:""},
    email:{type:String,required:true},
    phone:{type:String,default:""},
    topic:{type:String,default:""},
    location:{type:String,default:""},
    message:{type:String,default:""},
    read:{type:Boolean,default:false},
    date:{type:Date,default:Date.now}
})

const contactModel = mongoose.models.contact || mongoose.model("contact",contactSchema);
export default contactModel;
