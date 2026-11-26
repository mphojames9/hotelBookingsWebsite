import Stripe from "stripe";
import mongoose from "mongoose";
import bookingModel from "../models/bookingModel.js";
import userModel from "../models/userModel.js";
import roomModel from "../models/roomModel.js";

const STATUSES = ["Confirmed","Checked in","Checked out","Cancelled"];
const GUEST_FIELDS = ["firstName","lastName","email","phone","country"];
const DAY = 24*60*60*1000;
const MAX_NIGHTS = 30;
// Stripe only accepts a Checkout Session that lasts at least 30 minutes from the moment it receives the request,
// so the session is created for 31 minutes. Unpaid bookings keep their rooms a minute longer than that.
const SESSION_MINUTES = 31;
const PENDING_HOLD_MS = (SESSION_MINUTES + 1)*60*1000;

const getStripe = () => process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
// where Stripe sends guests back to: the storefront root, e.g. https://primestay-boqi.onrender.com
// (a trailing slash or an old "/shopping-cart" suffix is ignored)
const frontendUrl = () => (process.env.FRONTEND_URL || "http://localhost:5173").trim().replace(/\/+$/,"").replace(/\/shopping-cart$/,"");

// dates arrive as YYYY-MM-DD; treated as UTC midnight so a night is exactly one day
const parseDay = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s)) ? new Date(`${s}T00:00:00Z`) : null;

// the most rooms of one type already taken on any single night between checkIn and checkOut
const roomsTaken = async (roomId,checkIn,checkOut) => {
    const holdCutoff = new Date(Date.now() - PENDING_HOLD_MS);
    const overlapping = await bookingModel.find({
        "items.roomId":String(roomId),
        status:{$ne:"Cancelled"},
        checkIn:{$lt:checkOut},
        checkOut:{$gt:checkIn},
        $or:[{payment:true},{date:{$gt:holdCutoff}}]
    });
    let worst = 0;
    for (let d = new Date(checkIn); d < checkOut; d = new Date(+d + DAY)) {
        let used = 0;
        for (const b of overlapping) {
            if (b.checkIn <= d && b.checkOut > d) {
                used += b.items.filter(i => i.roomId === String(roomId)).reduce((s,i) => s + i.quantity,0);
            }
        }
        worst = Math.max(worst,used);
    }
    return worst;
}

