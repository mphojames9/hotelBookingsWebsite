import './Site.css';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';
import { CtaBand, Carousel, Intro, PageHero, SiteIcon, useDocTitle } from '../../components/Editorial/Editorial';
import { PinIcon } from '../../components/Icons';
import { IMG, LOCATIONS } from '../../data/site';

const Locations = () => {
  useDocTitle('Our hotels');
  const { food_list } = useContext(StoreContext);
  const about = (name) => {
    const rooms = food_list.filter((r) => r.location === name);
    return { count: rooms.length, from: rooms.length ? Math.min(...rooms.map((r) => r.price)) : null };
  };

  return (
    <div className="ed">
      <PageHero eyebrow="Three cities, one standard" title="Our hotels" lead="From the Johannesburg skyline to the Atlantic and the Indian Ocean, PrimeStay has a place waiting for you." image={IMG.hero1} crumbs={[{ label: 'Hotels' }]} />
      <Intro heading="Choose your destination">
        Every PrimeStay hotel is run by a local team who know their city well, with the same honest prices, instant confirmation and free cancellation up to 48 hours before check-in.
      </Intro>

      <section className="ed-sec">
        <div className="ed-grid cols-3">
          {LOCATIONS.map((l) => {
            const s = about(l.name);
            return (
              <article className="ed-card" key={l.slug}>
                <Carousel images={l.images} alt={l.title} />
                <div className="ed-card-body">
                  <span className="ed-tag">{l.tag}</span>
                  <h3>{l.title}</h3>
                  <span className="ed-rule" aria-hidden="true" />
                  <p className="ed-card-text">{l.intro}</p>
                  <ul className="ed-lines st-lines">
                    <li><PinIcon aria-hidden="true" /><span>{l.address.join(', ')}</span></li>
                    {l.highlights.slice(0, 2).map((h) => <li key={h.text}><SiteIcon name={h.icon} aria-hidden="true" /><span>{h.text}</span></li>)}
                    {s.count > 0 && <li><SiteIcon name="tag" aria-hidden="true" /><span>{s.count} {s.count === 1 ? 'room type' : 'room types'} from {formatPrice(s.from)} a night</span></li>}
                  </ul>
                </div>
                <div className="ed-card-foot st-foot">
                  <Link className="ed-btn block" to={`/locations/${l.slug}`}>Explore this hotel</Link>
                  <Link className="ed-btn ed-btn-line block" to="/" state={{ location: l.name, category: 'All', scrollTo: 'listings', t: Date.now() }}>View rooms</Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CtaBand title="Not sure where to go?" text="Tell us what kind of trip you are planning and our team will suggest the right hotel." to="/contact" label="Talk to us" />
    </div>
  );
};

export default Locations;
