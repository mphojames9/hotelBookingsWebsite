// src/App.jsx
import Header from './components/Home/Header';
import Hero from './components/Home/Hero';
import BookingForm from './components/Home/BookingForm';
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