import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Footer = () => (
  <footer className="ps-footer" id="footer">
    <div className="ps-footer-inner">
      <div className="ps-footer-brand">
        <img src={assets.logo} alt="PrimeStay" />
        <h2>Book with confidence</h2>
        <p>Comfortable rooms and suites, confirmed instantly. Free cancellation up to 48 hours before check-in.</p>
      </div>
      <div>
        <h3>Explore</h3>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/cart">Your stay</Link></li>
          <li><Link to="/myorders">My bookings</Link></li>
        </ul>
      </div>
      <div>
        <h3>Contact us</h3>
        <ul>
          <li><a href="tel:+27112331245">+27 11 233 1245</a></li>
          <li><a href="mailto:demo@onestop.com">demo@onestop.com</a></li>
        </ul>
      </div>
    </div>
    <p className="ps-footer-copy">&copy; {new Date().getFullYear()} PrimeStay. All rights reserved.</p>
  </footer>
);

export default Footer;
