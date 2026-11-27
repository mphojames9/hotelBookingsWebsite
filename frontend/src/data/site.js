// All the written content of the website lives here, so it is easy to change in one place.
// PLACEHOLDERS: the addresses, phone numbers, e-mail addresses, prices, dates and policies below are
// sample content. Replace them with your real details before you go live.
import heroLiving from '../assets/photos/hero-living.jpg';
import heroTwin from '../assets/photos/hero-twin.jpg';
import heroRooms from '../assets/photos/hero-rooms.jpg';
import heroDining from '../assets/photos/hero-dining.jpg';
import suiteKitchen from '../assets/photos/suite-kitchen.jpg';
import suiteDesk from '../assets/photos/suite-desk.jpg';
import twinSuite from '../assets/photos/twin-suite.jpg';
import bedroomBench from '../assets/photos/bedroom-bench.jpg';
import roomSkyline from '../assets/photos/room-skyline.jpg';
import roomModern from '../assets/photos/room-modern.jpg';
import fourPoster from '../assets/photos/four-poster.jpg';
import bedroomChandelier from '../assets/photos/bedroom-chandelier.jpg';
import suiteDouble from '../assets/photos/suite-double.jpg';
import suiteTriple from '../assets/photos/suite-triple.jpg';
import diningSalad from '../assets/photos/dining-salad.jpg';
import diningRoom from '../assets/photos/dining-room.jpg';
import diningSeafood from '../assets/photos/dining-seafood.jpg';
import diningPlate from '../assets/photos/dining-plate.jpg';
import diningDessert from '../assets/photos/dining-dessert.jpg';
import spaMassage from '../assets/photos/spa-massage.jpg';
import spaRoom from '../assets/photos/spa-room.jpg';
import spaPool from '../assets/photos/spa-pool.jpg';
import spaSuite from '../assets/photos/spa-suite.jpg';

export const IMG = { heroLiving, heroTwin, heroRooms, heroDining, suiteKitchen, suiteDesk, twinSuite, bedroomBench, roomSkyline, roomModern, fourPoster, bedroomChandelier, suiteDouble, suiteTriple, diningSalad, diningRoom, diningSeafood, diningPlate, diningDessert, spaMassage, spaRoom, spaPool, spaSuite };

export const CONTACT = {
  phone: '+27 11 233 1245',
  phoneHref: 'tel:+27112331245',
  email: 'stay@primestay.co.za',
  hours: 'Reservations: every day, 07:00 to 21:00',
};

