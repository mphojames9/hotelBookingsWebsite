import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatPrice } from '../../utils/format';
import { PackageIcon } from '../../components/Icons';

const statusClass = (status) =>
  status === 'Checked out' ? 'done' : status === 'Checked in' ? 'moving' : 'pending';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});

const MyOrders = ({setShowLogin}) => {

  const {url,token,authConfig} = useContext(StoreContext);
  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(url+"/api/booking/mybookings",authConfig());
      if (response.data.success) setData(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const cancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      const response = await axios.post(url+"/api/booking/cancel",{bookingId},authConfig());
      if (!response.data.success) alert(response.data.message);
      fetchBookings();
    } catch (error) {
      alert("Could not cancel the booking. Please try again.");
    }
  }

  useEffect(()=>{
    if (token) fetchBookings();
    else setLoading(false);
  },[token])

  if (!token) {
    return (
      <div className='orders orders-message page'>
        <span className="orders-icon"><PackageIcon /></span>
        <h1>My bookings</h1>
        <p>Sign in to see your bookings.</p>
        <button type="button" className="btn btn-primary" onClick={()=>setShowLogin(true)}>Sign in</button>
      </div>
    );
  }

  const canCancel = (b) => b.status === 'Confirmed' && new Date(b.checkIn) - Date.now() >= 48*60*60*1000;

  return (
    <div className='orders page'>
      <div className="orders-head">
        <h1>My bookings</h1>
        <button type="button" className="btn btn-ghost btn-sm" onClick={fetchBookings}>Refresh status</button>
      </div>

      {loading
        ? <div className="orders-list" aria-busy="true" aria-label="Loading your bookings">
            {Array.from({length:3}).map((_,i)=><div key={i} className="order-skeleton" />)}
          </div>
        : data.length === 0
          ? <div className="orders-message">
              <span className="orders-icon"><PackageIcon /></span>
              <p>You have no bookings yet.</p>
              <Link to='/' state={{scrollTo:'food-display'}} className="btn btn-primary">Find a room</Link>
            </div>
          : <ul className="orders-list">
              {data.map((b,i)=>(
                <li key={b._id} className='order' style={{'--i':i}}>
                  <div className="order-meta">
                    <strong>{formatDate(b.checkIn)} &rarr; {formatDate(b.checkOut)}</strong>
                    <span>Booking #{String(b._id).slice(-6).toUpperCase()} &middot; {b.nights} {b.nights===1?'night':'nights'} &middot; {b.guests} {b.guests===1?'guest':'guests'}</span>
                  </div>
                  <p className="order-items">{b.items.map((item)=>`${item.name} × ${item.quantity}`).join(", ")}</p>
                  <strong className="order-amount">{formatPrice(b.amount)}</strong>
                  <span className={`status status-${statusClass(b.status)}`}>{b.status}</span>
                  {canCancel(b) && <button type="button" className="btn btn-ghost btn-sm" onClick={()=>cancel(b._id)}>Cancel</button>}
                </li>
              ))}
            </ul>
      }
    </div>
  );
}

export default MyOrders;
