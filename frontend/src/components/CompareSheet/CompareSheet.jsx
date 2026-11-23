import React, { useContext, useEffect, useMemo, useRef } from 'react';
import './CompareSheet.css';
import { StoreContext } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';
import { openProduct } from '../ProductSheet/ProductSheet';
import { CloseIcon } from '../Icons';

const fmtDay = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });

/* Side-by-side comparison of 2-3 rooms for the dates the guest picked */
const CompareSheet = ({ rooms, onRemove, onClose }) => {
  const { url, stay, nights, cartItems, addToCart, roomsLeft } = useContext(StoreContext);
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // page behind stops scrolling, focus moves in and returns on close, Esc closes
  useEffect(() => {
    const opener = document.activeElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('.cmp-x')?.focus();
    const onKey = (event) => {
      // the room details sheet may be open on top: let it handle Esc first
      if (event.key === 'Escape' && !document.querySelector('.ps-root')) { event.preventDefault(); closeRef.current(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  const trapTab = (event) => {
    if (event.key !== 'Tab') return;
    const nodes = [...panelRef.current.querySelectorAll('button')].filter((n) => !n.disabled && n.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  // every spec label used by any of the rooms, in the order they first appear
  const labels = useMemo(() => {
    const seen = [];
    rooms.forEach((r) => (r.specs || []).forEach((s) => { if (!seen.includes(s.label)) seen.push(s.label); }));
    return seen;
  }, [rooms]);
  const specOf = (room, label) => (room.specs || []).find((s) => s.label === label)?.value;

  const prices = rooms.map((r) => r.price);
  const sleeps = rooms.map((r) => r.maxGuests || 2);
  const lowest = Math.min(...prices), mostSleeps = Math.max(...sleeps);
  const priceDiffers = lowest !== Math.max(...prices);
  const sleepsDiffer = mostSleeps !== Math.min(...sleeps);

  const select = (room) => {
    addToCart(room._id);
    window.dispatchEvent(new CustomEvent('cart:added', { detail: { name: room.name } }));
  };

  return (
    <div className="cmp-root">
      <div className="cmp-backdrop" onClick={onClose} />
      <div className="cmp-panel" role="dialog" aria-modal="true" aria-labelledby="cmp-title" ref={panelRef} onKeyDown={trapTab}>
        <header className="cmp-top">
          <div>
            <h2 id="cmp-title">Compare rooms</h2>
            <p>{fmtDay(stay.checkIn)} to {fmtDay(stay.checkOut)} &middot; {nights} {nights === 1 ? 'night' : 'nights'} &middot; {stay.guests} {stay.guests === 1 ? 'guest' : 'guests'}</p>
          </div>
          <button type="button" className="cmp-x" aria-label="Close comparison" onClick={onClose}><CloseIcon /></button>
        </header>

        <div className="cmp-scroll">
          <table className="cmp-table" style={{ '--n': rooms.length }}>
            <caption className="cmp-sr">Side-by-side comparison of {rooms.length} rooms</caption>
            <thead>
              <tr>
                <td />
                {rooms.map((r) => (
                  <th scope="col" key={r._id}>
                    <span className="cmp-photo"><img src={url + '/images/' + r.image} alt="" /></span>
                    <small>{r.category}</small>
                    <strong>{r.name}</strong>
                    <button type="button" className="cmp-drop" onClick={() => onRemove(r._id)}>Remove</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Per night</th>
                {rooms.map((r) => (
                  <td key={r._id} className={priceDiffers && r.price === lowest ? 'is-best' : ''}>
                    <b className="cmp-big">{formatPrice(r.price)}</b>
                    {priceDiffers && r.price === lowest && <em>Lowest price</em>}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Whole stay</th>
                {rooms.map((r) => <td key={r._id}><b>{formatPrice(r.price * nights)}</b><span className="cmp-sub">{nights} {nights === 1 ? 'night' : 'nights'}</span></td>)}
              </tr>
              <tr>
                <th scope="row">Sleeps</th>
                {rooms.map((r) => {
                  const n = r.maxGuests || 2;
                  return (
                    <td key={r._id} className={sleepsDiffer && n === mostSleeps ? 'is-best' : ''}>
                      <b>{n} {n === 1 ? 'guest' : 'guests'}</b>
                      <span className={`cmp-sub${n >= stay.guests ? ' ok' : ''}`}>{n >= stay.guests ? `Fits your party of ${stay.guests}` : `Too small for ${stay.guests} guests`}</span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <th scope="row">Availability</th>
                {rooms.map((r) => {
                  const left = roomsLeft(r._id);
                  return (
                    <td key={r._id}>
                      {left <= 0 ? <b className="cmp-bad">Sold out</b>
                        : left <= 3 ? <b className="cmp-warn">Only {left} left</b>
                        : <b className="cmp-good">Available</b>}
                      <span className="cmp-sub">for your dates</span>
                    </td>
                  );
                })}
              </tr>
              {labels.map((label) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {rooms.map((r) => <td key={r._id}>{specOf(r, label) || <span className="cmp-none">&mdash;</span>}</td>)}
                </tr>
              ))}
              <tr className="cmp-actions">
                <th scope="row"><span className="cmp-sr">Actions</span></th>
                {rooms.map((r) => {
                  const qty = cartItems[r._id] || 0;
                  const left = roomsLeft(r._id);
                  return (
                    <td key={r._id}>
                      <button type="button" className="cmp-pick" disabled={left <= 0 || qty >= left} onClick={() => select(r)}>
                        {left <= 0 ? 'Sold out' : qty === 0 ? 'Select room' : 'Add another'}
                      </button>
                      {qty > 0 && <span className="cmp-sub ok">{qty} selected</span>}
                      <button type="button" className="cmp-more" onClick={() => openProduct(r._id)}>Room details</button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompareSheet;
