import './Site.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { CtaBand, Intro, PageHero, SectionHead, SiteIcon, useDocTitle } from '../../components/Editorial/Editorial';
import { BENEFITS, IMG, OFFERS } from '../../data/site';

const Offers = () => {
  useDocTitle('Offers');
  return (
    <div className="ed">
      <PageHero eyebrow="Book direct" title="Offers" lead="Better rates, simpler booking and a real person when you need one." image={IMG.heroTwin} crumbs={[{ label: 'Offers' }]} />
      <Intro heading="Why book with us">
        When you book on this website you get our best available rate, instant confirmation and free cancellation, with no booking fees on top.
      </Intro>

      <section className="ed-sec">
        <div className="ed-feats">
          {BENEFITS.map((b) => (
            <article className="ed-feat" key={b.title}>
              <span className="ed-feat-ico"><SiteIcon name={b.icon} aria-hidden="true" /></span>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ed-sec">
        <SectionHead eyebrow="Tailored for you" title="Stays made to measure" text="Tell us a little about your trip and the hotel team will send you a personal offer within a working day." />
        <div className="ed-grid">
          {OFFERS.map((o) => (
            <article className="ed-card" key={o.title}>
              <div className="ed-card-img"><img src={o.image} alt="" loading="lazy" /></div>
              <div className="ed-card-body">
                <span className="ed-tag">{o.tag}</span>
                <h3>{o.title}</h3>
                <span className="ed-rule" aria-hidden="true" />
                <p className="ed-card-text">{o.text}</p>
              </div>
              <div className="ed-card-foot"><Link className="ed-btn block" to="/contact" state={{ topic: o.topic }}>Enquire now</Link></div>
            </article>
          ))}
        </div>
      </section>

      <CtaBand title="Ready to book?" text="Choose your dates and see exactly what is available." to="/" state={{ scrollTo: 'find', t: 1 }} label="Check availability" />
    </div>
  );
};

export default Offers;
