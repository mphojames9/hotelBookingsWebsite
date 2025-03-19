import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-free/css/all.css';

function Home() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isNavOpen, setIsNavOpen] = useState(screenWidth >= 769);
  const navRef = useRef(null);
  const hamburgerRef = useRef(null);
  const [checkinDate, setCheckinDate] = useState(null);
  const [checkoutDate, setCheckoutDate] = useState(null);

  const toggleNav = () => {
    if (screenWidth < 769) {
      setIsNavOpen(!isNavOpen);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setScreenWidth(newWidth);
      setIsNavOpen(newWidth >= 769);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      if (isNavOpen) {
        gsap.fromTo(
          navRef.current,
          { y: -100, opacity: 0, display: 'flex' },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }
        );
      } else {
        gsap.to(navRef.current, {
          y: -100,
          opacity: 0,
          duration: 0.2,
          ease: 'power1.in',
          onComplete: () => {
            if (navRef.current) {
              navRef.current.style.display = 'none';
            }
          },
        });
      }
    }
  }, [isNavOpen]);

  useEffect(() => {
    if (hamburgerRef.current) {
      if (isNavOpen) {
        gsap.to(hamburgerRef.current.children[0], { rotate: 45, y: 8, duration: 0.2 });
        gsap.to(hamburgerRef.current.children[1], { opacity: 0, duration: 0.2 });
        gsap.to(hamburgerRef.current.children[2], { rotate: -45, y: -8, duration: 0.2 });
      } else {
        gsap.to(hamburgerRef.current.children[0], { rotate: 0, y: 0, duration: 0.2 });
        gsap.to(hamburgerRef.current.children[1], { opacity: 1, duration: 0.2 });
        gsap.to(hamburgerRef.current.children[2], { rotate: 0, y: 0, duration: 0.2 });
      }
    }
  }, [isNavOpen]);

  return (
    <div className="combined-app">
      <header className="header">
        <div className="logo">
          Matli<span>Hotel Booking</span>
        </div>
        <nav ref={navRef} className={`nav ${isNavOpen ? 'active' : ''}`}>
          <Link to="/hotel-bookings" onClick={() => screenWidth < 769 && setIsNavOpen(false)}>
            HOME
          </Link>
          <Link to="/hotel-bookings/about" onClick={() => screenWidth < 769 && setIsNavOpen(false)}>
            ABOUT
          </Link>
          <a href="#rooms" onClick={() => screenWidth < 769 && setIsNavOpen(false)}>
            ROOMS
          </a>
          <a href="#resto" onClick={() => screenWidth < 769 && setIsNavOpen(false)}>
            RESTO & BAR
          </a>
          <a href="#blog" onClick={() => screenWidth < 769 && setIsNavOpen(false)}>
            BLOG
          </a>
          <a href="#contact" onClick={() => screenWidth < 769 && setIsNavOpen(false)}>
            CONTACT
          </a>
        </nav>
        <button ref={hamburgerRef} className="hamburger" onClick={toggleNav}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p>ENJOY YOUR WONDERFUL HOLIDAYS WITH A GREAT LUXURY EXPERIENCE!</p>
          <h1>Most Relaxing Place</h1>
          <div className="buttons">
            <button className="tour-button">TAKE A TOUR</button>
            <button className="learn-button">LEARN MORE</button>
          </div>
        </div>
      </section>

      <section className="booking-form">
        <div className="form-container">
          <div className="form-group">
            <label htmlFor="checkin">CHECK-IN</label>
            <DatePicker
              selected={checkinDate}
              onChange={(date) => setCheckinDate(date)}
              placeholderText="Check-in Date"
              className="date-picker"
              calendarIcon={<FontAwesomeIcon icon={faCalendarAlt} style={{width:'1em', height:'1em', color:'white'}} />}
            />
          </div>
          <div className="form-group">
            <label htmlFor="checkout">CHECK-OUT</label>
            <DatePicker
              selected={checkoutDate}
              onChange={(date) => setCheckoutDate(date)}
              placeholderText="Check-out Date"
              className="date-picker"
              calendarIcon={<FontAwesomeIcon icon={faCalendarAlt} />}
            />
          </div>
          <div className="form-group">
            <label htmlFor="rooms">ROOMS</label>
            <select id="rooms">
              <option value="suite">Suite</option>
              <option value="deluxe">Deluxe</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="guests">GUESTS</label>
            <select id="guests">
              <option value="1">1 Person</option>
              <option value="2">2 Persons</option>
            </select>
          </div>
          <button className="check-button">CHECK AVAILABILITY</button>
        </div>
      </section>
    </div>
  );
}

export default Home;