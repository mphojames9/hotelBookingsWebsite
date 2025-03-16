// src/components/Hero.jsx
import './styles/Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>ENJOY YOUR WONDERFUL HOLIDAYS WITH A GREAT LUXURY EXPERIENCE</h1>
        <h2>Most Relaxing Place</h2>
        <div className="buttons">
          <button className="tour-button">TAKE A TOUR</button>
          <button className="learn-button">LEARN MORE</button>
        </div>
      </div>
    </section>
  );
}

export default Hero;