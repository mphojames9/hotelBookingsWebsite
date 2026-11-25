import React, { useContext } from 'react';
import './StayPicker.css';
import { StoreContext, addDaysISO, toISO } from '../../context/StoreContext';

// Check-in / check-out / guests. Used on the home page and in the cart.
const StayPicker = ({className=''}) => {
  const { stay, setStay, nights } = useContext(StoreContext);
  const today = toISO(new Date());

  return (
    <div className={`stay-picker ${className}`}>
      <label className="stay-field">
        <span>Check-in</span>
        <input type="date" min={today} value={stay.checkIn} onChange={(e)=>e.target.value && setStay({checkIn:e.target.value})} />
      </label>
      <label className="stay-field">
        <span>Check-out</span>
        <input type="date" min={addDaysISO(stay.checkIn,1)} value={stay.checkOut} onChange={(e)=>e.target.value && setStay({checkOut:e.target.value})} />
      </label>
      <label className="stay-field stay-guests">
        <span>Guests</span>
        <input type="number" min="1" max="20" value={stay.guests} onChange={(e)=>setStay({guests:Math.max(1,Math.min(20,parseInt(e.target.value)||1))})} />
      </label>
      <p className="stay-nights">{nights} {nights===1?'night':'nights'}</p>
    </div>
  );
}

export default StayPicker;
