import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { Newsletter } from '../Editorial/Editorial';
import { MailIcon, PhoneIcon, PinIcon } from '../Icons';
import { CONTACT, LOCATIONS } from '../../data/site';

const Footer = () => (
  <footer className="ps-footer" id="footer">
    <div className="ps-footer-top">
      <div>
        <h2>Stay in touch</h2>
        <p>News, seasonal offers and travel ideas from our three hotels. No spam, unsubscribe any time.</p>
      </div>
      <Newsletter dark />
    </div>

    <div className="ps-footer-inner">
      <div className="ps-footer-brand">
        <img src={assets.logo} alt="PrimeStay" />
        <p>Comfortable rooms and suites in Johannesburg, Cape Town and Durban, confirmed instantly. Free cancellation up to 48 hours before check-in.</p>
        <ul className="ps-footer-contact">
          <li><PhoneIcon aria-hidden="true" /><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></li>
          <li><MailIcon aria-hidden="true" /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
        </ul>
        <div className="ps-footer-social">
          <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="PrimeStay on Facebook"><img src={assets.facebook_icon} alt="" /></a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="PrimeStay on X"><img src={assets.twitter_icon} alt="" /></a>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="PrimeStay on LinkedIn"><img src={assets.linkedin_icon} alt="" /></a>
        </div>
      </div>

      <div>
        <h3>Our hotels</h3>
        <ul>
          {LOCATIONS.map((l) => (
            <li key={l.slug}>
              <Link to={`/locations/${l.slug}`}>{l.title}</Link>
              <small><PinIcon aria-hidden="true" />{l.address[1]}</small>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Discover</h3>
        <ul>
          <li><Link to="/dining">Dining</Link></li>
          <li><Link to="/experiences">Experiences</Link></li>
          <li><Link to="/offers">Offers</Link></li>
          <li><Link to="/about">About us</Link></li>
        </ul>
      </div>

      <div>
        <h3>Guest help</h3>
        <ul>
          <li><Link to="/faq">FAQ</Link></li>
          <li><Link to="/contact">Contact us</Link></li>
          <li><Link to="/myorders">My bookings</Link></li>
          <li><Link to="/cart">Your stay</Link></li>
        </ul>
      </div>
    </div>

    <p className="ps-footer-copy">&copy; {new Date().getFullYear()} PrimeStay Hotels. All rights reserved.</p>
  </footer>
);

export default Footer;
