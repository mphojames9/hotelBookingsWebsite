import 'dotenv/config'
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoutes.js";
import userRouter from "./routes/userRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import imageModel from "./models/imageModel.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

//middleware
app.use(express.json({limit:"100kb"}))
app.use(cors())

// db connection
connectDB();

// api endpoints
app.use("/api/food",foodRouter)
// images: files that ship inside the repo (uploads/) first, then images uploaded through the admin panel (MongoDB)
app.use("/images",express.static('uploads',{maxAge:"7d"}))
app.get("/images/:name",async (req,res)=>{
    try {
        const image = await imageModel.findOne({filename:req.params.name});
        if (!image) return res.status(404).send("Image not found");
        res.set("Content-Type",image.contentType);
        res.set("Cache-Control","public, max-age=604800");
        res.send(image.data);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Error");
    }
})
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/review",reviewRouter)
// hotel: rooms and bookings (the admin panel and the storefront both use these)
app.use("/api/room",roomRouter)
app.use("/api/booking",bookingRouter)
// website contact form + newsletter (read in the admin panel)
app.use("/api/contact",contactRouter)

app.get("/",(req,res)=>{
    res.send("API Working")
})

// upload / unexpected errors (e.g. wrong file type, file too large)
app.use((err,req,res,next)=>{
    console.log(err.message);
    const message = err.code === "LIMIT_FILE_SIZE" ? "Each photo must be 5 MB or smaller"
        : err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT" ? "A room can have up to 8 photos"
        : err.message || "Error";
    res.status(400).json({success:false,message})
})

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})
