import { createContext, useEffect, useState } from "react";
import axios from "axios"
import { shuffle } from "../utils/shuffle";
import { stockLeft } from "../utils/stock";

export const StoreContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const DELIVERY_FEE = 40; // keep in sync with backend/controllers/orderController.js

const StoreContextProvider = (props) => {

    const [cartItems,setCartItems] = useState({});
    const url = API_URL;
    const [token,setToken] = useState(()=>localStorage.getItem("token") || "");
    const [food_list,setFoodList] = useState([]);
    const [ready,setReady] = useState(false); // products + saved cart finished loading
    const [promo,setPromo] = useState(null);   // {code,label,discount,delivery} once a code has been accepted
    const [promoNotice,setPromoNotice] = useState(""); // why a code was dropped

    // saved products: kept on this device so guests can use it too
    const [wishlist,setWishlist] = useState(()=>{
        try {
            const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
            return Array.isArray(saved) ? saved.filter((id)=>typeof id === "string") : [];
        } catch (error) { return []; }
    });
    useEffect(()=>{
        try { localStorage.setItem("wishlist",JSON.stringify(wishlist)); } catch (error) { /* storage blocked: still works for this visit */ }
    },[wishlist]);
    const toggleWishlist = (id) => setWishlist((prev)=>prev.includes(id) ? prev.filter((x)=>x!==id) : [id,...prev]);

    // products opened in the product sheet, newest first (kept on this device, at most 8)
    const RECENT_MAX = 8;
    const [recent,setRecent] = useState(()=>{
        try {
            const saved = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
            return Array.isArray(saved) ? saved.filter((id)=>typeof id === "string").slice(0,RECENT_MAX) : [];
        } catch (error) { return []; }
    });
    useEffect(()=>{
        try { localStorage.setItem("recentlyViewed",JSON.stringify(recent)); } catch (error) { /* storage blocked: still works for this visit */ }
    },[recent]);
    const trackView = (id) => setRecent((prev)=>prev[0] === id ? prev : [id,...prev.filter((x)=>x !== id)].slice(0,RECENT_MAX));
    const clearRecent = () => setRecent([]);

    // average rating and review count per product: { [productId]: {average,count} }
    const [ratings,setRatings] = useState({});
    const refreshRatings = async () => {
        try {
            const response = await axios.get(API_URL+"/api/review/summary");
            if (response.data.success) setRatings(response.data.data || {});
        } catch (error) { /* ratings are optional: the shop still works without them */ }
    }

    const authConfig = (t = token) => ({headers:{Authorization:`Bearer ${t}`}});

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setCartItems({});
    }

    // expired token -> log the user out
    const handleAuthError = (error) => {
        if (error.response?.status === 401) logout();
    }

    const addToCart = async (itemId) => {
        // never put more in the cart than is in stock
        const left = stockLeft(food_list.find((product)=>product._id === itemId));
        if (left !== null && (cartItems[itemId] || 0) >= left) return;
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

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    }

    const cartLines = () => food_list
        .filter((product) => cartItems[product._id] > 0)
        .map((product) => ({id:product._id,quantity:cartItems[product._id]}));

    // the server works out every discount; the browser only shows what it says
    const applyPromo = async (code) => {
        const items = cartLines();
        if (items.length === 0) return {ok:false,message:"Your cart is empty"};
        try {
            const response = await axios.post(url+"/api/order/promo",{code,items});
            if (!response.data.success) return {ok:false,message:response.data.message || "That promo code is not valid"};
            const {code:accepted,label,discount,delivery} = response.data;
            setPromo({code:accepted,label,discount,delivery});
            setPromoNotice("");
            return {ok:true};
        } catch (error) {
            return {ok:false,message:"Could not check that code. Please try again."};
        }
    }

    const removePromo = () => { setPromo(null); setPromoNotice(""); }

    // subtotal, discount, delivery and total as the shopper should see them
    const getOrderTotals = () => {
        const subtotal = getTotalCartAmount();
        const discount = promo ? Math.min(promo.discount,subtotal) : 0;
        const delivery = subtotal === 0 ? 0 : (promo && promo.delivery === 0 ? 0 : DELIVERY_FEE);
        return {subtotal,discount,delivery,total:subtotal-discount+delivery};
    }

    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url+"/api/food/list");
            // a fresh random order on every page load (stays stable while browsing)
            setFoodList(shuffle(response.data.data))
        } catch (error) {
            console.log(error);
        }
    }

    // page reload with a saved login: load the saved cart
    const loadCartData = async (t) => {
        try {
            const response = await axios.post(url+"/api/cart/get",{},authConfig(t));
            if (response.data.success) setCartItems(response.data.cartData || {});
        } catch (error) {
            handleAuthError(error);
        }
    }

    // fresh login / sign up: keep the token and merge any guest cart into the saved one
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
            await fetchFoodList();
            refreshRatings();
            const stored = localStorage.getItem("token");
            if (stored) await loadCartData(stored);
            setReady(true);
        }
        loadData();
    },[])

    // the cart changed: check the code again (a percentage or a minimum spend may no longer fit)
    const cartKey = JSON.stringify(cartItems);
    useEffect(()=>{
        if (!promo || !ready) return;
        if (getTotalCartAmount() === 0) { setPromo(null); return; }
        let stale = false;
        (async ()=>{
            try {
                const response = await axios.post(url+"/api/order/promo",{code:promo.code,items:cartLines()});
                if (stale) return;
                if (response.data.success) {
                    const {code,label,discount,delivery} = response.data;
                    setPromo({code,label,discount,delivery});
                } else {
                    setPromo(null);
                    setPromoNotice(response.data.message || "Your promo code was removed");
                }
            } catch (error) { /* offline: keep what we have, the server checks again at payment */ }
        })();
        return ()=>{ stale = true; };
    },[cartKey]);

    // newest first, and products that no longer exist are left out
    const wishlistItems = wishlist.map((id)=>food_list.find((product)=>product._id === id)).filter(Boolean);

    const recentItems = recent.map((id)=>food_list.find((product)=>product._id === id)).filter(Boolean);

    const contextValue = {
        ratings,
        refreshRatings,
        handleAuthError,
        recentItems,
        trackView,
        clearRecent,
        wishlist,
        wishlistItems,
        toggleWishlist,
        promo,
        promoNotice,
        applyPromo,
        removePromo,
        getOrderTotals,
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        login,
        logout,
        ready,
        authConfig
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;
