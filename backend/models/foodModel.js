import mongoose from "mongoose"

const foodSchema = new mongoose.Schema({
    name: {type:String,required:true},
    description: {type:String,required:true},
    price:{type:Number,required:true},
    image:{type:String,required:true},
    category:{type:String,required:true},
    // technical specifications shown on the product card, e.g. {label:"Screen size", value:"13 inch"}
    // units in stock. null = not tracked (always available), 0 = sold out
    stock:{type:Number,min:0,default:null},
    specs:{type:[{label:{type:String,required:true},value:{type:String,required:true},_id:false}],default:[]}
})

const foodModel = mongoose.models.food || mongoose.model("food",foodSchema);

export default foodModel;
