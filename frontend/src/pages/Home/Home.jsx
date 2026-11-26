import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import './Home.css';
import { useLocation, Link } from 'react-router-dom';
import { StoreContext, toISO, addDaysISO } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';
import { openProduct } from '../../components/ProductSheet/ProductSheet';
import { RatingBadge } from '../../components/Stars/Stars';
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

/* ---------- search card (destination, dates, guests) ---------- */
const SearchBar = ({ query, setQuery, onSearch }) => {
  const { stay, setStay } = useContext(StoreContext);
  const today = toISO(new Date());
  const pick = (e) => e.currentTarget.showPicker?.();
  return (
    <form className="sx" id="find" role="search" aria-label="Find a room" onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
      <label className="sx-box sx-dest">
        <span className="sx-label">Looking for</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Sea view, suite, family room…" aria-label="Search rooms" />
      </label>
      <div className="sx-box sx-date">
        <span className="sx-label">Check-in</span>
        <span className="sx-main">{fmtDay(stay.checkIn)}</span>
        <input type="date" aria-label="Check-in" min={today} value={stay.checkIn} onClick={pick} onChange={(e) => e.target.value && setStay({ checkIn: e.target.value })} />
      </div>
      <div className="sx-box sx-date">
        <span className="sx-label">Check-out</span>
        <span className="sx-main">{fmtDay(stay.checkOut)}</span>
        <input type="date" aria-label="Check-out" min={addDaysISO(stay.checkIn, 1)} value={stay.checkOut} onClick={pick} onChange={(e) => e.target.value && setStay({ checkOut: e.target.value })} />
      </div>
      <div className="sx-box sx-guests">
        <span className="sx-label">Guests</span>
        <div className="sx-step">
          <button type="button" aria-label="Fewer guests" onClick={() => setStay({ guests: Math.max(1, stay.guests - 1) })}>&minus;</button>
          <b>{stay.guests}</b>
          <button type="button" aria-label="More guests" onClick={() => setStay({ guests: Math.min(20, stay.guests + 1) })}>+</button>
        </div>
      </div>
      <button type="submit" className="sx-go">Check availability</button>
    </form>
  );
};

/* ---------- room card with the photo on top and the text underneath ---------- */
const Tile = ({ room, url, rating }) => (
  <button type="button" className="tile" onClick={() => openProduct(room._id)} aria-label={`View ${room.name}`}>
    <span className="tile-img"><img src={url + '/images/' + room.image} alt="" loading="lazy" /></span>
    <span className="tile-body">
      <small>{room.category} &middot; sleeps {room.maxGuests || 2}</small>
      <strong>{room.name}</strong>
      <RatingBadge rating={rating} />
      <em>{formatPrice(room.price)} <span>/ night</span></em>
    </span>
  </button>
);