// `name` must match backend/config/locations.js and admin/src/utils/categories.js
export const LOCATIONS = [
  {
    slug: 'sandton', name: 'Sandton', city: 'Johannesburg', province: 'Gauteng', tag: 'City & business',
    title: 'PrimeStay Sandton',
    address: ['24 Grayston Drive', 'Sandton, Johannesburg', '2196'],
    phone: '+27 11 233 1245', phoneHref: 'tel:+27112331245', email: 'sandton@primestay.co.za',
    checkIn: '14:00', checkOut: '11:00',
    intro: 'Skyline views, a quiet work lounge and the city’s best shopping and dining a few minutes away. Built for business travellers and for anyone who likes a city break with room to breathe.',
    highlights: [
      { icon: 'train', text: 'Gautrain station about 6 minutes away' },
      { icon: 'bag', text: 'Minutes from Sandton City and Nelson Mandela Square' },
      { icon: 'plane', text: 'About 30 minutes from OR Tambo International' },
      { icon: 'briefcase', text: 'Work lounge, fast Wi-Fi and meeting nooks' },
    ],
    images: [IMG.roomSkyline, IMG.suiteKitchen, IMG.suiteDesk],
  },
  {
    slug: 'sea-point', name: 'Sea Point', city: 'Cape Town', province: 'Western Cape', tag: 'Ocean & mountain',
    title: 'PrimeStay Sea Point',
    address: ['52 Beach Road', 'Sea Point, Cape Town', '8005'],
    phone: '+27 21 555 0142', phoneHref: 'tel:+27215550142', email: 'seapoint@primestay.co.za',
    checkIn: '14:00', checkOut: '11:00',
    intro: 'A short stroll from the promenade, with the Atlantic on one side and Lion’s Head on the other. Wake up to sea light, walk to breakfast and be at the V&A Waterfront in minutes.',
    highlights: [
      { icon: 'waves', text: 'Steps from the Sea Point promenade' },
      { icon: 'bag', text: 'About 10 minutes to the V&A Waterfront' },
      { icon: 'mountain', text: 'Table Mountain and Lion’s Head views' },
      { icon: 'plane', text: 'About 25 minutes from Cape Town International' },
    ],
    images: [IMG.bedroomBench, IMG.roomModern, IMG.fourPoster],
  },
  {
    slug: 'umhlanga', name: 'Umhlanga', city: 'Durban', province: 'KwaZulu-Natal', tag: 'Beach & sunshine',
    title: 'PrimeStay Umhlanga',
    address: ['7 Lighthouse Road', 'Umhlanga Rocks, Durban', '4319'],
    phone: '+27 31 555 0187', phoneHref: 'tel:+27315550187', email: 'umhlanga@primestay.co.za',
    checkIn: '14:00', checkOut: '11:00',
    intro: 'Warm water, long beaches and a pool terrace that catches the evening sun. Our Umhlanga hotel is made for slow family holidays and long weekends by the Indian Ocean.',
    highlights: [
      { icon: 'sun', text: 'Pool terrace with sunset views' },
      { icon: 'waves', text: 'A few minutes from the Umhlanga beachfront' },
      { icon: 'bag', text: 'Close to Gateway shopping and restaurants' },
      { icon: 'plane', text: 'About 15 minutes from King Shaka International' },
    ],
    images: [IMG.spaPool, IMG.twinSuite, IMG.suiteDouble],
  },
];

export const locationByName = (name) => LOCATIONS.find((l) => l.name === name);

export const FAQ_CATEGORIES = ['Booking & payment', 'Your stay', 'Facilities', 'Our hotels'];

