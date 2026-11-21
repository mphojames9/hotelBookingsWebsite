import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import './NavBar.css';
import { assets } from '../../assets/assets';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';

const HOME = '/shopping-cart';

const Chev = () => <svg className="nv-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;
const BedIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="1.5" /></svg>;
const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>;

const NavBar = ({ setShowLogin }) => {
  const { cartItems, token, logout, food_list, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onHome = pathname.replace(/\/$/, '') === HOME;
  const rooms = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  const [open, setOpen] = useState(null);       // 'rooms' | 'explore' | 'account'
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoverType, setHoverType] = useState(null);
  const timer = useRef(null);
  const headerRef = useRef(null);

  // room types with a sample room each, for the mega menu
  const types = useMemo(() => {
    const map = new Map();
    food_list.forEach((r) => {
      const t = map.get(r.category) || { name: r.category, count: 0, from: Infinity, sample: r };
      t.count += 1; t.from = Math.min(t.from, r.price);
      map.set(r.category, t);
    });
    return [...map.values()].sort((a, b) => a.from - b.from);
  }, [food_list]);
  const active = types.find((t) => t.name === hoverType) || types[0];

  useEffect(() => { setOpen(null); setMobile(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const away = (e) => { if (headerRef.current && !headerRef.current.contains(e.target)) setOpen(null); };
    const esc = (e) => { if (e.key === 'Escape') { setOpen(null); setMobile(false); } };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, []);
  useEffect(() => { document.body.style.overflow = mobile ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [mobile]);

  // hover opens after a tiny delay and closes with a grace period, so the pointer can travel into the panel
  const enter = (name) => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(name), 60); };
  const leave = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(null), 160); };
  const toggle = (name) => setOpen((o) => (o === name ? null : name));

  const go = (state) => (e) => { e?.preventDefault(); setOpen(null); setMobile(false); navigate(HOME, { state: { ...state, t: Date.now() } }); };
  const clear = onHome && !scrolled && !open && !mobile;

  const dd = (name, label, panel, extra = '') => (
    <li className={`nv-item ${extra}`} onMouseEnter={() => enter(name)} onMouseLeave={leave}>
      <button type="button" className={open === name ? 'on' : ''} aria-expanded={open === name} aria-haspopup="true" onClick={() => toggle(name)}>{label}<Chev /></button>
      {open === name && panel}
    </li>
  );

  return (
    <header ref={headerRef} className={`nv ${clear ? 'is-clear' : 'is-solid'}`}>
      <div className="nv-bar">
        <Link to={HOME} className="nv-brand" aria-label="PrimeStay home"><img src={assets.logo} alt="" /></Link>

        <ul className="nv-menu">
          {dd('rooms', 'Rooms', (
            <div className="nv-mega" role="region" aria-label="Rooms">
              <div className="nv-mega-in">
                <div className="nv-col">
                  <p className="nv-label">Room types</p>
                  {types.length === 0 && <p className="nv-empty">Rooms are coming soon.</p>}
                  {types.map((t) => (
                    <a key={t.name} href="#listings" className={`nv-type${active?.name === t.name ? ' on' : ''}`} onMouseEnter={() => setHoverType(t.name)} onFocus={() => setHoverType(t.name)} onClick={go({ category: t.name, scrollTo: 'listings' })}>
                      <span><strong>{t.name}</strong><small>{t.count} {t.count === 1 ? 'room' : 'rooms'}</small></span>
                      <em>from {formatPrice(t.from)}</em>
                    </a>
                  ))}
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
          ))}

          {dd('explore', 'Explore', (
            <div className="nv-drop" role="menu">
              <a role="menuitem" href="#featured" onClick={go({ scrollTo: 'featured' })}><strong>Featured stays</strong><small>Our most-loved rooms</small></a>
              <a role="menuitem" href="#why" onClick={go({ scrollTo: 'why' })}><strong>Why book direct</strong><small>Best rate, free cancellation</small></a>
              <a role="menuitem" href="#listings" onClick={go({ scrollTo: 'listings' })}><strong>Check availability</strong><small>See what is free on your dates</small></a>
            </div>
          ), 'nv-rel')}

          <li className="nv-item"><a href="#footer" className="nv-link" onClick={go({ scrollTo: 'footer' })}>Contact</a></li>
        </ul>

        <div className="nv-right">
          <Link to="/shopping-cart/cart" className="nv-stay" aria-label={`Your stay, ${rooms} ${rooms === 1 ? 'room' : 'rooms'}`}>
            <BedIcon /><span>Your stay</span>{rooms > 0 && <b key={rooms}>{rooms}</b>}
          </Link>

          <div className="nv-item nv-rel nv-acct" onMouseEnter={() => enter('account')} onMouseLeave={leave}>
            <button type="button" className="nv-avatar" aria-label="Account menu" aria-expanded={open === 'account'} aria-haspopup="true" onClick={() => toggle('account')}><UserIcon /></button>
            {open === 'account' && (
              <div className="nv-drop nv-drop-r" role="menu">
                {token ? <>
                  <Link role="menuitem" to="/shopping-cart/myorders"><strong>My bookings</strong><small>Upcoming and past stays</small></Link>
                  <button role="menuitem" type="button" onClick={() => { setOpen(null); logout(); navigate(HOME); }}><strong>Sign out</strong></button>
                </> : <>
                  <button role="menuitem" type="button" className="nv-primary" onClick={() => { setOpen(null); setShowLogin(true); }}>Sign in / Join</button>
                  <Link role="menuitem" to="/shopping-cart/myorders"><strong>My bookings</strong><small>Sign in to view</small></Link>
                </>}
                <a role="menuitem" href="tel:+27112331245"><strong>Help</strong><small>+27 11 233 1245</small></a>
              </div>
            )}
          </div>

          <button type="button" className="nv-burger" aria-label={mobile ? 'Close menu' : 'Open menu'} aria-expanded={mobile} onClick={() => setMobile((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {mobile && (
        <div className="nv-drawer">
          <details open>
            <summary>Rooms</summary>
            {types.map((t) => <a key={t.name} href="#listings" onClick={go({ category: t.name, scrollTo: 'listings' })}>{t.name}<em>from {formatPrice(t.from)}</em></a>)}
            <a href="#listings" onClick={go({ category: 'All', scrollTo: 'listings' })}>Browse all rooms</a>
          </details>
          <details>
            <summary>Explore</summary>
            <a href="#featured" onClick={go({ scrollTo: 'featured' })}>Featured stays</a>
            <a href="#why" onClick={go({ scrollTo: 'why' })}>Why book direct</a>
          </details>
          <Link to="/shopping-cart/myorders" className="nv-d-link">My bookings</Link>
          <Link to="/shopping-cart/cart" className="nv-d-link">Your stay{rooms > 0 ? ` (${rooms})` : ''}</Link>
          <a href="#footer" className="nv-d-link" onClick={go({ scrollTo: 'footer' })}>Contact</a>
          {token
            ? <button type="button" className="nv-d-cta" onClick={() => { logout(); setMobile(false); navigate(HOME); }}>Sign out</button>
            : <button type="button" className="nv-d-cta" onClick={() => { setMobile(false); setShowLogin(true); }}>Sign in / Join</button>}
        </div>
      )}
    </header>
  );
};

export default NavBar;