/* ---------- horizontal row with arrows ---------- */
const Row = ({ rooms, url, ratings }) => {
  const ref = useRef(null);
  const by = (dir) => { const el = ref.current; el?.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' }); };
  return (
    <div className="row-wrap">
      <div className="row" ref={ref}>{rooms.map((room) => <Tile key={room._id} room={room} url={url} rating={ratings[room._id]} />)}</div>
      {rooms.length > 4 && <div className="row-btns">
        <button type="button" aria-label="Scroll left" onClick={() => by(-1)}>&larr;</button>
        <button type="button" aria-label="Scroll right" onClick={() => by(1)}>&rarr;</button>
      </div>}
    </div>
  );
};

/* ---------- listing card with select / stepper ---------- */
const RoomCard = ({ room }) => {
  const { cartItems, addToCart, removeFromCart, roomsLeft, nights, url, ratings } = useContext(StoreContext);
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
        <RatingBadge rating={ratings[room._id]} onClick={() => openProduct(room._id, { reviews: true })} />
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
  const { food_list: rooms, ready, url, cartItems, getTotalCartAmount, nights, stay, ratings, hotelRating } = useContext(StoreContext);
  const { state } = useLocation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [smart, setSmart] = useState(null);
  const [extra, setExtra] = useState(null); // filter from the header menu: {label, categories, minPrice, maxPrice, minGuests}
  const [slide, setSlide] = useState(0);
  useEffect(() => { const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000); return () => clearInterval(t); }, []);

  // Spotlight and the nav ask the home page to scroll, filter or reveal a room
  useEffect(() => {
    if (!state) return;
    setExtra(state.filter || null);
    if (state.filter) { setSmart(null); setCategory('All'); }
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
    (!extra || ((!extra.categories || extra.categories.includes(r.category)) && (extra.minPrice == null || r.price >= extra.minPrice) && (extra.maxPrice == null || r.price <= extra.maxPrice) && (extra.minGuests == null || (r.maxGuests || 2) >= extra.minGuests))) &&
    (!q || [r.name, r.description, r.category].some((t) => t?.toLowerCase().includes(q))) &&
    (!order || order.has(r._id)));
  if (order) visible = [...visible].sort((a, b) => order.get(a._id) - order.get(b._id));

  // guest favourites: best rated first (rooms without reviews follow)
  const featured = useMemo(() => [...rooms].sort((a, b) => (ratings[b._id]?.average || 0) - (ratings[a._id]?.average || 0) || (ratings[b._id]?.count || 0) - (ratings[a._id]?.count || 0)).slice(0, 8), [rooms, ratings]);
  const overall = hotelRating();

  const hero = SLIDES[slide % SLIDES.length];
  const picked = rooms.reduce((sum, r) => sum + (cartItems[r._id] || 0), 0);
  const viewAll = (name) => { setSmart(null); setExtra(null); setCategory(name); setTimeout(() => scrollToId('listings'), 50); };
  const search = () => { setSmart(null); setCategory('All'); scrollToId('listings'); };

  const typeTiles = types.slice(0, 6).map((t) => ({ name: t, rooms: rooms.filter((r) => r.category === t) }));
  const sideA = SLIDES[(slide + 1) % SLIDES.length], sideB = SLIDES[(slide + 2) % SLIDES.length];

  return (
    <div className="ps">
      <section className="hx" aria-label="Find your stay">
        <div className="hx-copy">
          <p className="hx-tag"><i aria-hidden="true" />Free cancellation up to 48 hours before check-in</p>
          <h1>Stay somewhere <em>you will talk about.</em></h1>
          <p className="hx-lead">Handpicked rooms, honest prices and instant confirmation. Pick your dates and see exactly what is free.</p>
          <SearchBar query={query} setQuery={setQuery} onSearch={search} />
          <ul className="hx-proof">
            {overall ? <li><b>{overall.average.toFixed(1)}</b> from {overall.count} {overall.count === 1 ? 'review' : 'reviews'}</li> : <li><b>New</b> be our first review</li>}
            <li><b>{rooms.length || '15'}</b> rooms to choose from</li>
            <li><b>0</b> booking fees</li>
          </ul>
        </div>
        <div className="hx-art" aria-hidden="false">
          <img key={slide} className="hx-main" src={hero.src} alt={hero.alt} />
          <button type="button" className="hx-side a" aria-label="Show next photo" onClick={() => setSlide((s) => (s + 1) % SLIDES.length)}><img src={sideA.src} alt="" /></button>
          <button type="button" className="hx-side b" aria-label="Show another photo" onClick={() => setSlide((s) => (s + 2) % SLIDES.length)}><img src={sideB.src} alt="" /></button>
          <span className="hx-badge"><b>Instant</b> confirmation</span>
        </div>
      </section>

      <section className="trust" aria-label="Why guests book with us">
        <ul>
          <li><strong>Free cancellation</strong><span>Up to 48 hours before arrival</span></li>
          <li><strong>Instant confirmation</strong><span>Your room is held the moment you pay</span></li>
          <li><strong>Secure payment</strong><span>Card payments handled by Stripe</span></li>
          <li><strong>Real availability</strong><span>Only rooms that are actually free</span></li>
        </ul>
      </section>

      {!ready && <p className="ps-loading">Loading rooms&hellip;</p>}
      {ready && rooms.length === 0 && <p className="ps-loading">No rooms are listed yet. Check back soon.</p>}

      {typeTiles.length > 0 && (
        <section className="sec" id="types" aria-labelledby="types-h">
          <header className="sec-head"><div><p className="eyebrow">Room types</p><h2 id="types-h">Find your kind of stay</h2></div></header>
          <div className="types">
            {typeTiles.map(({ name, rooms: rs }) => (
              <button type="button" key={name} className="type" onClick={() => viewAll(name)}>
                <span className="type-img"><img src={url + '/images/' + rs[0].image} alt="" loading="lazy" /></span>
                <span className="type-body"><strong>{name}</strong><small>from {formatPrice(Math.min(...rs.map((r) => r.price)))}</small></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {rooms.length > 0 && (
        <section className="sec" id="featured" aria-labelledby="feat-h">
          <header className="sec-head"><div><p className="eyebrow">Featured</p><h2 id="feat-h">Guest favourites</h2></div>
            <button type="button" className="link-btn" onClick={() => viewAll('All')}>View all rooms &rarr;</button></header>
          <Row rooms={featured} url={url} ratings={ratings} />
        </section>
      )}

      <section className="why" id="why">
        <div className="why-in">
          <div className="why-text">
            <p className="eyebrow light">Why book direct</p>
            <h2>The best rate, with nothing hidden</h2>
            <ol>
              <li><b>01</b><span><strong>Total price up front</strong>Per-night rates and the full stay total, before you pay.</span></li>
              <li><b>02</b><span><strong>Confirmed in seconds</strong>No waiting for an email. Your booking is live as soon as payment clears.</span></li>
              <li><b>03</b><span><strong>Change of plans?</strong>Cancel online up to 48 hours before check-in.</span></li>
            </ol>
            <button type="button" className="btn-gold" onClick={() => scrollToId('listings')}>Explore rooms</button>
          </div>
          <div className="why-img"><img src={featureImg} alt="Sea view room with a balcony" loading="lazy" /></div>
        </div>
      </section>

      <section className="sec" id="listings" aria-label="All rooms">
        <header className="sec-head"><div>
          <p className="eyebrow">{fmtDay(stay.checkIn)} &rarr; {fmtDay(stay.checkOut)} &middot; {nights} {nights === 1 ? 'night' : 'nights'}</p>
          <h2>{extra ? extra.label : smart ? 'Search results' : category === 'All' ? 'Rooms available for your stay' : `${category} rooms`}</h2></div></header>
        <div className="filters" role="group" aria-label="Room types">
          <button type="button" className={category === 'All' && !smart ? 'on' : ''} onClick={() => { setSmart(null); setExtra(null); setCategory('All'); }}>All {ready && rooms.length}</button>
          {types.map((t) => <button type="button" key={t} className={category === t ? 'on' : ''} onClick={() => { setSmart(null); setExtra(null); setCategory(t); }}>{t}</button>)}
          {(smart || q || extra) && <button type="button" className="clear" onClick={() => { setSmart(null); setQuery(''); setCategory('All'); setExtra(null); }}>Clear filters</button>}
        </div>
        {ready && visible.length === 0
          ? <p className="ps-loading">No rooms match your search.</p>
          : <div className="grid">{visible.map((r) => <RoomCard key={r._id} room={r} />)}</div>}
      </section>

      {picked > 0 &&
        <div className="ps-staybar" role="status">
          <div><small>{picked} {picked === 1 ? 'room' : 'rooms'} &middot; {nights} {nights === 1 ? 'night' : 'nights'}</small><strong>{formatPrice(getTotalCartAmount())}</strong></div>
          <Link to="/cart" className="ps-cta">Review your stay</Link>
        </div>}
    </div>
  );
};

export default Home;
