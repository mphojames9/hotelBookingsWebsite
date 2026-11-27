import './Site.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { CtaBand, Intro, PageHero, SectionHead, SiteIcon, useDocTitle } from '../../components/Editorial/Editorial';
import { ClockIcon, PinIcon } from '../../components/Icons';
import { DINING_EVENTS, DINING_EXPERIENCES, IMG, VENUES } from '../../data/site';

const Dining = () => {
  useDocTitle('Dining');
  return (
    <div className="ed">
      <PageHero eyebrow="Taste of South Africa" title="Dining" lead="Wood-fired grills, fresh seafood and long lazy lunches, made with local ingredients." image={IMG.heroDining} crumbs={[{ label: 'Dining' }]} />
      <Intro heading="All food and drink">
        Each PrimeStay hotel has its own kitchen with its own personality. Book a table for dinner, linger over afternoon tea or simply order a sundowner and watch the light change.
      </Intro>

      <section className="ed-sec">
        <div className="ed-grid cols-3">
          {VENUES.map((v) => (
            <article className="ed-card" key={v.name}>
              <div className="ed-card-img"><img src={v.image} alt={v.name} loading="lazy" /></div>
              <div className="ed-card-body">
                <span className="ed-tag">PrimeStay {v.location}</span>
                <h3>{v.name}</h3>
                <span className="ed-rule" aria-hidden="true" />
                <p className="ed-card-text">{v.text}</p>
                <ul className="ed-lines st-lines">
                  <li><SiteIcon name={v.icon} aria-hidden="true" /><span>{v.cuisine}</span></li>
                  <li><ClockIcon aria-hidden="true" /><span>{v.hours}</span></li>
                  <li><PinIcon aria-hidden="true" /><span>PrimeStay {v.location}</span></li>
                </ul>
              </div>
              <div className="ed-card-foot"><Link className="ed-btn block" to="/contact" state={{ topic: 'Dining reservation', location: v.location }}>Reserve a table</Link></div>
            </article>
          ))}
        </div>
      </section>

      <section className="ed-sec">
        <SectionHead eyebrow="Dining experiences" title="Moments worth lingering over" />
        <div className="ed-rows">
          {DINING_EXPERIENCES.map((e) => (
            <div className="ed-row" key={e.title}>
              <div className="ed-row-img"><img src={e.image} alt="" loading="lazy" /></div>
              <div className="ed-row-text">
                <span className="ed-row-ico"><SiteIcon name={e.icon} aria-hidden="true" /></span>
                <h3>{e.title}</h3>
                <p className="ed-row-when">{e.when}</p>
                <p>{e.text}</p>
                <Link className="ed-btn ed-btn-line" to="/contact" state={{ topic: 'Dining reservation' }}>Enquire</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ed-sec">
        <SectionHead eyebrow="Events" title="Curated culinary evenings" text="Limited seats, set menus and the chefs at the table. Dates and details are confirmed by the hotel." />
        <ul className="ed-events">
          {DINING_EVENTS.map((ev) => (
            <li key={ev.title}>
              <span className="ed-date">{ev.date}</span>
              <div><h3>{ev.title}</h3><p>PrimeStay {ev.place} &middot; {ev.text}</p></div>
              <Link className="ed-btn ed-btn-line" to="/contact" state={{ topic: 'Dining reservation', location: ev.place }}>Reserve</Link>
            </li>
          ))}
        </ul>
      </section>

      <CtaBand title="Dining with a group?" text="Private dining, celebrations and corporate dinners can be arranged at every hotel." to="/contact" state={{ topic: 'Group booking' }} label="Make an enquiry" />
    </div>
  );
};

export default Dining;
