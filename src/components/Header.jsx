import './styles/Header.css';
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

function Header() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isNavOpen, setIsNavOpen] = useState(screenWidth >= 769); // Initial state based on screen width

  const navRef = useRef(null);
  const hamburgerRef = useRef(null);

  const toggleNav = () => {
    if (screenWidth < 769) {
      setIsNavOpen(!isNavOpen);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setScreenWidth(newWidth);
      setIsNavOpen(newWidth >= 769); // Update isNavOpen on resize
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
    <header className="header">
      <div className="logo">
        Demo<span>Hotel Booking</span>
      </div>
      <nav ref={navRef} className={`nav ${isNavOpen ? 'active' : ''}`}>
        <a href="#home" onClick={() => screenWidth < 769 && setIsNavOpen(false)}>
          HOME
        </a>
        <a href="#about" onClick={() => screenWidth < 769 && setIsNavOpen(false)}>
          ABOUT
        </a>
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
  );
}

export default Header;