export const FAQS = [
  { cat: 'Booking & payment', q: 'How do I book a room?', a: 'Choose your dates and number of guests, pick one or more rooms and continue to the guest details page. You pay by card on a secure Stripe page and your booking is confirmed the moment the payment clears.' },
  { cat: 'Booking & payment', q: 'Can I cancel my booking?', a: 'Yes. You can cancel online from the My bookings page up to 48 hours before check-in. After that, please contact the hotel and we will do our best to help.' },
  { cat: 'Booking & payment', q: 'Are there any booking fees?', a: 'No. The price you see, per night and for the whole stay, is the price you pay when you book directly with us.' },
  { cat: 'Booking & payment', q: 'How long can I stay?', a: 'Online bookings are for up to 30 nights. For longer stays, send us an enquiry and we will put together a long-stay rate.' },
  { cat: 'Booking & payment', q: 'Which payment methods do you accept?', a: 'Visa and Mastercard credit and debit cards, processed securely by Stripe. We never see or store your card details.' },
  { cat: 'Booking & payment', q: 'Can I get an invoice for my company?', a: 'Of course. Use the contact form and choose “Invoice request”, with your booking reference and company details, and we will send one within a working day.' },
  { cat: 'Your stay', q: 'What time are check-in and check-out?', a: 'Check-in is from 14:00 and check-out is by 11:00 at all three hotels. If you need to arrive early or leave late, tell us in the special requests box and we will do what we can.' },
  { cat: 'Your stay', q: 'I will arrive late. Is that a problem?', a: 'Not at all. Our front desk is staffed around the clock. Add your expected arrival time to the special requests when you book.' },
  { cat: 'Your stay', q: 'Can children stay with us?', a: 'Children are very welcome. Family rooms and apartments sleep up to eight guests, and we can add a cot or extra bedding on request.' },
  { cat: 'Your stay', q: 'Do you allow pets?', a: 'Service animals are always welcome. For other pets, please contact the hotel before booking so we can tell you what is possible at that location.' },
  { cat: 'Your stay', q: 'Can I change the dates of my booking?', a: 'If your stay is more than 48 hours away you can cancel online and book again for the new dates. If it is closer than that, contact the hotel and we will help where we can.' },
  { cat: 'Facilities', q: 'Is Wi-Fi free?', a: 'Yes, fast Wi-Fi is free for all guests at every hotel, in rooms and in public areas.' },
  { cat: 'Facilities', q: 'Is breakfast included?', a: 'It depends on the room. Executive rooms include breakfast, and for other rooms it is shown in the room’s amenities. You can always add breakfast at the restaurant.' },
  { cat: 'Facilities', q: 'Do you have parking?', a: 'Yes, secure on-site parking is available at all three hotels for guests. Tell us if you are bringing a larger vehicle.' },
  { cat: 'Facilities', q: 'Do you have accessible rooms?', a: 'Yes. Our accessible rooms have step-free entry, a wide bathroom and a roll-in shower. Use the “Accessible” room type filter or contact us to find the best fit.' },
  { cat: 'Facilities', q: 'Can you arrange airport transfers?', a: 'Yes. Ask us when you book or contact the hotel at least a day before you arrive, and we will arrange a private transfer.' },
  { cat: 'Our hotels', q: 'Where are your hotels?', a: 'We have three hotels in South Africa: PrimeStay Sandton in Johannesburg, PrimeStay Sea Point in Cape Town and PrimeStay Umhlanga in Durban.' },
  { cat: 'Our hotels', q: 'Can I book rooms at more than one hotel?', a: 'You can put rooms from different hotels in one stay. If you are travelling between cities, it is simplest to make a separate booking for each hotel.' },
  { cat: 'Our hotels', q: 'Do you host events and group bookings?', a: 'Yes. For five or more rooms, weddings, meetings and celebrations, send us an enquiry and the hotel team will reply with options and group rates.' },
];

export const VENUES = [
  { name: 'Ember Rooftop Grill', location: 'Sandton', icon: 'utensils', image: IMG.heroDining, cuisine: 'Open-flame grill and wine', hours: 'Dinner daily, 18:00 to 22:30',
    text: 'South African grilling at its best, served on a rooftop with the Sandton skyline behind you. Slow-cooked cuts, fresh seafood and a wine list that favours the Cape winelands.' },
  { name: 'The Tide Kitchen', location: 'Sea Point', icon: 'waves', image: IMG.diningSeafood, cuisine: 'Seafood and sea views', hours: 'Breakfast, lunch and dinner daily',
    text: 'Light, bright cooking built around the day’s catch. Sit on the terrace, watch the ocean change colour and let the kitchen do the rest.' },
  { name: 'Lantern Terrace', location: 'Umhlanga', icon: 'sun', image: IMG.diningRoom, cuisine: 'Coastal bistro and cocktails', hours: 'Breakfast to late, daily',
    text: 'A relaxed poolside bistro with Durban spice in the details. Start with a long breakfast, finish with a cocktail as the sun goes down.' },
];

export const DINING_EXPERIENCES = [
  { icon: 'coffee', title: 'Afternoon tea', when: 'Every day, 14:00 to 17:00', image: IMG.diningDessert,
    text: 'A slow, elegant ritual: freshly baked scones, delicate pastries and finger sandwiches, served with a pot of loose-leaf tea or a glass of sparkling wine.' },
  { icon: 'utensils', title: 'Sunday brunch', when: 'Sundays, 12:00 to 15:30', image: IMG.diningSalad,
    text: 'A generous buffet of cured meats, cheeses, hot dishes and desserts, with live stations and plenty of reasons to stay for a second round.' },
  { icon: 'glass', title: 'Sundowners', when: 'Daily, from 16:00', image: IMG.diningPlate,
    text: 'Small plates made for sharing, paired with local wines and signature cocktails while the light turns gold.' },
];

