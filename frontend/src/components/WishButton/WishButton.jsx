import React, { useContext } from 'react';
import './WishButton.css';
import { StoreContext } from '../../context/StoreContext';
import { HeartIcon } from '../Icons';

// Heart toggle for a product. `className` lets the caller position it.
const WishButton = ({id,name,className=''}) => {
  const {wishlist,toggleWishlist} = useContext(StoreContext);
  const saved = wishlist.includes(id);

  return (
    <button
      type="button"
      className={`wish${saved?' is-on':''} ${className}`.trim()}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      onClick={()=>toggleWishlist(id)}
    >
      <HeartIcon />
    </button>
  );
}

export default WishButton;
