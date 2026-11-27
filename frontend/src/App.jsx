import React, { useEffect, useState } from 'react';
import NavBar from './components/NavBar/NavBar';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PlaceOder from './pages/PlaceOrder/PlaceOder';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import Verify from './pages/Verify/Verify';
import MyOrders from './pages/MyOrders/MyOrders';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import Toast from './components/Toast/Toast';
import Spotlight from './components/Spotlight/Spotlight';
import ProductSheet from './components/ProductSheet/ProductSheet';
import Lightbox from './components/Lightbox/Lightbox';
import Locations from './pages/Site/Locations';
import LocationDetail from './pages/Site/LocationDetail';
import Dining from './pages/Site/Dining';
import Experiences from './pages/Site/Experiences';
import Offers from './pages/Site/Offers';
import About from './pages/Site/About';
import FaqPage from './pages/Site/FaqPage';
import Contact from './pages/Site/Contact';

const App = () => {

  const [showLogin,setShowLogin] = useState(false)
  const { pathname, state } = useLocation()

  // new page -> start at the top (unless a link asked to scroll to a section)
  // other components (e.g. the room sheet's review form) ask for the sign-in popup with this event
  useEffect(()=>{
    const open = () => setShowLogin(true);
    window.addEventListener('login:open',open);
    return ()=>window.removeEventListener('login:open',open);
  },[])

  useEffect(()=>{
    if (!state?.scrollTo) window.scrollTo({top:0,left:0,behavior:'instant'});
  },[pathname])

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin}/> : null}
      <NavBar setShowLogin={setShowLogin} />
      <main className={['/cart','/placeOder','/verify','/myorders'].includes(pathname)?'app':'app app-wide'}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart setShowLogin={setShowLogin} />} />
          <Route path='/placeOder' element={<PlaceOder />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myorders' element={<MyOrders setShowLogin={setShowLogin} />} />
          <Route path='/locations' element={<Locations />} />
          <Route path='/locations/:slug' element={<LocationDetail />} />
          <Route path='/dining' element={<Dining />} />
          <Route path='/experiences' element={<Experiences />} />
          <Route path='/offers' element={<Offers />} />
          <Route path='/about' element={<About />} />
          <Route path='/faq' element={<FaqPage />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
      <ProductSheet />
      <Lightbox />
      <Spotlight />
    </>
  );
}

export default App;
