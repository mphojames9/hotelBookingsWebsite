import React, { useContext, useState } from 'react';
import './OrderSummary.css';
import { StoreContext } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';
import { CloseIcon, TagIcon } from '../Icons';

// Totals box shared by the cart and checkout pages. The button goes in as children.
const OrderSummary = ({showItems=false, note, children}) => {

  const {food_list,cartItems,promo,promoNotice,applyPromo,removePromo,getOrderTotals} = useContext(StoreContext);

  const {subtotal,discount,delivery,total} = getOrderTotals();
  const [code,setCode] = useState('');
  const [checking,setChecking] = useState(false);
  const [error,setError] = useState('');

  const submitCode = async (event) => {
    // this box sits inside the checkout <form>, so it must not submit that form
    event.preventDefault();
    event.stopPropagation();
    if (!code.trim() || checking) return;
    setChecking(true);
    setError('');
    const result = await applyPromo(code);
    setChecking(false);
    if (result.ok) setCode(''); else setError(result.message);
  }
  const items = food_list.filter((item)=>cartItems[item._id] > 0);

  return (
    <aside className='order-summary'>
      <h2>Order summary</h2>
      {showItems &&
        <ul className="summary-items">
          {items.map((item)=>(
            <li key={item._id}>
              <span>{item.name} <small>&times; {cartItems[item._id]}</small></span>
              <span>{formatPrice(item.price*cartItems[item._id])}</span>
            </li>
          ))}
        </ul>
      }
      {subtotal > 0 &&
        <div className="promo">
          {promo
            ? <div className="promo-applied">
                <TagIcon />
                <span><b>{promo.code}</b><small>{promo.label}</small></span>
                <button type="button" onClick={removePromo} aria-label={`Remove promo code ${promo.code}`}><CloseIcon /></button>
              </div>
            : <>
                <div className="promo-row">
                  <input
                    type="text"
                    value={code}
                    onChange={(e)=>{ setCode(e.target.value); setError(''); }}
                    onKeyDown={(e)=>{ if (e.key === 'Enter') submitCode(e); }}
                    placeholder="Promo code"
                    aria-label="Promo code"
                    aria-invalid={error ? 'true' : undefined}
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={submitCode} disabled={!code.trim() || checking}>
                    {checking ? 'Checking…' : 'Apply'}
                  </button>
                </div>
                {(error || promoNotice) && <p className="promo-error" role="alert">{error || promoNotice}</p>}
              </>
          }
        </div>
      }
      <dl className="summary-lines">
        <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
        {discount > 0 && <div className="summary-discount"><dt>Discount</dt><dd>&minus;{formatPrice(discount)}</dd></div>}
        <div><dt>Delivery</dt><dd>{subtotal > 0 && delivery === 0 ? 'Free' : formatPrice(delivery)}</dd></div>
        <div className="summary-total"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
      </dl>
      {children}
      {note && <p className="summary-note">{note}</p>}
    </aside>
  );
}

export default OrderSummary;
