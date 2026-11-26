import './Site.css';
import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { MapEmbed, PageHero, mapsLink, useDocTitle } from '../../components/Editorial/Editorial';
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from '../../components/Icons';
import { CONTACT, IMG, LOCATIONS } from '../../data/site';

const TOPICS = ['General enquiry', 'Booking question', 'Invoice request', 'Dining reservation', 'Experiences & concierge', 'Long-stay rate', 'Family holiday', 'Celebration package', 'Group booking', 'Feedback'];

const Contact = () => {
  useDocTitle('Contact');
  const { url } = useContext(StoreContext);
  const { state } = useLocation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: state?.topic || TOPICS[0], location: state?.location || '', message: '' });
  const [status, setStatus] = useState({ busy: false, ok: null, text: '' });
  const [mapOf, setMapOf] = useState(LOCATIONS.find((l) => l.name === state?.location) || LOCATIONS[0]);

  const set = (event) => setForm((f) => ({ ...f, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ busy: true, ok: null, text: '' });
    try {
      const response = await axios.post(url + '/api/contact/send', form);
      setStatus({ busy: false, ok: response.data.success, text: response.data.message });
      if (response.data.success) setForm((f) => ({ ...f, name: '', phone: '', message: '' }));
    } catch (error) {
      setStatus({ busy: false, ok: false, text: error.response?.data?.message || 'Could not send your message. Please try again.' });
    }
  };

  return (
    <div className="ed">
      <PageHero eyebrow="We would love to hear from you" title="Contact us" lead="Questions, special requests or a plan you would like help with. Write to us or call the hotel directly." image={IMG.hero4} crumbs={[{ label: 'Contact' }]} />

      <section className="ed-sec st-contact">
        <form className="st-form" onSubmit={submit} noValidate>
          <h2>Send us a message</h2>
          <span className="ed-rule st-rule-left" aria-hidden="true" />
          <div className="st-two">
            <label>Full name<input name="name" value={form.name} onChange={set} required autoComplete="name" /></label>
            <label>Email<input name="email" type="email" value={form.email} onChange={set} required autoComplete="email" /></label>
          </div>
          <div className="st-two">
            <label>Phone (optional)<input name="phone" type="tel" value={form.phone} onChange={set} autoComplete="tel" /></label>
            <label>Hotel
              <select name="location" value={form.location} onChange={set}>
                <option value="">Any / not sure</option>
                {LOCATIONS.map((l) => <option key={l.slug} value={l.name}>{l.title}</option>)}
              </select>
            </label>
          </div>
          <label>Topic
            <select name="topic" value={form.topic} onChange={set}>
              {TOPICS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>Message<textarea name="message" rows="6" value={form.message} onChange={set} required maxLength={2000} placeholder="How can we help? Include your dates and booking reference if you have one." /></label>
          <button type="submit" className="ed-btn" disabled={status.busy}>{status.busy ? 'Sending…' : 'Send message'}</button>
          {status.text && <p role="status" className={`st-status ${status.ok ? 'ok' : 'err'}`}>{status.text}</p>}
        </form>

        <div className="st-side">
          <div className="st-info">
            <h3>Reservations</h3>
            <ul className="ed-lines">
              <li><PhoneIcon aria-hidden="true" /><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></li>
              <li><MailIcon aria-hidden="true" /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><ClockIcon aria-hidden="true" /><span>{CONTACT.hours}</span></li>
            </ul>
          </div>
          {LOCATIONS.map((l) => (
            <div className="st-info" key={l.slug}>
              <h3>{l.title}</h3>
              <ul className="ed-lines">
                <li><PinIcon aria-hidden="true" /><span>{l.address.join(', ')}</span></li>
                <li><PhoneIcon aria-hidden="true" /><a href={l.phoneHref}>{l.phone}</a></li>
                <li><MailIcon aria-hidden="true" /><a href={`mailto:${l.email}`}>{l.email}</a></li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="ed-sec tight">
        <div className="ed-filters" role="tablist" aria-label="Choose a hotel map">
          {LOCATIONS.map((l) => <button key={l.slug} type="button" role="tab" aria-selected={mapOf.slug === l.slug} className={mapOf.slug === l.slug ? 'on' : ''} onClick={() => setMapOf(l)}>{l.name}</button>)}
        </div>
        <MapEmbed key={mapOf.slug} query={`${mapOf.title}, ${mapOf.address.join(', ')}`} title={`Map of ${mapOf.title}`} />
        <p className="st-center st-mapnote"><a href={mapsLink(`${mapOf.title}, ${mapOf.address.join(', ')}`)} target="_blank" rel="noreferrer">Open {mapOf.title} in Google Maps</a></p>
      </section>
    </div>
  );
};

export default Contact;
