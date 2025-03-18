// src/components/Hero.jsx
import './Hero.css';

function Hero() {
  return (
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
  );
}

export default Hero;