export const DINING_EVENTS = [
  { date: 'Fri 4 Dec', title: 'Winelands Pairing Evening', place: 'Sandton', text: 'Five courses, each matched with a different Cape estate.' },
  { date: 'Sat 12 Dec', title: 'Catch of the Day Long Lunch', place: 'Sea Point', text: 'A relaxed, shared-table seafood lunch on the terrace.' },
  { date: 'Fri 18 Dec', title: 'Festive Poolside Braai', place: 'Umhlanga', text: 'Open-fire cooking, live music and a late sunset.' },
];

export const EXPERIENCES = [
  { icon: 'leaf', title: 'Spa & wellness', place: 'All hotels', text: 'Massages, facials and quiet time in a treatment room. Ask the front desk to book your slot.' },
  { icon: 'compass', title: 'Game reserve day trip', place: 'Sandton', text: 'Spend a day at Pilanesberg, a few hours from Johannesburg, with a guide and a packed lunch.' },
  { icon: 'heart', title: 'Soweto heritage tour', place: 'Sandton', text: 'A guided half-day through Soweto’s history, music and food, with a local host.' },
  { icon: 'glass', title: 'Winelands tasting', place: 'Sea Point', text: 'Visit two or three Cape estates for tastings and lunch with views of the vineyards.' },
  { icon: 'mountain', title: 'Table Mountain & Cape Point', place: 'Sea Point', text: 'Cable car, coastline and penguins. We will plan the day around the weather.' },
  { icon: 'waves', title: 'Ocean and dolphin cruise', place: 'Umhlanga', text: 'A morning on the water along the KwaZulu-Natal coast, with snorkel gear for the brave.' },
  { icon: 'bag', title: 'Shopping & markets', place: 'All hotels', text: 'Local crafts, food markets and the best malls. Our team will share their favourites.' },
  { icon: 'car', title: 'Private transfers', place: 'All hotels', text: 'Airport pick-ups and drop-offs, or a driver for the day. Just ask us when you book.' },
];

export const BENEFITS = [
  { icon: 'shield', title: 'Free cancellation', text: 'Change of plans? Cancel online up to 48 hours before check-in.' },
  { icon: 'tag', title: 'No booking fees', text: 'The price you see is the price you pay, with no hidden extras.' },
  { icon: 'clock', title: 'Instant confirmation', text: 'Your room is held and confirmed the moment your payment clears.' },
  { icon: 'star', title: 'Best direct rate', text: 'Book on this website and you always get our best available rate.' },
];

export const OFFERS = [
  { icon: 'calendar', title: 'Long stays', tag: 'Stays of 7+ nights', image: IMG.suiteKitchen, topic: 'Long-stay rate',
    text: 'Moving for work or taking a longer break? Our studios come with a full kitchenette and laundry. Ask for a long-stay rate tailored to your dates.' },
  { icon: 'users', title: 'Family holidays', tag: 'Family rooms & apartments', image: IMG.suiteTriple, topic: 'Family holiday',
    text: 'Space for everyone, from connecting suites to four-bedroom apartments. Tell us how many of you are travelling and we will plan the best layout.' },
  { icon: 'cake', title: 'Celebrations', tag: 'Birthdays, honeymoons, anniversaries', image: IMG.bedroomChandelier, topic: 'Celebration package',
    text: 'Flowers, sparkling wine and a late check-out can make a special occasion feel even more special. Let us know what you are celebrating.' },
  { icon: 'briefcase', title: 'Groups & meetings', tag: '5 or more rooms', image: IMG.suiteDesk, topic: 'Group booking',
    text: 'Team trips, weddings and meetings. Group rates, meeting space and catering, arranged with one point of contact.' },
];

export const SPA_PHOTOS = [IMG.spaMassage, IMG.spaRoom, IMG.spaSuite, IMG.spaPool];
