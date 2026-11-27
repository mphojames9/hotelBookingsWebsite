import './Site.css';
import React, { useContext } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { CtaBand, Faq, MapEmbed, PageHero, SectionHead, SiteIcon, mapsLink, useDocTitle } from '../../components/Editorial/Editorial';
import RoomRow from '../../components/RoomRow/RoomRow';
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from '../../components/Icons';
import { FAQS, LOCATIONS } from '../../data/site';

const LocationDetail = () => {
  const { slug } = useParams();
  const loc = LOCATIONS.find((l) => l.slug === slug);
  const { food_list } = useContext(StoreContext);
  useDocTitle(loc?.title);
  if (!loc) return <Navigate to="/locations" replace />;

  const rooms = food_list.filter((r) => r.location === loc.name);
  const others = LOCATIONS.filter((l) => l.slug !== loc.slug);
  const query = `${loc.title}, ${loc.address.join(', ')}`;

  return (
    <div className="ed">
      <PageHero eyebrow={`${loc.city}, ${loc.province}`} title={loc.title} lead={loc.tag} image={loc.images[0]} crumbs={[{ label: 'Hotels', to: '/locations' }, { label: loc.name }]} />

      <section className="ed-sec st-split">
        <div>
          <SectionHead align="left" eyebrow="The hotel" title={`Welcome to ${loc.name}`} />
          <p className="st-copy">{loc.intro}</p>
          <ul className="ed-lines st-high">
            {loc.highlights.map((h) => <li key={h.text}><SiteIcon name={h.icon} aria-hidden="true" /><span>{h.text}</span></li>)}
          </ul>
        </div>
        <aside className="st-info" aria-label={`${loc.title} contact details`}>
          <h3>Find us</h3>
          <ul className="ed-lines">
            <li><PinIcon aria-hidden="true" /><address>{loc.address.map((line) => <span key={line}>{line}<br /></span>)}</address></li>
            <li><PhoneIcon aria-hidden="true" /><a href={loc.phoneHref}>{loc.phone}</a></li>
            <li><MailIcon aria-hidden="true" /><a href={`mailto:${loc.email}`}>{loc.email}</a></li>
            <li><ClockIcon aria-hidden="true" /><span>Check-in from {loc.checkIn}<br />Check-out by {loc.checkOut}</span></li>
          </ul>
          <div className="st-info-btns">
            <Link className="ed-btn block" to="/" state={{ location: loc.name, category: 'All', scrollTo: 'listings', t: Date.now() }}>Book a room</Link>
            <a className="ed-btn ed-btn-line block" href={mapsLink(query)} target="_blank" rel="noreferrer">Get directions</a>
          </div>
        </aside>
      </section>

      <section className="ed-sec tight">
        <div className="st-gallery">
          {loc.images.map((src, i) => <img key={src} src={src} alt={`${loc.title}, photo ${i + 1}`} loading="lazy" />)}
        </div>
      </section>

      <section className="ed-sec">
        <SectionHead eyebrow="Accommodation" title={`Rooms at ${loc.title}`} text="Choose a room, set your dates on the next page and see live availability." />
        {rooms.length === 0 ? (
          <p className="st-empty">Rooms for this hotel are being added. <Link to="/" state={{ category: 'All', scrollTo: 'listings', t: Date.now() }}>Browse every room</Link> in the meantime.</p>
        ) : (
          <div className="rr-list">{rooms.map((r, i) => <RoomRow key={r._id} room={r} index={i} />)}</div>
        )}
      </section>

      <section className="ed-sec tight">
        <MapEmbed query={query} title={`Map of ${loc.title}`} />
      </section>

      <section className="ed-sec">
        <SectionHead eyebrow="Good to know" title="Questions about this hotel" />
        <Faq items={FAQS.filter((f) => f.cat === 'Your stay').slice(0, 4)} />
      </section>

      <section className="ed-sec tight">
        <SectionHead eyebrow="Also in South Africa" title="Our other hotels" />
        <div className="st-others">
          {others.map((o) => (
            <Link key={o.slug} to={`/locations/${o.slug}`} className="st-other">
              <img src={o.images[0]} alt="" loading="lazy" />
              <span><small>{o.city}</small><strong>{o.title}</strong></span>
            </Link>
          ))}
        </div>
      </section>

      <CtaBand title="Plan your stay" text={`Questions about ${loc.title}? The team is happy to help.`} to="/contact" state={{ location: loc.name }} label="Contact the hotel" />
    </div>
  );
};

export default LocationDetail;
