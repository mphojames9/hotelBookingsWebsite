import Stripe from "stripe";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import { priceOrder } from "../config/promos.js";

const DELIVERY_FEE = 40; // keep in sync with frontend/src/context/StoreContext.jsx
const STATUSES = ["Processing","Out for delivery","Delivered"];
const ADDRESS_FIELDS = ["firstName","lastName","email","street","city","province","zipCode","country","phone"];

const getStripe = () => process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const frontendUrl = () => (process.env.FRONTEND_URL || "http://localhost:5173/shopping-cart").replace(/\/$/,"");

// prices always come from the database, never from the browser. Returns null if anything is unavailable.
const buildLines = async (items) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    const foods = await foodModel.find({_id:{$in:items.map(i => i.id)}});
    const lines = [];
    for (const item of items) {
        const food = foods.find(f => String(f._id) === String(item.id));
        const quantity = Number(item.quantity);
        if (!food || !Number.isInteger(quantity) || quantity < 1) return null;
        lines.push({foodId:String(food._id),name:food.name,price:food.price,quantity});
    }
    return lines;
}
const subtotalOf = (lines) => lines.reduce((sum,l) => sum + l.price * l.quantity,0);

// anyone: check a promo code against the cart (the order itself is re-priced again in placeOrder)
const checkPromo = async (req,res) => {
    try {
        const lines = await buildLines(req.body.items);
        if (!lines) return res.json({success:false,message:"Your cart is empty"})
        const priced = priceOrder(subtotalOf(lines),req.body.code,DELIVERY_FEE);
        if (!priced.ok) return res.json({success:false,message:priced.message})
        res.json({success:true,code:priced.code,label:priced.label,discount:priced.discount,delivery:priced.delivery,total:priced.total})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Could not check that code"})
    }
}

// customer: create the order and a Stripe Checkout session
const placeOrder = async (req,res) => {
    let newOrder;
    try {
        const stripe = getStripe();
        if (!stripe) {
            return res.status(503).json({success:false,message:"Payments are not configured yet"})
        }

        const {items,address} = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({success:false,message:"Your cart is empty"})
        }
        if (!address || ADDRESS_FIELDS.some(f => !String(address[f] ?? "").trim())) {
            return res.status(400).json({success:false,message:"Please fill in all delivery details"})
        }
        const cleanAddress = Object.fromEntries(ADDRESS_FIELDS.map(f => [f,String(address[f]).trim()]));

        const lines = await buildLines(items);
        if (!lines) {
            return res.status(400).json({success:false,message:"One or more items are no longer available"})
        }

        // products with a stock count cannot be ordered beyond what is left
        const stocked = await foodModel.find({_id:{$in:lines.map(l => l.foodId)}},"name stock");
        for (const line of lines) {
            const food = stocked.find(f => String(f._id) === line.foodId);
            if (food && typeof food.stock === "number" && line.quantity > food.stock) {
                const message = food.stock === 0
                    ? `${food.name} is sold out. Please remove it from your cart.`
                    : `Only ${food.stock} of ${food.name} left. Please lower the quantity.`;
                return res.status(400).json({success:false,message})
            }
        }

        const priced = priceOrder(subtotalOf(lines),req.body.promoCode,DELIVERY_FEE);
        if (!priced.ok) {
            return res.status(400).json({success:false,message:priced.message})
        }
        const amount = priced.total;

        newOrder = await orderModel.create({userId:req.userId,items:lines,amount,address:cleanAddress,promoCode:priced.code,discount:priced.discount});

        // Stripe cannot take negative line items, so the discount goes in as a one-off coupon
        const coupon = priced.discount > 0
            ? await stripe.coupons.create({amount_off:Math.round(priced.discount*100),currency:"zar",duration:"once",name:priced.code})
            : null;

        const session = await stripe.checkout.sessions.create({
            mode:"payment",
            payment_method_types:["card"],
            customer_email:cleanAddress.email,
            line_items:[
                ...lines.map(l => ({
                    price_data:{currency:"zar",product_data:{name:l.name},unit_amount:Math.round(l.price*100)},
                    quantity:l.quantity
                })),
                ...(priced.delivery > 0 ? [{price_data:{currency:"zar",product_data:{name:"Delivery Fee"},unit_amount:priced.delivery*100},quantity:1}] : [])
            ],
            ...(coupon ? {discounts:[{coupon:coupon.id}]} : {}),
            success_url:`${frontendUrl()}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${frontendUrl()}/verify?success=false&orderId=${newOrder._id}`
        });

        newOrder.stripeSessionId = session.id;
        await newOrder.save();
        res.json({success:true,session_url:session.url})
    } catch (error) {
        console.log(error);
        if (newOrder) await orderModel.findByIdAndDelete(newOrder._id).catch(()=>{});
        res.status(500).json({success:false,message:"Could not start payment"})
    }
}

// customer: called when Stripe sends them back. Payment is checked with Stripe, not the URL.
const verifyOrder = async (req,res) => {
    try {
        const order = await orderModel.findById(req.body.orderId);
        if (!order || order.userId !== req.userId) {
            return res.status(404).json({success:false,message:"Order not found"})
        }
        if (order.payment) {
            return res.json({success:true,message:"Paid"})
        }

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        if (session.payment_status === "paid") {
            order.payment = true;
            await order.save();
            // take the units off the shelf (never below 0; products without a stock count are skipped)
            for (const line of order.items) {
                await foodModel.updateOne(
                    {_id:line.foodId,stock:{$type:"number"}},
                    [{$set:{stock:{$max:[0,{$subtract:["$stock",line.quantity]}]}}}]
                ).catch(()=>{});
            }
            await userModel.findByIdAndUpdate(req.userId,{cartData:{}});
            return res.json({success:true,message:"Paid"})
        }

        if (session.status === "open") {
            await stripe.checkout.sessions.expire(session.id).catch(()=>{});
        }
        await orderModel.findByIdAndDelete(order._id);
        res.json({success:false,message:"Payment was not completed"})
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:"Error"})
    }
}

// customer: their paid orders
const userOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({userId:req.userId,payment:true}).sort({date:-1});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// admin: all paid orders
const listOrders = async (req,res) => {
    try {
        const orders = await orderModel.find({payment:true}).sort({date:-1});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// admin: change an order's status
const updateStatus = async (req,res) => {
    try {
        const {orderId,status} = req.body;
        if (!STATUSES.includes(status)) {
            return res.json({success:false,message:"Invalid status"})
        }
        const order = await orderModel.findById(orderId);
        if (!order) return res.json({success:false,message:"Order not found"})
        if (order.status !== status) {
            // keep a dated record of every change, so customers can see when each step happened
            order.statusHistory = [...(order.statusHistory || []),{status,at:new Date()}];
            order.status = status;
            await order.save();
        }
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export {checkPromo,placeOrder,verifyOrder,userOrders,listOrders,updateStatus}
