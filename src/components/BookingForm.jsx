// src/components/BookingForm.jsx
import './styles/BookingForm.css';

function BookingForm() {
  return (
    <section className="booking-form">
      <div className="form-container">
        <div className="form-group">
          <label htmlFor="checkin">CHECK-IN</label>
          <input type="date" id="checkin" />
        </div>
        <div className="form-group">
          <label htmlFor="checkout">CHECK-OUT</label>
          <input type="date" id="checkout" />
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
  );
}

export default BookingForm;