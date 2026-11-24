import express from 'express';
import { addRoom, listRooms, removeRoom, updateRoom } from "../controllers/roomController.js";
import { adminMiddleware } from "../middleware/auth.js";
import multer from 'multer';

const roomRouter = express.Router();

const upload = multer({
    storage:multer.memoryStorage(), // saved to MongoDB by the controller, not to disk
    limits:{fileSize:5*1024*1024,files:9},
    fileFilter:(req,file,cb)=>{
        if (file.mimetype.startsWith("image/")) return cb(null,true);
        cb(new Error("Only image files are allowed"));
    }
})

// `images` = the gallery (up to 8); `image` is still accepted for a single cover photo
const photos = upload.fields([{name:"images",maxCount:8},{name:"image",maxCount:1}]);

roomRouter.post("/add",adminMiddleware,photos,addRoom)
roomRouter.get("/list",listRooms)
roomRouter.post("/update",adminMiddleware,photos,updateRoom)
roomRouter.post("/remove",adminMiddleware,removeRoom);

export default roomRouter;