// public: how many rooms of each type are free for these dates
const availability = async (req,res) => {
    try {
        const checkIn = parseDay(req.query.checkIn), checkOut = parseDay(req.query.checkOut);
        if (!checkIn || !checkOut || checkOut <= checkIn) return res.json({success:false,message:"Invalid dates"})
        const rooms = await roomModel.find({});
        const data = {};
        for (const room of rooms) data[room._id] = Math.max(0,room.totalRooms - await roomsTaken(room._id,checkIn,checkOut));
        res.json({success:true,data})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// customer: validate dates + availability, create the booking and a Stripe Checkout session
const placeBooking = async (req,res) => {
    let booking;
    try {
        const stripe = getStripe();
        if (!stripe) return res.status(503).json({success:false,message:"Payments are not configured yet"})

        const {items,guest,checkIn:inStr,checkOut:outStr} = req.body;
        const guests = Number(req.body.guests);
        const checkIn = parseDay(inStr), checkOut = parseDay(outStr);
        const today = new Date(); today.setUTCHours(0,0,0,0);

        if (!Array.isArray(items) || items.length === 0) return res.status(400).json({success:false,message:"Please choose at least one room"})
        if (!checkIn || !checkOut || checkIn < today || checkOut <= checkIn) return res.status(400).json({success:false,message:"Please choose valid check-in and check-out dates"})
        const nights = Math.round((checkOut - checkIn)/DAY);
        if (nights > MAX_NIGHTS) return res.status(400).json({success:false,message:`Stays are limited to ${MAX_NIGHTS} nights`})
        if (!Number.isInteger(guests) || guests < 1) return res.status(400).json({success:false,message:"Please enter the number of guests"})
        if (!guest || GUEST_FIELDS.some(f => !String(guest[f] ?? "").trim())) return res.status(400).json({success:false,message:"Please fill in all guest details"})
        const cleanGuest = Object.fromEntries(GUEST_FIELDS.map(f => [f,String(guest[f]).trim()]));
        cleanGuest.requests = String(guest.requests ?? "").trim().slice(0,300);

        // rates always come from the database, never from the browser
        const ids = items.map(i => i.id).filter(id => mongoose.isValidObjectId(id));
        const rooms = await roomModel.find({_id:{$in:ids}});
        const lines = [];
        let capacity = 0;
        for (const item of items) {
            const room = rooms.find(r => String(r._id) === String(item.id));
            const quantity = Number(item.quantity);
            if (!room || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({success:false,message:"One or more rooms are no longer available"})
            const free = room.totalRooms - await roomsTaken(room._id,checkIn,checkOut);
            if (quantity > free) return res.status(409).json({success:false,message:`Only ${Math.max(0,free)} "${room.name}" room(s) left for those dates`})
            capacity += room.maxGuests * quantity;
            lines.push({roomId:String(room._id),name:room.name,location:room.location || "",price:room.price,quantity});
        }
        if (guests > capacity) return res.status(400).json({success:false,message:`The rooms you chose sleep ${capacity} guest(s) in total`})

        const amount = lines.reduce((sum,l) => sum + l.price * l.quantity,0) * nights;
        booking = await bookingModel.create({userId:req.userId,items:lines,checkIn,checkOut,nights,guests,amount,guest:cleanGuest});

        const session = await stripe.checkout.sessions.create({
            mode:"payment",
            payment_method_types:["card"],
            customer_email:cleanGuest.email,
            expires_at:Math.floor(Date.now()/1000) + SESSION_MINUTES*60,
            line_items:lines.map(l => ({
                price_data:{currency:"zar",product_data:{name:`${l.name}: ${nights} night${nights>1?"s":""}, ${inStr} to ${outStr}`},unit_amount:Math.round(l.price*nights*100)},
                quantity:l.quantity
            })),
            success_url:`${frontendUrl()}/#/verify?success=true&bookingId=${booking._id}`,
            cancel_url:`${frontendUrl()}/#/verify?success=false&bookingId=${booking._id}`
        });

        booking.stripeSessionId = session.id;
        await booking.save();
        res.json({success:true,session_url:session.url})
    } catch (error) {
        console.log(error);
        if (booking) await bookingModel.findByIdAndDelete(booking._id).catch(()=>{});
        res.status(500).json({success:false,message:"Could not start payment"})
    }
}

// customer: called when Stripe sends them back. Payment is checked with Stripe, not the URL.
const verifyBooking = async (req,res) => {
    try {
        const booking = await bookingModel.findById(req.body.bookingId);
        if (!booking || booking.userId !== req.userId) return res.status(404).json({success:false,message:"Booking not found"})
        if (booking.payment) return res.json({success:true,message:"Paid"})

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
        if (session.payment_status === "paid") {
            booking.payment = true;
            await booking.save();
            await userModel.findByIdAndUpdate(req.userId,{cartData:{}});
            return res.json({success:true,message:"Paid"})
        }
        if (session.status === "open") await stripe.checkout.sessions.expire(session.id).catch(()=>{});
        await bookingModel.findByIdAndDelete(booking._id);
        res.json({success:false,message:"Payment was not completed"})
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:"Error"})
    }
}

const userBookings = async (req,res) => {
    try {
        res.json({success:true,data:await bookingModel.find({userId:req.userId,payment:true}).sort({checkIn:-1})})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// customer: cancel up to 48 hours before check-in (any refund is handled by the hotel in Stripe)
const cancelBooking = async (req,res) => {
    try {
        const booking = await bookingModel.findById(req.body.bookingId);
        if (!booking || booking.userId !== req.userId) return res.json({success:false,message:"Booking not found"})
        if (booking.status !== "Confirmed") return res.json({success:false,message:"This booking can no longer be cancelled"})
        if (booking.checkIn - Date.now() < 48*60*60*1000) return res.json({success:false,message:"Bookings can only be cancelled up to 48 hours before check-in"})
        booking.status = "Cancelled";
        await booking.save();
        res.json({success:true,message:"Booking cancelled"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const listBookings = async (req,res) => {
    try {
        res.json({success:true,data:await bookingModel.find({payment:true}).sort({checkIn:-1})})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

const updateStatus = async (req,res) => {
    try {
        const {bookingId,status} = req.body;
        if (!STATUSES.includes(status)) return res.json({success:false,message:"Invalid status"})
        await bookingModel.findByIdAndUpdate(bookingId,{status});
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

export {availability,placeBooking,verifyBooking,userBookings,cancelBooking,listBookings,updateStatus}
