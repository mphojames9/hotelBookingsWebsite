import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import './NavBar.css';
import { assets } from '../../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';
import { openSpotlight } from '../Spotlight/Spotlight';

const HOME = '/shopping-cart';

const PATHS = {
  bed: 'M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 12h.01',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4 3.6-6 8-6s8 2 8 6',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 6.6M18 14.8c2.2.6 3.5 2.4 3.5 5.2',
  brief: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  home: 'm3 11 9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  access: 'M12 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM12 7v6h5l2 5M9 10a5 5 0 1 0 6 7',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  cal: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
  star: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z',
  tag: 'M3 12V3h9l9 9-9 9ZM7.5 7.5h.01',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
  check: 'm5 12 5 5 9-10',
};
const Ico = ({ n, s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={PATHS[n]} /></svg>;
const Chev = () => <svg className="nv-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;

const BUDGETS = [
  { label: 'Under R1 500', f: { maxPrice: 1499, label: 'Rooms under R1 500' } },
  { label: 'R1 500 to R3 000', f: { minPrice: 1500, maxPrice: 3000, label: 'Rooms from R1 500 to R3 000' } },
  { label: 'R3 000 and above', f: { minPrice: 3000, label: 'Rooms from R3 000' } },
];
const PARTY = [
  { label: 'Sleeps 3 or more', f: { minGuests: 3, label: 'Rooms for 3 or more guests' } },
  { label: 'Sleeps 4 or more', f: { minGuests: 4, label: 'Rooms for 4 or more guests' } },
  { label: 'Big groups (6+)', f: { minGuests: 6, label: 'Rooms for groups of 6 or more' } },
];
const STYLES = [
  { label: 'Family trips', desc: 'Space for everyone', icon: 'users', cats: ['Family'] },
  { label: 'Business travel', desc: 'Desks, lounges and quiet', icon: 'brief', cats: ['Executive'] },
  { label: 'Long stays', desc: 'Kitchenettes and laundry', icon: 'home', cats: ['Studio'] },
  { label: 'Romantic escapes', desc: 'Balconies and sea views', icon: 'heart', cats: ['Deluxe', 'Suite', 'Penthouse'] },
  { label: 'Accessible stays', desc: 'Step-free, roll-in showers', icon: 'access', cats: ['Accessible'] },
];

const Item = ({ icon, title, desc, ...rest }) => (
  <a className="nv-li" {...rest}><span className="nv-ico"><Ico n={icon} /></span><span><strong>{title}</strong>{desc && <small>{desc}</small>}</span></a>
);

const NavBar = ({ setShowLogin }) => {
  const { cartItems, token, logout, food_list, url, nights, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const rooms = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  const [open, setOpen] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoverType, setHoverType] = useState(null);
  const timer = useRef(null);
  const headerRef = useRef(null);

  const types = useMemo(() => {
    const map = new Map();
    food_list.forEach((r) => {
      const t = map.get(r.category) || { name: r.category, count: 0, from: Infinity, sample: r };
      t.count += 1; t.from = Math.min(t.from, r.price);
      map.set(r.category, t);
    });
    return [...map.values()].sort((a, b) => a.from - b.from);
  }, [food_list]);
  const styles = STYLES.filter((s) => s.cats.some((c) => types.some((t) => t.name === c)));
  const active = types.find((t) => t.name === hoverType) || types[0];
  const picked = food_list.filter((r) => cartItems[r._id] > 0);

  useEffect(() => { setOpen(null); setMobile(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const away = (e) => { if (headerRef.current && !headerRef.current.contains(e.target)) setOpen(null); };
    const esc = (e) => { if (e.key === 'Escape') { setOpen((o) => { if (o) headerRef.current?.querySelector(`[data-dd="${o}"]`)?.focus(); return null; }); setMobile(false); } };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, []);
  useEffect(() => { document.body.style.overflow = mobile ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [mobile]);

  const enter = (name) => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(name), 70); };
  const leave = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(null), 180); };
  const toggle = (name) => setOpen((o) => (o === name ? null : name));

  // keyboard: ArrowDown opens and focuses the first link; arrows move between links
  const trigKey = (name) => (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault(); setOpen(name);
      setTimeout(() => headerRef.current?.querySelector(`[data-panel="${name}"] a,[data-panel="${name}"] button`)?.focus(), 30);
    }
  };
  const panelKey = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = [...e.currentTarget.querySelectorAll('a,button')];
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
  };

  const go = (state) => (e) => { e?.preventDefault(); setOpen(null); setMobile(false); navigate(HOME, { state: { ...state, t: Date.now() } }); };
  const filter = (f) => go({ filter: f, scrollTo: 'listings' });
  const style = (st) => filter({ categories: st.cats, label: st.label });

  const trigger = (name, label) => (
    <button type="button" data-dd={name} className={open === name ? 'on' : ''} aria-expanded={open === name} aria-haspopup="true" onClick={() => toggle(name)} onKeyDown={trigKey(name)}>{label}<Chev /></button>
  );

  return (
    <header ref={headerRef} className={`nv${scrolled ? ' scrolled' : ''}`}>
      {open && <div className="nv-scrim" aria-hidden="true" />}

      <div className="nv-util">
        <div className="nv-util-in">
          <p><Ico n="check" s={14} />Free cancellation up to 48 hours before check-in</p>
          <div className="nv-util-r">
            <div className="nv-rel" onMouseEnter={() => enter('help')} onMouseLeave={leave}>
              <button type="button" data-dd="help" className="nv-util-btn" aria-expanded={open === 'help'} aria-haspopup="true" onClick={() => toggle('help')} onKeyDown={trigKey('help')}>Help<Chev /></button>
              {open === 'help' && (
                <div className="nv-drop nv-drop-r" data-panel="help" role="menu" onKeyDown={panelKey}>
                  <Item icon="phone" title="Call us" desc="+27 11 233 1245" href="tel:+27112331245" role="menuitem" />
                  <Item icon="mail" title="Email us" desc="demo@onestop.com" href="mailto:demo@onestop.com" role="menuitem" />
                  <Item icon="help" title="How booking works" desc="Pick dates, choose rooms, pay" href="#why" role="menuitem" onClick={go({ scrollTo: 'why' })} />
                </div>
              )}
            </div>
            <Link to="/shopping-cart/myorders" className="nv-util-btn">My bookings</Link>
          </div>
        </div>
      </div>

      <div className="nv-bar">
        <Link to={HOME} className="nv-brand" aria-label="PrimeStay home"><img src={assets.logo} alt="" /></Link>

        <ul className="nv-menu">
          <li className="nv-item" onMouseEnter={() => enter('stay')} onMouseLeave={leave}>
            {trigger('stay', 'Stay')}
            {open === 'stay' && (
              <div className="nv-mega" data-panel="stay" role="region" aria-label="Stay" onKeyDown={panelKey}>
                <div className="nv-mega-in">
                  <div className="nv-col">
                    <p className="nv-label">Room types</p>
                    {types.length === 0 && <p className="nv-empty">Rooms are coming soon.</p>}
                    {types.map((t) => (
                      <a key={t.name} href="#listings" className={`nv-type${active?.name === t.name ? ' on' : ''}`} onMouseEnter={() => setHoverType(t.name)} onFocus={() => setHoverType(t.name)} onClick={go({ category: t.name, scrollTo: 'listings' })}>
                        <span><strong>{t.name}</strong><small>{t.count} {t.count === 1 ? 'room' : 'rooms'}</small></span><em>from {formatPrice(t.from)}</em>
                      </a>
                    ))}
                  </div>
                  <div className="nv-col">
                    <p className="nv-label">Browse by budget</p>
                    {BUDGETS.map((b) => <a key={b.label} href="#listings" className="nv-chip" onClick={filter(b.f)}><Ico n="tag" s={16} />{b.label}</a>)}
                    <p className="nv-label nv-gap">Party size</p>
                    {PARTY.map((b) => <a key={b.label} href="#listings" className="nv-chip" onClick={filter(b.f)}><Ico n="users" s={16} />{b.label}</a>)}
                    <a href="#listings" className="nv-all" onClick={go({ category: 'All', scrollTo: 'listings' })}>Browse all rooms &rarr;</a>
                  </div>
                  {active && (
                    <a href="#listings" className="nv-feat" onClick={go({ category: active.name, scrollTo: 'listings' })}>
                      <img src={url + '/images/' + active.sample.image} alt="" />
                      <span className="nv-feat-text"><small>{active.name}</small><strong>{active.sample.name}</strong><em>{formatPrice(active.sample.price)} / night</em></span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </li>

          {styles.length > 0 && (
            <li className="nv-item nv-rel" onMouseEnter={() => enter('style')} onMouseLeave={leave}>
              {trigger('style', 'Travel style')}
              {open === 'style' && (
                <div className="nv-drop nv-drop-wide" data-panel="style" role="menu" onKeyDown={panelKey}>
                  {styles.map((st) => <Item key={st.label} icon={st.icon} title={st.label} desc={st.desc} href="#listings" role="menuitem" onClick={style(st)} />)}
                </div>
              )}
            </li>
          )}

          <li className="nv-item nv-rel" onMouseEnter={() => enter('plan')} onMouseLeave={leave}>
            {trigger('plan', 'Plan')}
            {open === 'plan' && (
              <div className="nv-drop nv-drop-wide" data-panel="plan" role="menu" onKeyDown={panelKey}>
                <Item icon="cal" title="Check availability" desc="Set your dates and guests" href="#find" role="menuitem" onClick={go({ scrollTo: 'find' })} />
                <Item icon="star" title="Guest favourites" desc="Our most-booked rooms" href="#featured" role="menuitem" onClick={go({ scrollTo: 'featured' })} />
                <Item icon="grid" title="All rooms" desc="Every room, with live availability" href="#listings" role="menuitem" onClick={go({ category: 'All', scrollTo: 'listings' })} />
                <Item icon="check" title="Why book direct" desc="Best rate, free cancellation" href="#why" role="menuitem" onClick={go({ scrollTo: 'why' })} />
              </div>
            )}
          </li>

          <li className="nv-item"><a href="#footer" className="nv-link" onClick={go({ scrollTo: 'footer' })}>Contact</a></li>
        </ul>

        <div className="nv-right">
          <button type="button" className="nv-iconbtn" aria-label="Search rooms" onClick={() => openSpotlight()}><Ico n="search" /></button>

          <div className="nv-rel" onMouseEnter={() => enter('trip')} onMouseLeave={leave}>
            <Link to="/shopping-cart/cart" data-dd="trip" className="nv-stay" aria-label={`Your stay, ${rooms} ${rooms === 1 ? 'room' : 'rooms'}`}>
              <Ico n="bed" /><span>Your stay</span>{rooms > 0 && <b key={rooms}>{rooms}</b>}
            </Link>
            {open === 'trip' && (
              <div className="nv-drop nv-drop-r nv-trip" data-panel="trip" onKeyDown={panelKey}>
                {picked.length === 0
                  ? <><p className="nv-trip-empty">No rooms selected yet.</p><a href="#listings" className="nv-trip-go" onClick={go({ category: 'All', scrollTo: 'listings' })}>Browse rooms</a></>
                  : <>
                      <p className="nv-label">{nights} {nights === 1 ? 'night' : 'nights'} &middot; {rooms} {rooms === 1 ? 'room' : 'rooms'}</p>
                      {picked.map((r) => <div key={r._id} className="nv-trip-row"><span>{r.name} <small>&times; {cartItems[r._id]}</small></span><b>{formatPrice(r.price * cartItems[r._id] * nights)}</b></div>)}
                      <div className="nv-trip-total"><span>Total</span><b>{formatPrice(getTotalCartAmount())}</b></div>
                      <Link to="/shopping-cart/cart" className="nv-trip-go">Review your stay</Link>
                    </>}
              </div>
            )}
          </div>

          <div className="nv-rel nv-acct" onMouseEnter={() => enter('account')} onMouseLeave={leave}>
            <button type="button" data-dd="account" className="nv-avatar" aria-label="Account menu" aria-expanded={open === 'account'} aria-haspopup="true" onClick={() => toggle('account')} onKeyDown={trigKey('account')}><Ico n="user" /></button>
            {open === 'account' && (
              <div className="nv-drop nv-drop-r" data-panel="account" role="menu" onKeyDown={panelKey}>
                {token ? <>
                  <Item icon="cal" title="My bookings" desc="Upcoming and past stays" href="/shopping-cart/myorders" role="menuitem" onClick={(e) => { e.preventDefault(); setOpen(null); navigate('/shopping-cart/myorders'); }} />
                  <button role="menuitem" type="button" className="nv-plain" onClick={() => { setOpen(null); logout(); navigate(HOME); }}>Sign out</button>
                </> : <>
                  <button role="menuitem" type="button" className="nv-primary" onClick={() => { setOpen(null); setShowLogin(true); }}>Sign in / Join</button>
                  <Item icon="cal" title="My bookings" desc="Sign in to view" href="/shopping-cart/myorders" role="menuitem" onClick={(e) => { e.preventDefault(); setOpen(null); navigate('/shopping-cart/myorders'); }} />
                </>}
              </div>
            )}
          </div>

          <button type="button" className="nv-burger" aria-label={mobile ? 'Close menu' : 'Open menu'} aria-expanded={mobile} onClick={() => setMobile((v) => !v)}><span /><span /><span /></button>
        </div>
      </div>

      {mobile && (
        <div className="nv-drawer">
          <button type="button" className="nv-d-search" onClick={() => { setMobile(false); openSpotlight(); }}><Ico n="search" />Search rooms</button>
          <details open>
            <summary>Stay</summary>
            {types.map((t) => <a key={t.name} href="#listings" onClick={go({ category: t.name, scrollTo: 'listings' })}>{t.name}<em>from {formatPrice(t.from)}</em></a>)}
            {BUDGETS.map((b) => <a key={b.label} href="#listings" onClick={filter(b.f)}>{b.label}</a>)}
            {PARTY.map((b) => <a key={b.label} href="#listings" onClick={filter(b.f)}>{b.label}</a>)}
          </details>
          {styles.length > 0 && <details><summary>Travel style</summary>{styles.map((st) => <a key={st.label} href="#listings" onClick={style(st)}>{st.label}<em>{st.desc}</em></a>)}</details>}
          <details>
            <summary>Plan</summary>
            <a href="#find" onClick={go({ scrollTo: 'find' })}>Check availability</a>
            <a href="#featured" onClick={go({ scrollTo: 'featured' })}>Guest favourites</a>
            <a href="#why" onClick={go({ scrollTo: 'why' })}>Why book direct</a>
          </details>
          <details>
            <summary>Help</summary>
            <a href="tel:+27112331245">Call +27 11 233 1245</a>
            <a href="mailto:demo@onestop.com">Email us</a>
          </details>
          <Link to="/shopping-cart/myorders" className="nv-d-link">My bookings</Link>
          <Link to="/shopping-cart/cart" className="nv-d-link">Your stay{rooms > 0 ? ` (${rooms})` : ''}</Link>
          {token
            ? <button type="button" className="nv-d-cta" onClick={() => { logout(); setMobile(false); navigate(HOME); }}>Sign out</button>
            : <button type="button" className="nv-d-cta" onClick={() => { setMobile(false); setShowLogin(true); }}>Sign in / Join</button>}
        </div>
      )}
    </header>
  );
};

export default NavBar;
