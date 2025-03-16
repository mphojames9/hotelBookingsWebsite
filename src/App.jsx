// src/App.jsx
import Header from './components/Header';
import Hero from './components/Hero';
import BookingForm from './components/BookingForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <BookingForm />
    </div>
  );
}

export default App;