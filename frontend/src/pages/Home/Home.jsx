import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import './Home.css';
import { useLocation, Link } from 'react-router-dom';
import { StoreContext, toISO, addDaysISO } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';
import { openProduct } from '../../components/ProductSheet/ProductSheet';
import hero1 from '../../assets/hotel/hero1.jpg';
import hero2 from '../../assets/hotel/hero2.jpg';
import hero3 from '../../assets/hotel/hero3.jpg';
import hero4 from '../../assets/hotel/hero4.jpg';
import hero5 from '../../assets/hotel/hero5.jpg';
import featureImg from '../../assets/hotel/feature.jpg';

const SLIDES = [
  { src: hero1, alt: 'Resort pool at sunset' },
  { src: hero2, alt: 'Hotel pool and garden' },
  { src: hero3, alt: 'Seaside promenade at golden hour' },
  { src: hero4, alt: 'Pool terrace by the water' },
  { src: hero5, alt: 'Pool and hotel at dusk' },
];

const fmtDay = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtWeekday = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-ZA', { weekday: 'long' });
const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

/* ---------- search bar (destination, dates, guests) ---------- */
const SearchBar = ({ query, setQuery, onSearch }) => {
  const { stay, setStay, cartItems } = useContext(StoreContext);
  const [open, setOpen] = useState(false);
  const rooms = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const today = toISO(new Date());
  const pick = (e) => e.currentTarget.showPicker?.();

  return (
    <form className="ps-search" id="find" role="search" aria-label="Find a room" onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
      <label className="sb-field sb-dest">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rooms, e.g. sea view suite" aria-label="Search rooms" />
      </label>

      <div className="sb-field sb-dates">
        <div className="sb-date">
          <span className="sb-main">{fmtDay(stay.checkIn)}</span>
          <span className="sb-sub">{fmtWeekday(stay.checkIn)}</span>
          <input type="date" aria-label="Check-in" min={today} value={stay.checkIn} onClick={pick} onChange={(e) => e.target.value && setStay({ checkIn: e.target.value })} />
        </div>
        <span className="sb-divider" />
        <div className="sb-date">
          <span className="sb-main">{fmtDay(stay.checkOut)}</span>
          <span className="sb-sub">{fmtWeekday(stay.checkOut)}</span>
          <input type="date" aria-label="Check-out" min={addDaysISO(stay.checkIn, 1)} value={stay.checkOut} onClick={pick} onChange={(e) => e.target.value && setStay({ checkOut: e.target.value })} />
        </div>
      </div>

      <div className="sb-field sb-guests">
        <button type="button" className="sb-guest-btn" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span>
            <span className="sb-main">{stay.guests} {stay.guests === 1 ? 'guest' : 'guests'}</span>
            <span className="sb-sub">{rooms > 0 ? `${rooms} ${rooms === 1 ? 'room' : 'rooms'} selected` : 'No rooms yet'}</span>
          </span>
          <span aria-hidden="true">&#9662;</span>
        </button>
        {open && (
          <div className="sb-panel">
            <span>Guests</span>
            <div className="sb-step">
              <button type="button" aria-label="Fewer guests" onClick={() => setStay({ guests: Math.max(1, stay.guests - 1) })}>&minus;</button>
              <b>{stay.guests}</b>
              <button type="button" aria-label="More guests" onClick={() => setStay({ guests: Math.min(20, stay.guests + 1) })}>+</button>
            </div>
          </div>
        )}
      </div>

      <button type="submit" className="sb-go">SEARCH</button>
    </form>
  );
};

/* ---------- one room as a photo card with text on a gradient ---------- */
const PhotoCard = ({ room, url, tag }) => (
  <button type="button" className="ps-photo" onClick={() => openProduct(room._id)} aria-label={`View ${room.name}`}>
    <img src={url + '/images/' + room.image} alt="" loading="lazy" />
    <span className="ps-photo-text">
      <small>{tag || room.category}</small>
      <strong>{room.name}</strong>
      <em>{formatPrice(room.price)} / night</em>
    </span>
  </button>
);

