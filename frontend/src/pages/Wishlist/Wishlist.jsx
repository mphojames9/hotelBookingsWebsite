import React, { useContext } from 'react';
import './Wishlist.css';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../../components/FoodItem/FoodItem';
import { HeartIcon } from '../../components/Icons';

const Wishlist = () => {

  const {wishlistItems,ready} = useContext(StoreContext);
  const count = wishlistItems.length;

  // wait for the products so we do not flash "nothing saved"
  if (!ready) {
    return <div className='wishlist page'><h1>Wishlist</h1></div>;
  }

  if (count === 0) {
    return (
      <div className='wishlist wishlist-empty page'>
        <span className="wishlist-empty-icon"><HeartIcon /></span>
        <h1>Nothing saved yet</h1>
        <p>Tap the heart on any product and it will wait for you here.</p>
        <Link to='/shopping-cart' state={{scrollTo:'food-display'}} className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className='wishlist page'>
      <div className="wishlist-head">
        <h1>Wishlist</h1>
        <p>{count} {count === 1 ? 'product' : 'products'}</p>
      </div>
      <ul className="shop-grid">
        {wishlistItems.map((item)=>(
          <li key={item._id}>
            <FoodItem id={item._id} name={item.name} description={item.description} price={item.price} image={item.image} specs={item.specs} stock={item.stock} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Wishlist;
