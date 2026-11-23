import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import OrderSummary from '../../components/OrderSummary/OrderSummary';
import { formatPrice } from '../../utils/format';
import { stockLeft } from '../../utils/stock';
import { CartIcon, MinusIcon, PlusIcon } from '../../components/Icons';

const Cart = ({setShowLogin}) => {

  const { cartItems, food_list, addToCart, removeFromCart, getTotalCartAmount, getOrderTotals, url, token, ready } = useContext(StoreContext)

  const navigate = useNavigate();

  const items = food_list.filter((item) => cartItems[item._id] > 0);
  const subtotal = getTotalCartAmount();
  const count = items.reduce((sum, item) => sum + cartItems[item._id], 0);

  // items that are sold out, or where the cart holds more than is left
  const short = (item) => { const left = stockLeft(item); return left !== null && cartItems[item._id] > left; };
  const blocked = items.some(short);

  const checkout = () => {
    if (subtotal === 0 || blocked) return;
    if (!token) {
      setShowLogin(true);
      return;
    }
    navigate('/shopping-cart/placeOder');
  }

  // wait for the saved cart to load so we do not flash "empty"
  if (!ready) {
    return <div className='cart page'><h1>Your cart</h1></div>;
  }

  if (items.length === 0) {
    return (
      <div className='cart cart-empty page'>
        <span className="cart-empty-icon"><CartIcon /></span>
        <h1>Your cart is empty</h1>
        <p>Add something from the shop and it will show up here.</p>
        <Link to='/shopping-cart' state={{scrollTo:'food-display'}} className="btn btn-primary">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className='cart page'>
      <div className="cart-head">
        <h1>Your cart</h1>
        <p>{count} {count === 1 ? 'item' : 'items'}</p>
      </div>
      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item, i) => (
            <li key={item._id} className="cart-row" style={{'--i': i}}>
              <div className="cart-thumb"><img src={url+"/images/"+item.image} alt='' /></div>
              <div className="cart-name">
                <h3>{item.name}</h3>
                <p>{formatPrice(item.price)} each</p>
                {short(item) && <p className="cart-stock" role="alert">{stockLeft(item) === 0 ? 'Sold out. Please remove it.' : `Only ${stockLeft(item)} available. Lower the quantity.`}</p>}
              </div>
              <div className="stepper">
                <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => removeFromCart(item._id)}><MinusIcon /></button>
                <span key={cartItems[item._id]} aria-live="polite">{cartItems[item._id]}</span>
                <button type="button" aria-label={`Add one more ${item.name}`} disabled={stockLeft(item) !== null && cartItems[item._id] >= stockLeft(item)} onClick={() => addToCart(item._id)}><PlusIcon /></button>
              </div>
              <strong className="cart-line">{formatPrice(item.price * cartItems[item._id])}</strong>
            </li>
          ))}
        </ul>
        <OrderSummary note={blocked ? 'Some items are not available in the quantity you chose.' : "You will pay by card on Stripe's secure page."}>
          <button type="button" className="btn btn-primary btn-block cart-checkout" onClick={checkout} disabled={blocked}>
            {token ? 'Checkout' : 'Sign in to checkout'}
          </button>
        </OrderSummary>
      </div>

      {/* phones: total and checkout stay within thumb reach */}
      <div className="cart-bar">
        <div>
          <small>Total incl. delivery</small>
          <strong>{formatPrice(getOrderTotals().total)}</strong>
        </div>
        <button type="button" className="btn btn-primary" onClick={checkout} disabled={blocked}>
          {token ? 'Checkout' : 'Sign in'}
        </button>
      </div>
    </div>
  );
}

export default Cart;
