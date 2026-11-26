import { createContext, useEffect, useMemo, useState } from "react";
import axios from "axios"
import { shuffle } from "../utils/shuffle";

export const StoreContext = createContext(null)

// VITE_API_URL wins when it is set at build time. Production builds fall back to the deployed API
// (never localhost), and local `npm run dev` falls back to the local server.
const DEPLOYED_API = "https://primestay-backend-d4lq.onrender.com";
const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEPLOYED_API : "http://localhost:4000")).replace(/\/+$/,"");
const DAY = 24*60*60*1000;

// YYYY-MM-DD in the visitor's own timezone
export const toISO = (d) => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
export const addDaysISO = (iso,n) => toISO(new Date(new Date(iso+"T00:00:00Z").getTime() + n*DAY + new Date().getTimezoneOffset()*60000));
export const nightsBetween = (a,b) => (a && b) ? Math.round((new Date(b+"T00:00:00Z") - new Date(a+"T00:00:00Z"))/DAY) : 0;

const defaultStay = () => {
    const today = toISO(new Date());
    return {checkIn:addDaysISO(today,1),checkOut:addDaysISO(today,2),guests:2};
}
const loadStay = () => {
    try {
        const saved = JSON.parse(localStorage.getItem("stay"));
        if (saved?.checkIn >= toISO(new Date()) && nightsBetween(saved.checkIn,saved.checkOut) > 0) return saved;
    } catch { /* ignore */ }
    return defaultStay();
}

const StoreContextProvider = (props) => {

    // cartItems = {roomId: number of rooms}. The name is kept so the rest of the app keeps working.
    const [cartItems,setCartItems] = useState({});
    const url = API_URL;
    const [token,setToken] = useState(()=>localStorage.getItem("token") || "");
    const [food_list,setFoodList] = useState([]);       // the rooms
    const [ready,setReady] = useState(false);
    const [stay,setStayState] = useState(loadStay);
    const [availability,setAvailability] = useState({}); // {roomId: rooms free for the chosen dates}
    const [ratings,setRatings] = useState({});           // {roomId: {average,count}} from guest reviews

    const nights = nightsBetween(stay.checkIn,stay.checkOut);
    const setStay = (patch) => setStayState((prev)=>{
        const next = {...prev,...patch};
        // keep check-out after check-in
        if (nightsBetween(next.checkIn,next.checkOut) < 1) next.checkOut = addDaysISO(next.checkIn,1);
        localStorage.setItem("stay",JSON.stringify(next));
        return next;
    });

    const authConfig = (t = token) => ({headers:{Authorization:`Bearer ${t}`}});

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setCartItems({});
    }

    const handleAuthError = (error) => {
        if (error.response?.status === 401) logout();
    }

    // rooms still free for the chosen dates (Infinity until we know)
    const roomsLeft = (id) => availability[id] ?? Infinity;

    const addToCart = async (itemId) => {
        if ((cartItems[itemId]||0) >= roomsLeft(itemId)) return;
        setCartItems((prev)=>({...prev,[itemId]:(prev[itemId]||0)+1}))
        if (token) {
            try {
                await axios.post(url+"/api/cart/add",{itemId},authConfig());
            } catch (error) {
                handleAuthError(error);
            }
        }
    }

    const removeFromCart = async (itemId) => {
        setCartItems((prev)=>{
            const next = {...prev};
            if (next[itemId] > 1) next[itemId] -= 1;
            else delete next[itemId];
            return next;
        })
        if (token) {
            try {
                await axios.post(url+"/api/cart/remove",{itemId},authConfig());
            } catch (error) {
                handleAuthError(error);
            }
        }
    }

    // take a room out of the stay completely (the X on a cart row)
    const clearFromCart = async (itemId) => {
        setCartItems((prev)=>{
            const next = {...prev};
            delete next[itemId];
            return next;
        })
        if (token) {
            try {
                await axios.post(url+"/api/cart/remove",{itemId,all:true},authConfig());
            } catch (error) {
                handleAuthError(error);
            }
        }
    }

    // price of the selected rooms for ONE night
    const getNightlyTotal = () => {
        let total = 0;
        for (const id in cartItems) {
            const room = food_list.find((r) => r._id === id);
            if (room && cartItems[id] > 0) total += room.price * cartItems[id];
        }
        return total;
    }
    // whole stay (nightly total x nights)
    const getTotalCartAmount = () => getNightlyTotal() * nights;
    const guestCapacity = () => food_list.reduce((sum,r)=>sum + (cartItems[r._id]||0)*(r.maxGuests||2),0);

    const fetchRooms = async () => {
        try {
            const response = await axios.get(url+"/api/room/list");
            const rooms = response.data.data;
            setFoodList(shuffle(rooms))
            // rooms the admin has removed must not stay in a saved cart
            const alive = new Set(rooms.map((r)=>r._id));
            setCartItems((prev)=>{
                const ids = Object.keys(prev);
                return ids.every((id)=>alive.has(id)) ? prev : Object.fromEntries(Object.entries(prev).filter(([id])=>alive.has(id)));
            });
        } catch (error) {
            console.log(error);
        }
    }

    // average stars + review count per room (hidden reviews are already left out by the server)
    const fetchRatings = async () => {
        try {
            const response = await axios.get(url+"/api/review/summary");
            if (response.data.success) setRatings(response.data.data || {});
        } catch (error) {
            console.log(error);
        }
    }

    // overall figure for the whole hotel (null until somebody has left a review)
    const hotelRating = () => {
        let count = 0, total = 0;
        for (const id in ratings) {
            if (!food_list.some((r)=>r._id === id)) continue;
            count += ratings[id].count;
            total += ratings[id].average * ratings[id].count;
        }
        return count ? {average:Math.round(total/count*10)/10,count} : null;
    }

    // refresh availability whenever the dates change
    useEffect(()=>{
        let cancelled = false;
        axios.get(url+"/api/booking/availability",{params:{checkIn:stay.checkIn,checkOut:stay.checkOut}})
            .then((res)=>{ if (!cancelled && res.data.success) setAvailability(res.data.data); })
            .catch(()=>{});
        return ()=>{ cancelled = true; };
    },[stay.checkIn,stay.checkOut,food_list.length]);

    const loadCartData = async (t) => {
        try {
            const response = await axios.post(url+"/api/cart/get",{},authConfig(t));
            if (response.data.success) setCartItems(response.data.cartData || {});
        } catch (error) {
            handleAuthError(error);
        }
    }

    const login = async (newToken) => {
        localStorage.setItem("token",newToken);
        setToken(newToken);
        try {
            const response = await axios.post(url+"/api/cart/merge",{items:cartItems},authConfig(newToken));
            if (response.data.success) setCartItems(response.data.cartData || {});
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        async function loadData() {
            await Promise.all([fetchRooms(),fetchRatings()]);
            const stored = localStorage.getItem("token");
            if (stored) await loadCartData(stored);
            setReady(true);
        }
        loadData();
    },[])

    const contextValue = useMemo(()=>({
        food_list, cartItems, setCartItems, addToCart, removeFromCart, clearFromCart,
        getTotalCartAmount, getNightlyTotal, guestCapacity,
        stay, setStay, nights, roomsLeft,
        ratings, fetchRatings, hotelRating, handleAuth: handleAuthError,
        url, token, setToken, login, logout, ready, authConfig
    }));

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;
