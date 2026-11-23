import React, { useContext } from 'react';
import './RecentlyViewed.css';
import { StoreContext } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';
import { openProduct } from '../ProductSheet/ProductSheet';

// A quick way back to products the shopper has opened. Hidden until there is something to show.
const RecentlyViewed = () => {

  const {recentItems,clearRecent,url} = useContext(StoreContext);

  if (recentItems.length === 0) return null;

  return (
    <section className="recent" aria-labelledby="recent-title">
      <div className="recent-head">
        <h2 id="recent-title">Recently viewed</h2>
        <button type="button" onClick={clearRecent}>Clear</button>
      </div>
      <ul className="recent-list">
        {recentItems.map((item)=>(
          <li key={item._id}>
            <button type="button" className="recent-card" onClick={()=>openProduct(item._id)} aria-label={`${item.name}, ${formatPrice(item.price)}. View details`}>
              <span className="recent-img"><img src={url+"/images/"+item.image} alt="" loading="lazy" /></span>
              <span className="recent-name">{item.name}</span>
              <strong>{formatPrice(item.price)}</strong>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecentlyViewed;
