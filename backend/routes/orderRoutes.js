import express from "express";
import { checkPromo,placeOrder,verifyOrder,userOrders,listOrders,updateStatus } from "../controllers/orderController.js";
import { authMiddleware,adminMiddleware } from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post("/promo",checkPromo);
orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",authMiddleware,verifyOrder);
orderRouter.get("/userorders",authMiddleware,userOrders);
orderRouter.get("/list",adminMiddleware,listOrders);
orderRouter.post("/status",adminMiddleware,updateStatus);

export default orderRouter;
