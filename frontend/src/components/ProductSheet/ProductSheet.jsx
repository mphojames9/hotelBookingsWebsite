import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import './ProductSheet.css';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { categoryLabel, formatPrice } from '../../utils/format';
import { addDaysISO, toISO } from '../../context/StoreContext';
import { ArrowRightIcon, CartIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, MinusIcon, PlusIcon } from '../Icons';
import Reviews from '../Reviews/Reviews';
import { RatingBadge } from '../Stars/Stars';

const CART = '/cart';

/* Anything can open the product sheet: openProduct(product._id) */
export const openProduct = (id, options = {}) =>
  window.dispatchEvent(new CustomEvent('product:open', { detail: { id, ...options } }));

const ProductSheet = () => {

  const { food_list, ready, cartItems, addToCart, removeFromCart, roomsLeft, ratings, nights, stay, setStay, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [id, setId] = useState(null);
  const [closing, setClosing] = useState(false);
  const [photo, setPhoto] = useState(0);
  const touchX = useRef(null);
  const panelRef = useRef(null);
  const lastFocus = useRef(null);
  const closeTimer = useRef(null);

  const hide = useCallback(({ restoreFocus = true } = {}) => {
    setClosing(true);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setId(null);
      setClosing(false);
      if (restoreFocus) lastFocus.current?.focus?.({ preventScroll: true });
    }, 170);
  }, []);

  useEffect(() => {
    const onOpen = (event) => {
      clearTimeout(closeTimer.current);
      lastFocus.current = document.activeElement;
      setClosing(false);
      setPhoto(0);
      setId(event.detail?.id ?? null);
      // openProduct(id, {reviews:true}) scrolls straight to the reviews
      if (event.detail?.reviews) setTimeout(() => document.getElementById('room-reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    };
    window.addEventListener('product:open', onOpen);
    return () => {
      window.removeEventListener('product:open', onOpen);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const product = id ? food_list.find((item) => item._id === id) : null;

  // the page behind stops scrolling, focus moves into the dialog, Esc closes it
  useEffect(() => {
    if (!product) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('.ps-close')?.focus();
    const onKey = (event) => { if (event.key === 'Escape') { event.preventDefault(); hide(); } };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [product?._id, hide]);

  // the product disappeared (removed in the admin): close quietly
  useEffect(() => {
    if (id && ready && !product) setId(null);
  }, [id, ready, product]);

  if (!product) return null;

  const qty = cartItems[product._id] || 0;
  const specs = Array.isArray(product.specs) ? product.specs : [];
  const left = roomsLeft(product._id);
  const soldOut = left <= 0;
  const photos = product.images?.length ? product.images : [product.image];
  const current = Math.min(photo, photos.length - 1);
  const go = (step) => setPhoto((current + step + photos.length) % photos.length);
  const askLogin = () => {
    hide({ restoreFocus: false });
    setTimeout(() => window.dispatchEvent(new CustomEvent('login:open')), 200);
  };
  const onTouchStart = (event) => { touchX.current = event.touches[0].clientX; };
  const onTouchEnd = (event) => {
    if (touchX.current == null || photos.length < 2) return;
    const dx = event.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  const addFirst = () => {
    addToCart(product._id);
    window.dispatchEvent(new CustomEvent('cart:added', { detail: { name: product.name } }));
  };
  const goCart = () => {
    hide({ restoreFocus: false });
    navigate(CART);
  };

  // keep Tab inside the dialog
  const trapTab = (event) => {
    if (event.key === 'ArrowLeft' && photos.length > 1 && !event.target.closest?.('textarea, input')) { go(-1); return; }
    if (event.key === 'ArrowRight' && photos.length > 1 && !event.target.closest?.('textarea, input')) { go(1); return; }
    if (event.key !== 'Tab') return;
    const nodes = [...panelRef.current.querySelectorAll('button, textarea, input')].filter((n) => !n.disabled && n.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return (
    <div className={`ps-root${closing ? ' is-closing' : ''}`}>
      <div className="ps-backdrop" onClick={() => hide()} />
      <div className="ps-panel" role="dialog" aria-modal="true" aria-labelledby="ps-title" ref={panelRef} onKeyDown={trapTab}>

        <button type="button" className="ps-close" aria-label="Close details" onClick={() => hide()}><CloseIcon /></button>

        <div className="ps-left">
          <div className="ps-media" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <img className="ps-bg" key={'bg' + photos[current]} src={url + '/images/' + photos[current]} alt="" aria-hidden="true" />
            <img className="ps-main" key={photos[current]} src={url + '/images/' + photos[current]} alt={`${product.name}, photo ${current + 1} of ${photos.length}`} />
            {photos.length > 1 && (
              <>
                <button type="button" className="ps-nav ps-prev" aria-label="Previous photo" onClick={() => go(-1)}><ChevronLeftIcon /></button>
                <button type="button" className="ps-nav ps-next" aria-label="Next photo" onClick={() => go(1)}><ChevronRightIcon /></button>
                <span className="ps-count" aria-hidden="true">{current + 1} / {photos.length}</span>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="ps-thumbs" role="tablist" aria-label="Room photos">
              {photos.map((name, i) => (
                <button key={name} type="button" role="tab" aria-selected={i === current} aria-label={`Show photo ${i + 1}`} className={i === current ? 'on' : ''} onClick={() => setPhoto(i)}>
                  <img src={url + '/images/' + name} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          <div className="ps-dates">
            <p className="ps-dates-title">Your dates</p>
            <div className="ps-dates-row">
              <label><span>Check-in</span><input type="date" min={toISO(new Date())} value={stay.checkIn} onChange={(e) => e.target.value && setStay({ checkIn: e.target.value })} /></label>
              <label><span>Check-out</span><input type="date" min={addDaysISO(stay.checkIn, 1)} value={stay.checkOut} onChange={(e) => e.target.value && setStay({ checkOut: e.target.value })} /></label>
            </div>
            <p className={`ps-avail${soldOut ? ' is-out' : ''}`}>
              {soldOut ? 'Sold out for these dates. Try different dates.' : left <= 3 ? `Only ${left} left for these dates` : 'Available for these dates'}
            </p>
          </div>
        </div>

        <div className="ps-body">
          <div className="ps-scroll">
            <span className="ps-cat">{categoryLabel(product.category)}</span>
            <h2 id="ps-title">{product.name}</h2>
            <strong className="ps-price">{formatPrice(product.price)}<small> / night</small></strong>
            <div className="ps-meta">
              <RatingBadge rating={ratings[product._id]} onClick={() => document.getElementById('room-reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
              <span>Sleeps {product.maxGuests || 2}</span>
              <span>{formatPrice(product.price * nights)} for {nights} {nights === 1 ? 'night' : 'nights'}</span>
            </div>
            <p className="ps-desc">{product.description}</p>

            {specs.length > 0 ? (
              <>
                <h3 className="ps-subtitle">Room amenities</h3>
                <dl className="ps-specs">
                  {specs.map((spec) => (
                    <div key={spec.label}>
                      <dt>{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="ps-nospecs">No amenities listed for this room yet.</p>
            )}

            <Reviews roomId={product._id} onRequestLogin={askLogin} />
          </div>

          <div className="ps-foot">
            {qty === 0 ? (
              <button type="button" className="ps-add" onClick={addFirst} disabled={soldOut}>
                <PlusIcon /><span>{soldOut ? 'Sold out for these dates' : 'Select room'}</span>{!soldOut && <b>{formatPrice(product.price)}</b>}
              </button>
            ) : (
              <>
                <div className="ps-stepper">
                  <button type="button" aria-label={`Remove one ${product.name}`} onClick={() => removeFromCart(product._id)}><MinusIcon /></button>
                  <span key={qty} aria-live="polite">{qty}</span>
                  <button type="button" aria-label={`Add one more ${product.name}`} disabled={qty >= left} onClick={() => addToCart(product._id)}><PlusIcon /></button>
                </div>
                <button type="button" className="ps-cart" onClick={goCart}>
                  <CartIcon /><span>Review your stay</span><ArrowRightIcon />
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductSheet;
