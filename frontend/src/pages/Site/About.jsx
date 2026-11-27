import './Site.css';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { CtaBand, Intro, PageHero, SectionHead, SiteIcon, useDocTitle } from '../../components/Editorial/Editorial';
import { IMG, LOCATIONS } from '../../data/site';

const VALUES = [
  { icon: 'tag', title: 'Honest prices', text: 'We show the full price for your stay up front. No resort fees, no surprises at checkout.' },
  { icon: 'calendar', title: 'Real availability', text: 'Pick your dates and you only see rooms that are genuinely free, so what you book is what you get.' },
  { icon: 'heart', title: 'Local hosts', text: 'Every hotel is run by a team from its own city, who love sharing the places they love.' },
  { icon: 'shield', title: 'Peace of mind', text: 'Secure card payments, instant confirmation and free cancellation up to 48 hours before check-in.' },
];

const About = () => {
  useDocTitle('About us');
  const { food_list, hotelRating } = useContext(StoreContext);
  const overall = hotelRating();
  const stats = [
    { n: LOCATIONS.length, label: 'Hotels in South Africa' },
    { n: food_list.length || '15', label: 'Room types to choose from' },
    { n: overall ? overall.average.toFixed(1) : '24/7', label: overall ? `Guest rating from ${overall.count} reviews` : 'Front desk, every night' },
    { n: '48h', label: 'Free cancellation window' },
  ];

  return (
    <div className="ed">
      <PageHero eyebrow="Our story" title="About PrimeStay" lead="Thoughtful hotels, honest prices and a warm welcome in three of South Africa’s favourite cities." image={IMG.heroLiving} crumbs={[{ label: 'About us' }]} />
      <Intro heading="Hospitality, made simple">
        We started PrimeStay with a simple idea: booking a good hotel should be clear, fair and quick. You choose your dates, see what is really available, pay securely and get your confirmation straight away.
      </Intro>

      <section className="ed-sec">
        <div className="st-stats">
          {stats.map((s) => <div key={s.label}><strong>{s.n}</strong><span>{s.label}</span></div>)}
        </div>
      </section>

      <section className="ed-sec">
        <div className="ed-rows">
          <div className="ed-row">
            <div className="ed-row-img"><img src={IMG.fourPoster} alt="A PrimeStay bedroom with a four-poster bed" loading="lazy" /></div>
            <div className="ed-row-text">
              <h3>Made for real stays</h3>
              <span className="ed-rule st-rule-left" aria-hidden="true" />
              <p>From a quiet room for one to a family apartment for eight, each room is photographed honestly, described clearly and priced fairly. We would rather you know exactly what to expect and be delighted than surprised.</p>
              <Link className="ed-btn" to="/" state={{ scrollTo: 'listings', t: Date.now() }}>Explore rooms</Link>
            </div>
          </div>
          <div className="ed-row">
            <div className="ed-row-img"><img src={IMG.roomSkyline} alt="A PrimeStay room with skyline views" loading="lazy" /></div>
            <div className="ed-row-text">
              <h3>Rooted in place</h3>
              <span className="ed-rule st-rule-left" aria-hidden="true" />
              <p>Johannesburg, Cape Town and Durban each have a character of their own, and so does each of our hotels. Our teams recommend the restaurants, routes and corners they would send their own friends to.</p>
              <Link className="ed-btn ed-btn-line" to="/locations">Meet our hotels</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ed-sec">
        <SectionHead eyebrow="What we believe" title="Our promise to you" />
        <div className="ed-feats">
          {VALUES.map((v) => (
            <article className="ed-feat" key={v.title}>
              <span className="ed-feat-ico"><SiteIcon name={v.icon} aria-hidden="true" /></span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </section>

      <CtaBand title="Come and stay with us" text="Choose a hotel, pick your dates and we will take care of the rest." to="/locations" label="See our hotels" />
    </div>
  );
};

export default About;
