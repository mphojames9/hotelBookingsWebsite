import React, { useContext } from 'react';
import './OrderSummary.css';
import { StoreContext } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';

const longDate = (iso) => new Date(iso+"T00:00:00").toLocaleDateString('en-ZA',{weekday:'short',day:'numeric',month:'short'});

// Booking summary shared by the cart and checkout pages. The button goes in as children.
const OrderSummary = ({showItems=false, note, children}) => {

  const {food_list,cartItems,getNightlyTotal,getTotalCartAmount,stay,nights} = useContext(StoreContext);
  const items = food_list.filter((item)=>cartItems[item._id] > 0);

  return (
    <aside className='order-summary'>
      <h2>Booking summary</h2>
      <p className="summary-dates">{longDate(stay.checkIn)} &rarr; {longDate(stay.checkOut)} &middot; {stay.guests} {stay.guests===1?'guest':'guests'}</p>
      {showItems &&
        <ul className="summary-items">
          {items.map((item)=>(
            <li key={item._id}>
              <span>{item.name} <small>&times; {cartItems[item._id]}</small></span>
              <span>{formatPrice(item.price*cartItems[item._id])} / night</span>
            </li>
          ))}
        </ul>
      }
      <dl className="summary-lines">
        <div><dt>Per night</dt><dd>{formatPrice(getNightlyTotal())}</dd></div>
        <div><dt>Nights</dt><dd>&times; {nights}</dd></div>
        <div className="summary-total"><dt>Total</dt><dd>{formatPrice(getTotalCartAmount())}</dd></div>
      </dl>
      {children}
      {note && <p className="summary-note">{note}</p>}
    </aside>
  );
}

export default OrderSummary;