/* ---------- horizontal row with arrows ---------- */
const Row = ({ id, title, rooms, url, onViewAll, tagOf }) => {
  const ref = useRef(null);
  const by = (dir) => { const el = ref.current; el?.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' }); };
  if (rooms.length === 0) return null;
  return (
    <section className="ps-sec" id={id} aria-label={title}>
      <h2>{title}</h2>
      {onViewAll && <button type="button" className="ps-chip" onClick={onViewAll}>View all &rsaquo;</button>}
      <div className="ps-row-wrap">
        {rooms.length > 4 && <button type="button" className="ps-arrow ps-prev" aria-label="Scroll left" onClick={() => by(-1)}>&lsaquo;</button>}
        <div className="ps-row" ref={ref}>
          {rooms.map((room) => <PhotoCard key={room._id} room={room} url={url} tag={tagOf?.(room)} />)}
        </div>
        {rooms.length > 4 && <button type="button" className="ps-arrow ps-next" aria-label="Scroll right" onClick={() => by(1)}>&rsaquo;</button>}
      </div>
    </section>
  );
};

/* ---------- listing card with select / stepper ---------- */
const RoomCard = ({ room }) => {
  const { cartItems, addToCart, removeFromCart, roomsLeft, nights, url } = useContext(StoreContext);
  const qty = cartItems[room._id] || 0;
  const left = roomsLeft(room._id);
  const soldOut = left <= 0;
  const specs = Array.isArray(room.specs) ? room.specs : [];

  const select = () => {
    addToCart(room._id);
    window.dispatchEvent(new CustomEvent('cart:added', { detail: { name: room.name } }));
  };

  return (
    <article id={`product-${room._id}`} className={`ps-card${qty > 0 ? ' is-selected' : ''}`}>
      <button type="button" className="ps-card-img" onClick={() => openProduct(room._id)} aria-label={`View details for ${room.name}`}>
        <img src={url + '/images/' + room.image} alt="" loading="lazy" />
        <span className="ps-card-tag">{room.category}</span>
      </button>
      <div className="ps-card-body">
        <h3>{room.name}</h3>
        <p>{room.description}</p>
        <div className="ps-amen">
          <span>Sleeps {room.maxGuests || 2}</span>
          {specs.slice(0, 3).map((s) => <span key={s.label}>{s.label}: {s.value}</span>)}
        </div>
        <div className="ps-card-foot">
          <div>
            <strong>{formatPrice(room.price)}</strong><small> / night</small>
            <div className="ps-total">{formatPrice(room.price * nights)} for {nights} {nights === 1 ? 'night' : 'nights'}</div>
          </div>
          {soldOut ? <span className="ps-sold">Sold out</span>
            : qty === 0
              ? <button type="button" className="ps-select" onClick={select}>Select</button>
              : <div className="ps-stepper">
                  <button type="button" aria-label={`Remove one ${room.name}`} onClick={() => removeFromCart(room._id)}>&minus;</button>
                  <span>{qty}</span>
                  <button type="button" aria-label={`Add one more ${room.name}`} disabled={qty >= left} onClick={() => addToCart(room._id)}>+</button>
                </div>}
        </div>
        {!soldOut && left <= 3 && <div className="ps-left">Only {left} left for your dates</div>}
      </div>
    </article>
  );
};

const Home = () => {
  const { food_list: rooms, ready, url, cartItems, getTotalCartAmount, nights, stay } = useContext(StoreContext);
  const { state } = useLocation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [smart, setSmart] = useState(null);
  const [slide, setSlide] = useState(0);
  useEffect(() => { const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000); return () => clearInterval(t); }, []);

  // Spotlight and the nav ask the home page to scroll, filter or reveal a room
  useEffect(() => {
    if (!state) return;
    if (state.category) { setSmart(null); setCategory(state.category); }
    if (state.smart) { setSmart(state.smart); setCategory('All'); }
    if (state.reveal) { setSmart(null); setCategory('All'); setQuery(''); }
    const target = state.scrollTo || (state.reveal ? `product-${state.reveal.id}` : null);
    if (target) setTimeout(() => scrollToId(target), 120);
  }, [state]);

  const types = useMemo(() => {
    const counts = {};
    rooms.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [rooms]);

  const q = query.trim().toLowerCase();
  const order = smart ? new Map(smart.ids.map((id, i) => [id, i])) : null;
  let visible = rooms.filter((r) =>
    (category === 'All' || r.category === category) &&
    (!q || [r.name, r.description, r.category].some((t) => t?.toLowerCase().includes(q))) &&
    (!order || order.has(r._id)));
  if (order) visible = [...visible].sort((a, b) => order.get(a._id) - order.get(b._id));

  const hero = SLIDES[slide % SLIDES.length];
  const picked = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const viewAll = (name) => { setSmart(null); setCategory(name); setTimeout(() => scrollToId('listings'), 50); };
  const search = () => { setSmart(null); setCategory('All'); scrollToId('listings'); };

  return (
    <div className="ps">
      <section className="ps-hero" aria-label="Hero banner">
        <div className="ps-hero-media">
          <img key={slide} className="ps-hero-img" src={hero.src} alt={hero.alt} />
          <div className="ps-hero-shade" aria-hidden="true" />
          <div className="ps-hero-copy">
            <p>Free cancellation &middot; Best rate guaranteed</p>
            <div className="ps-hero-title">Stay somewhere<br />extraordinary</div>
          </div>
          <div className="ps-dots" role="tablist" aria-label="Hero slides">
            {SLIDES.map((_, i) => <button key={i} type="button" role="tab" aria-selected={i === slide} aria-label={`Slide ${i + 1}`} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} />)}
          </div>
          <button type="button" className="ps-nav-btn l" aria-label="Previous slide" onClick={() => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length)}>&lsaquo;</button>
          <button type="button" className="ps-nav-btn r" aria-label="Next slide" onClick={() => setSlide((s) => (s + 1) % SLIDES.length)}>&rsaquo;</button>
        </div>
        <SearchBar query={query} setQuery={setQuery} onSearch={search} />
      </section>

      <section className="ps-welcome" aria-labelledby="ps-welcome-title">
        <p className="ps-eyebrow">PrimeStay &middot; Smarter stays</p>
        <span className="ps-rule" aria-hidden="true" />
        <h1 id="ps-welcome-title">Find the right room,<br />without the hassle</h1>
        <p>Pick your dates, see what is genuinely available, and book in minutes. No surprise fees, and free cancellation up to 48 hours before check-in.</p>
      </section>

      {!ready && <p className="ps-loading">Loading rooms&hellip;</p>}
      {ready && rooms.length === 0 && <p className="ps-loading">No rooms are listed yet. Check back soon.</p>}

      <Row id="featured" title="Featured rooms" rooms={rooms.slice(0, 8)} url={url} onViewAll={() => viewAll('All')} />
      {types.filter((t) => rooms.filter((r) => r.category === t).length >= 2).slice(0, 2).map((t) => (
        <Row key={t} id={`type-${t}`} title={`${t} rooms`} rooms={rooms.filter((r) => r.category === t)} url={url} onViewAll={() => viewAll(t)} tagOf={(r) => `Sleeps ${r.maxGuests || 2}`} />
      ))}

      <section className="ps-feature" id="why">
        <div className="ps-feature-img"><img src={featureImg} alt="Sea view room with a balcony" loading="lazy" /></div>
        <div className="ps-feature-text">
          <p className="ps-eyebrow left">Why book direct</p>
          <h2>The best rate, no middleman</h2>
          <p>Every room is priced per night with the total shown up front. Your booking is confirmed the moment payment goes through, and you can cancel online up to 48 hours before you arrive.</p>
          <button type="button" className="ps-cta" onClick={() => scrollToId('listings')}>Explore rooms</button>
        </div>
      </section>

      <section className="ps-sec" id="listings" aria-label="All rooms">
        <p className="ps-eyebrow left">Your dates: {fmtDay(stay.checkIn)} &rarr; {fmtDay(stay.checkOut)}</p>
        <h2>{smart ? 'Search results' : category === 'All' ? 'Rooms available for your stay' : `${category} rooms`}</h2>
        <div className="ps-filters" role="group" aria-label="Room types">
          <button type="button" className={category === 'All' && !smart ? 'on' : ''} onClick={() => { setSmart(null); setCategory('All'); }}>All {ready && rooms.length}</button>
          {types.map((t) => <button type="button" key={t} className={category === t ? 'on' : ''} onClick={() => { setSmart(null); setCategory(t); }}>{t}</button>)}
          {(smart || q) && <button type="button" className="clear" onClick={() => { setSmart(null); setQuery(''); setCategory('All'); }}>Clear search</button>}
        </div>
        {ready && visible.length === 0
          ? <p className="ps-loading">No rooms match your search.</p>
          : <div className="ps-grid">{visible.map((r) => <RoomCard key={r._id} room={r} />)}</div>}
      </section>

      {picked > 0 &&
        <div className="ps-staybar" role="status">
          <div><small>{picked} {picked === 1 ? 'room' : 'rooms'} &middot; {nights} {nights === 1 ? 'night' : 'nights'}</small><strong>{formatPrice(getTotalCartAmount())}</strong></div>
          <Link to="/shopping-cart/cart" className="ps-cta">Review your stay</Link>
        </div>}
    </div>
  );
};

export default Home;
