// src/components/Footer.jsx
import './Footer.css'
import { FaTwitter, FaFacebookF, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-section">
          <div className="logo-section">
            <h2 className="logo">Matli</h2>
            <p className="sub-logo">HOTEL BOOKING</p>
            <p className="description">
              A small river named Duden flows by their place and supplies it with the necessary regelialia.
            </p>
            <div className="social-icons">
              <a href="#" className="social-icon"><FaTwitter /></a>
              <a href="#" className="social-icon"><FaFacebookF /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
            </div>
          </div>
        </div>
        <div className="footer-section">
          <h3 className="section-title">Services</h3>
          <ul className="section-list">
            <li>Free Wifi</li>
            <li>Easy Booking</li>
            <li>Restaurant</li>
            <li>Swimming Pool</li>
            <li>Beauty & Health</li>
            <li> 60" Flatscreen TV</li>
            <li> Cold Aircondition</li>
            <li> Help & Support</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="section-title">Quick Links</h3>
          <ul className="section-list">
            <li> Home</li>
            <li> About</li>
            <li> Rooms</li>
            <li> Resto & Bar</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="section-title">Have a Questions?</h3>
          <ul className="contact-list">
            <li>
              <FaMapMarkerAlt className="contact-icon" />
              203 Fake St. Mountain View, Cape Town, SOUTH AFRICA
            </li>
            <li>
              <FaPhoneAlt className="contact-icon" />
              +27 21 3979 210
            </li>
            <li>
              <FaEnvelope className="contact-icon" />
              info@yourdomain.com
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
export default Footer;