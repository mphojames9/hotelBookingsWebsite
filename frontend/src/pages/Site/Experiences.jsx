import './Site.css';
import React, { useState } from 'react';
import { CtaBand, Intro, PageHero, SectionHead, SiteIcon, useDocTitle } from '../../components/Editorial/Editorial';
import { Link } from 'react-router-dom';
import { openLightbox } from '../../components/Lightbox/Lightbox';
import { LeafIcon } from '../../components/Icons';
import { EXPERIENCES, IMG, LOCATIONS, SPA_PHOTOS } from '../../data/site';

const Experiences = () => {
  useDocTitle('Experiences');
  const [filter, setFilter] = useState('All');
  const tabs = ['All', ...LOCATIONS.map((l) => l.name)];
  const shown = EXPERIENCES.filter((e) => filter === 'All' || e.place === filter || e.place === 'All hotels');

  return (
    <div className="ed">
      <PageHero eyebrow="Beyond the hotel" title="Experiences" lead="Local guides, hidden corners and the best of each city, arranged for you by people who live there." image={IMG.spaPool} crumbs={[{ label: 'Experiences' }]} />
      <Intro heading="Things to do">
        Tell the front desk what you enjoy and we will take care of the rest: tickets, drivers, guides and tables at the right restaurants.
      </Intro>

      <section className="ed-sec">
        <div className="st-spa">
          <div className="st-spa-text">
            <span className="ed-row-ico"><LeafIcon aria-hidden="true" /></span>
            <SectionHead align="left" eyebrow="Spa & wellness" title="Slow down, properly" text="Warm stone, soft light and quiet hands. Choose a massage, a facial or a long soak, then finish by the pool. Treatments are available at all three hotels and are best booked ahead." />
            <Link className="ed-btn" to="/contact" state={{ topic: 'Experiences & concierge' }}>Book a treatment</Link>
          </div>
          <div className="st-spa-gallery">
            {SPA_PHOTOS.map((src, i) => (
              <button key={src} type="button" onClick={() => openLightbox({ images: SPA_PHOTOS, index: i, title: 'Spa & wellness' })} aria-label={`Open spa photo ${i + 1} of ${SPA_PHOTOS.length}`}>
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="ed-sec">
        <div className="ed-filters" role="tablist" aria-label="Filter by hotel">
          {tabs.map((t) => <button key={t} type="button" role="tab" aria-selected={filter === t} className={filter === t ? 'on' : ''} onClick={() => setFilter(t)}>{t === 'All' ? 'All hotels' : t}</button>)}
        </div>
        <div className="ed-feats">
          {shown.map((e) => (
            <article className="ed-feat" key={e.title}>
              <span className="ed-feat-ico"><SiteIcon name={e.icon} aria-hidden="true" /></span>
              <h3>{e.title}</h3>
              <p>{e.text}</p>
              <small>{e.place}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="ed-sec tight">
        <SectionHead eyebrow="Concierge" title="Your personal planner" text="Arriving soon? Send us your dates and interests and we will have a plan ready when you check in." />
        <div className="st-center"><Link className="ed-btn" to="/contact" state={{ topic: 'Experiences & concierge' }}>Plan my stay</Link></div>
      </section>

      <CtaBand title="Ready for your next trip?" text="Pick your dates, choose a room and we will do the rest." to="/" label="Find a room" state={{ scrollTo: 'find', t: 1 }} />
    </div>
  );
};

export default Experiences;
