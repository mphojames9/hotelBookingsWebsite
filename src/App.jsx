// src/App.jsx
import { Routes, Route, Link } from 'react-router-dom';
import Home from './components/home/HomePage';
import HomePage from './components/home/HomePage';
import AboutPage from './components/about/About';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/hotel-bookings" element={<HomePage />} />
        <Route path="/hotel-bookings/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}

export default App;