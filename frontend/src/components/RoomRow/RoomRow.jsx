import React, { useContext } from 'react';
import './RoomRow.css';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';
import { AmenityIcon, ImagesIcon, PinIcon, UsersIcon, amenityText } from '../Icons';
import { RatingBadge } from '../Stars/Stars';
import { openProduct } from '../ProductSheet/ProductSheet';
import { openLightbox } from '../Lightbox/Lightbox';

// One room as a large photo with an overlapping white card (price, name, amenities, BOOK NOW).
// Even rows have the photo on the left, odd rows on the right.
const RoomRow = ({ room, index = 0 }) => {
  const { cartItems, addToCart, removeFromCart, roomsLeft, nights, url, ratings } = useContext(StoreContext);
  const qty = cartItems[room._id] || 0;
  const left = roomsLeft(room._id);
  const soldOut = left <= 0;
  const specs = Array.isArray(room.specs) ? room.specs : [];
  const photos = (room.images?.length ? room.images : [room.image]).map((name) => `${url}/images/${name}`);

  const select = () => {
    addToCart(room._id);
    window.dispatchEvent(new CustomEvent('cart:added', { detail: { name: room.name } }));
  };

  return (
    <article id={`product-${room._id}`} className={`rr${index % 2 ? ' rr-flip' : ''}${qty > 0 ? ' is-selected' : ''}`}>
      <button type="button" className="rr-photo" onClick={() => openLightbox({ images: photos, title: room.name })} aria-label={`View ${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} of ${room.name}`}>
        <img src={photos[0]} alt="" loading="lazy" />
        <span className="rr-count"><ImagesIcon aria-hidden="true" />{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span>
      </button>

      <div className="rr-card">
        <p className="rr-price"><span>{formatPrice(room.price)}</span> /Per Night</p>
        <h3 className="rr-title">{room.name}</h3>
        <div className="rr-meta">
          {room.location && <span><PinIcon aria-hidden="true" />PrimeStay {room.location}</span>}
          <RatingBadge rating={ratings[room._id]} onClick={() => openProduct(room._id, { reviews: true })} />
        </div>
        <p className="rr-desc">{room.description}</p>

        <ul className="rr-amen">
          <li><UsersIcon aria-hidden="true" /><span>Sleeps {room.maxGuests || 2}</span></li>
          {specs.slice(0, 5).map((s) => <li key={s.label}><AmenityIcon label={s.label} aria-hidden="true" /><span>{amenityText(s)}</span></li>)}
        </ul>

        <div className="rr-sep" aria-hidden="true" />
        <div className="rr-foot">
          {soldOut
            ? <span className="rr-sold">Sold out for these dates</span>
            : qty === 0
              ? <button type="button" className="rr-book" onClick={select}>Book now</button>
              : (
                <div className="rr-added">
                  <div className="rr-step" role="group" aria-label={`Rooms of ${room.name}`}>
                    <button type="button" aria-label={`Remove one ${room.name}`} onClick={() => removeFromCart(room._id)}>&minus;</button>
                    <span aria-live="polite">{qty}</span>
                    <button type="button" aria-label={`Add one more ${room.name}`} disabled={qty >= left} onClick={() => addToCart(room._id)}>+</button>
                  </div>
                  <Link className="rr-book rr-stay" to="/cart">Review stay</Link>
                </div>
              )}
          <button type="button" className="rr-details" onClick={() => openProduct(room._id)}>Details</button>
        </div>
        <p className="rr-total">
          {formatPrice(room.price * nights)} for {nights} {nights === 1 ? 'night' : 'nights'}
          {!soldOut && left <= 3 && <b> &middot; Only {left} left</b>}
        </p>
      </div>
    </article>
  );
};

export default RoomRow;
