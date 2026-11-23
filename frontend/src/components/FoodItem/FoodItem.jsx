import React, { useContext } from 'react';
import './FoodItem.css';
import { StoreContext } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';
import { CheckIcon, MinusIcon, PlusIcon } from '../Icons';
import { openProduct } from '../ProductSheet/ProductSheet';
import { stockInfo } from '../../utils/stock';
import Stars from '../Stars/Stars';
import WishButton from '../WishButton/WishButton';

const FoodItem = ({id,name,price,description,image,specs,stock}) => {

    const {cartItems,addToCart,removeFromCart,url,ratings} = useContext(StoreContext);
    const rating = ratings[id];
    const qty = cartItems[id] || 0;
    const specList = Array.isArray(specs) ? specs : [];
    const {left,out,low} = stockInfo(stock);
    const atLimit = left !== null && qty >= left;

    // first add also tells the toast to show up
    const addFirst = () => {
        addToCart(id);
        window.dispatchEvent(new CustomEvent('cart:added',{detail:{name}}));
    }

  return (
    <article id={`product-${id}`} className={`product${qty>0?' in-cart':''}${out?' is-out':''}`}>
        <button type="button" className="product-media" onClick={()=>openProduct(id)} aria-label={`View details for ${name}`}>
            <img src={url+"/images/"+image} alt="" loading="lazy" />
            {qty>0 && <span className="product-incart"><CheckIcon /> In cart</span>}
            {out && <span className="product-stock is-out">Sold out</span>}
            {low && <span className="product-stock is-low">Only {left} left</span>}
        </button>
        <WishButton id={id} name={name} className="wish-card" />
        <div className="product-info">
            <h3>{name}</h3>
            {rating && rating.count>0 &&
                <button type="button" className="product-rating" onClick={()=>openProduct(id)} aria-label={`Rated ${rating.average} out of 5 from ${rating.count} ${rating.count===1?'review':'reviews'}. Read reviews`}>
                    <Stars value={rating.average} size={14} /><b>{rating.average.toFixed(1)}</b><span>({rating.count})</span>
                </button>
            }
            <p className="product-desc">{description}</p>
            {specList.length>0 &&
                <button type="button" className="product-specs" onClick={()=>openProduct(id)} aria-label={`View all ${specList.length} specifications for ${name}`}>
                    {specList.slice(0,2).map((spec)=><span key={spec.label} className="spec-val" title={`${spec.label}: ${spec.value}`}>{spec.value}</span>)}
                    {specList.length>2 && <span className="more more-wide">+{specList.length-2}</span>}
                    {specList.length>1 && <span className="more more-narrow">+{specList.length-1}</span>}
                </button>
            }
            <div className="product-buy">
                <strong className="product-price">{formatPrice(price)}</strong>
                {qty===0
                    ? out
                      ? <button type="button" className="add-btn" disabled aria-label={`${name} is sold out`}><span>Sold out</span></button>
                      : <button type="button" className="add-btn" aria-label={`Add ${name} to cart`} onClick={addFirst}>
                        <PlusIcon /><span>Add</span>
                      </button>
                    : <div className="stepper">
                        <button type="button" aria-label={`Remove one ${name}`} onClick={()=>removeFromCart(id)}><MinusIcon /></button>
                        <span key={qty} aria-live="polite">{qty}</span>
                        <button type="button" aria-label={atLimit ? `No more ${name} in stock` : `Add one more ${name}`} disabled={atLimit} onClick={()=>addToCart(id)}><PlusIcon /></button>
                      </div>
                }
            </div>
        </div>
    </article>
  );
}

export default FoodItem;
