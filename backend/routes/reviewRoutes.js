import express from "express";
import { ratingSummary,listReviews,myReview,addReview,removeReview,adminListReviews,adminHideReview,adminDeleteReview } from "../controllers/reviewController.js";
import { authMiddleware,adminMiddleware } from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.get("/summary",ratingSummary);
reviewRouter.get("/list",listReviews);
reviewRouter.post("/mine",authMiddleware,myReview);
reviewRouter.post("/add",authMiddleware,addReview);
reviewRouter.post("/remove",authMiddleware,removeReview);

// admin moderation
reviewRouter.get("/admin",adminMiddleware,adminListReviews);
reviewRouter.post("/admin/hide",adminMiddleware,adminHideReview);
reviewRouter.post("/admin/delete",adminMiddleware,adminDeleteReview);

export default reviewRouter;
