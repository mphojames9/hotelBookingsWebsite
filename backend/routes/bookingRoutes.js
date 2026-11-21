import express from "express";
import { availability,placeBooking,verifyBooking,userBookings,cancelBooking,listBookings,updateStatus } from "../controllers/bookingController.js";
import { authMiddleware,adminMiddleware } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.get("/availability",availability);
bookingRouter.post("/place",authMiddleware,placeBooking);
bookingRouter.post("/verify",authMiddleware,verifyBooking);
bookingRouter.post("/cancel",authMiddleware,cancelBooking);
bookingRouter.get("/mybookings",authMiddleware,userBookings);
bookingRouter.get("/list",adminMiddleware,listBookings);
bookingRouter.post("/status",adminMiddleware,updateStatus);

export default bookingRouter;
