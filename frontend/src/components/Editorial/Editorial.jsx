import React, { useContext, useEffect, useRef, useState } from 'react';
import './Editorial.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import * as I from '../Icons';

/* ---------- icons referenced by name from data/site.js ---------- */
const ICONS = {
  train: I.TrainIcon, bag: I.BagIcon, plane: I.PlaneIcon, briefcase: I.BriefcaseIcon, waves: I.WavesIcon,
  mountain: I.MountainIcon, sun: I.SunIcon, utensils: I.UtensilsIcon, coffee: I.CoffeeIcon, glass: I.GlassIcon,
  leaf: I.LeafIcon, compass: I.CompassIcon, heart: I.HeartIcon, car: I.CarIcon, shield: I.ShieldIcon,
  tag: I.TagIcon, clock: I.ClockIcon, star: I.StarIcon, calendar: I.CalendarIcon, users: I.UsersIcon,
  cake: I.CakeIcon, pin: I.PinIcon, phone: I.PhoneIcon, mail: I.MailIcon, check: I.CheckIcon, help: I.HelpIcon, gift: I.GiftIcon,
};
export const SiteIcon = ({ name, ...props }) => {
  const Cmp = ICONS[name] || I.CheckIcon;
  return <Cmp {...props} />;
};

// sets the browser tab title for a page
export const useDocTitle = (title) => {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | PrimeStay` : previous;
    return () => { document.title = previous; };
  }, [title]);
};

/* ---------- page banner ---------- */
export const PageHero = ({ eyebrow, title, lead, image, crumbs = [], children }) => (
  <header className="ed-hero">
    <img src={image} alt="" />
    <div className="ed-hero-shade" aria-hidden="true" />
    <div className="ed-hero-in">
      <nav className="ed-crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        {crumbs.map((c) => (c.to ? <React.Fragment key={c.label}><span aria-hidden="true">/</span><Link to={c.to}>{c.label}</Link></React.Fragment> : <React.Fragment key={c.label}><span aria-hidden="true">/</span><span aria-current="page">{c.label}</span></React.Fragment>))}
      </nav>
      {eyebrow && <p className="ed-eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {lead && <p className="ed-lead">{lead}</p>}
      {children}
    </div>
  </header>
);

/* centred serif introduction, then a thin tracked heading */
export const Intro = ({ children, heading }) => (
  <section className="ed-intro">
    <p>{children}</p>
    {heading && <h2 className="ed-thin">{heading}</h2>}
  </section>
);

export const SectionHead = ({ eyebrow, title, text, align = 'center' }) => (
  <div className={`ed-sechead ed-${align}`}>
    {eyebrow && <p className="ed-eyebrow dark">{eyebrow}</p>}
    <h2>{title}</h2>
    <span className="ed-rule" aria-hidden="true" />
    {text && <p>{text}</p>}
  </div>
);

/* ---------- photo carousel with a "1 / 3" counter ---------- */
export const Carousel = ({ images, alt = '', ratio = '3 / 2' }) => {
  const [i, setI] = useState(0);
  const go = (step) => setI((n) => (n + step + images.length) % images.length);
  return (
    <div className="ed-car" style={{ aspectRatio: ratio }}>
      <img key={images[i]} src={images[i]} alt={`${alt} (photo ${i + 1} of ${images.length})`} loading="lazy" />
      {images.length > 1 && (
        <div className="ed-car-ctl">
          <button type="button" aria-label="Previous photo" onClick={() => go(-1)}><I.ChevronLeftIcon /></button>
          <span aria-hidden="true">{i + 1} / {images.length}</span>
          <button type="button" aria-label="Next photo" onClick={() => go(1)}><I.ChevronRightIcon /></button>
        </div>
      )}
    </div>
  );
};

/* ---------- FAQ accordion ---------- */
export const Faq = ({ items }) => {
  const [open, setOpen] = useState(0);
  return (
    <div className="ed-faq">
      {items.map((item, n) => (
        <div key={item.q} className={`ed-faq-item${open === n ? ' open' : ''}`}>
          <h3>
            <button type="button" aria-expanded={open === n} aria-controls={`faq-${n}`} id={`faq-h-${n}`} onClick={() => setOpen(open === n ? -1 : n)}>
              <span>{item.q}</span>
              <I.PlusSmallIcon aria-hidden="true" />
            </button>
          </h3>
          <div className="ed-faq-body" id={`faq-${n}`} role="region" aria-labelledby={`faq-h-${n}`}>
            <div><p>{item.a}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ---------- Google map (no API key needed) ---------- */
export const MapEmbed = ({ query, title }) => (
  <div className="ed-map">
    <iframe title={title || 'Map'} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`} />
  </div>
);
export const mapsLink = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

/* ---------- dark call-to-action band ---------- */
export const CtaBand = ({ title, text, to, label, state }) => (
  <section className="ed-cta">
    <div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
    <Link to={to} state={state} className="ed-btn ed-btn-light">{label}</Link>
  </section>
);

/* ---------- e-mail sign-up (saved in the admin Messages page) ---------- */
export const Newsletter = ({ dark = false }) => {
  const { url } = useContext(StoreContext);
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ busy: false, ok: null, text: '' });
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const submit = async (event) => {
    event.preventDefault();
    setState({ busy: true, ok: null, text: '' });
    try {
      const response = await axios.post(url + '/api/contact/send', { kind: 'newsletter', email });
      setState({ busy: false, ok: response.data.success, text: response.data.message });
      if (response.data.success) setEmail('');
    } catch (error) {
      setState({ busy: false, ok: false, text: error.response?.data?.message || 'Could not sign you up. Please try again.' });
    }
  };

  return (
    <form className={`ed-news${dark ? ' dark' : ''}`} onSubmit={submit}>
      <label htmlFor="news-email" className="sr-only">Email address</label>
      <input id="news-email" type="email" required placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <button type="submit" className="ed-btn ed-btn-gold" disabled={state.busy}>{state.busy ? 'Sending…' : 'Subscribe'}</button>
      {state.text && <p role="status" className={state.ok ? 'ok' : 'err'}>{state.text}</p>}
    </form>
  );
};
