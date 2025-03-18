// src/components/BookingForm.jsx
import './BookingForm.css';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function BookingForm() {
  const [checkinDate, setCheckinDate] = useState(null);
  const [checkoutDate, setCheckoutDate] = useState(null);

  return (
    <section className="booking-form">
      <div className="form-container">
        <div className="form-group">
          <label htmlFor="checkin">CHECK-IN</label>
          <DatePicker
            selected={checkinDate}
            onChange={(date) => setCheckinDate(date)}
            placeholderText="Select Check-in Date"
            className="date-picker"
          />
        </div>
        <div className="form-group">
          <label htmlFor="checkout">CHECK-OUT</label>
          <DatePicker
            selected={checkoutDate}
            onChange={(date) => setCheckoutDate(date)}
            placeholderText="Select Check-out Date"
            className="date-picker"
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
  );
}

export default BookingForm;