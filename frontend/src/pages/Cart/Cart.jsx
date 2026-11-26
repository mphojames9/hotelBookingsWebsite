import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import StayPicker from '../../components/StayPicker/StayPicker';
import { Link, useNavigate } from 'react-router-dom';
import OrderSummary from '../../components/OrderSummary/OrderSummary';
import { formatPrice } from '../../utils/format';
import { CartIcon, CloseIcon, MinusIcon, PlusIcon } from '../../components/Icons';

const Cart = ({setShowLogin}) => {

  const { cartItems, food_list, addToCart, removeFromCart, clearFromCart, roomsLeft, getTotalCartAmount, guestCapacity, stay, nights, url, token, ready } = useContext(StoreContext)

  const navigate = useNavigate();

  const items = food_list.filter((item) => cartItems[item._id] > 0);
  const subtotal = getTotalCartAmount();
  const count = items.reduce((sum, item) => sum + cartItems[item._id], 0);

  const checkout = () => {
    if (subtotal === 0) return;
    const short = items.find((item) => cartItems[item._id] > roomsLeft(item._id));
    if (short) {
      const free = Math.max(0, roomsLeft(short._id));
      alert(`Only ${free} "${short.name}" room(s) are free for these dates. Please reduce the number of rooms or change your dates.`);
      return;
    }
    if (guestCapacity() < stay.guests) {
      alert(`The rooms you chose sleep ${guestCapacity()} guest(s). Add another room for ${stay.guests} guests.`);
      return;
    }
    if (!token) {
      setShowLogin(true);
      return;
    }
    navigate('/placeOder');
  }

  // wait for the saved cart to load so we do not flash "empty"
  if (!ready) {
    return <div className='cart page'><h1>Your stay</h1></div>;
  }

  if (items.length === 0) {
    return (
      <div className='cart cart-empty page'>
        <span className="cart-empty-icon"><CartIcon /></span>
        <h1>No rooms selected</h1>
        <p>Pick your dates and choose a room to start your booking.</p>
        <Link to='/' state={{scrollTo:'food-display'}} className="btn btn-primary">Browse rooms</Link>
      </div>
    );
  }

  return (
    <div className='cart page'>
      <div className="cart-head">
        <h1>Your stay</h1>
        <p>{count} {count === 1 ? 'room' : 'rooms'} &middot; {nights} {nights === 1 ? 'night' : 'nights'}</p>
      </div>
      <StayPicker className="in-cart" />
      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item, i) => (
            <li key={item._id} className="cart-row" style={{'--i': i}}>
              <div className="cart-thumb"><img src={url+"/images/"+item.image} alt='' /></div>
              <div className="cart-name">
                <h3>{item.name}</h3>
                <p>{formatPrice(item.price)} per night &middot; sleeps {item.maxGuests || 2}</p>
                {cartItems[item._id] > roomsLeft(item._id) && <p className="cart-warn" role="alert">{roomsLeft(item._id) <= 0 ? 'Sold out for these dates' : `Only ${roomsLeft(item._id)} left for these dates`}</p>}
              </div>
              <div className="stepper">
                <button type="button" aria-label={`Remove one ${item.name} room`} onClick={() => removeFromCart(item._id)}><MinusIcon /></button>
                <span key={cartItems[item._id]} aria-live="polite">{cartItems[item._id]}</span>
                <button type="button" aria-label={`Add one more ${item.name} room`} onClick={() => addToCart(item._id)}><PlusIcon /></button>
              </div>
              <strong className="cart-line">{formatPrice(item.price * cartItems[item._id] * nights)}</strong>
              <button type="button" className="cart-remove" aria-label={`Remove ${item.name} from your stay`} title="Remove" onClick={() => clearFromCart(item._id)}><CloseIcon /></button>
            </li>
          ))}
        </ul>
        <OrderSummary note="You pay by card on Stripe's secure page. Free cancellation up to 48 hours before check-in.">
          <button type="button" className="btn btn-primary btn-block cart-checkout" onClick={checkout}>
            {token ? 'Continue to booking' : 'Sign in to book'}
          </button>
        </OrderSummary>
      </div>

      {/* phones: total and checkout stay within thumb reach */}
      <div className="cart-bar">
        <div>
          <small>Total for {nights} {nights === 1 ? 'night' : 'nights'}</small>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <button type="button" className="btn btn-primary" onClick={checkout}>
          {token ? 'Book' : 'Sign in'}
        </button>
      </div>
    </div>
  );
}

export default Cart;
