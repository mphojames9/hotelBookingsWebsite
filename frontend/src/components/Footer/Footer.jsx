import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { assets, menu_list } from '../../assets/assets';
import { categoryLabel } from '../../utils/format';
import { ArrowRightIcon, ArrowUpIcon, MailIcon, PhoneIcon, SearchIcon } from '../Icons';
import { openSpotlight } from '../Spotlight/Spotlight';

const Footer = () => {
  return (
    <footer className='footer' id='footer'>
        <div className="footer-inner">

            <div className="footer-cta">
                <div>
                    <h2>Not sure what you need?</h2>
                    <p>Describe it in plain English, like “laptop under R5000”, and we’ll find it.</p>
                </div>
                <button type="button" className="footer-search" onClick={() => openSpotlight()}>
                    <SearchIcon />
                    Search products
                    <ArrowRightIcon />
                </button>
            </div>

            <div className="footer-cols">
                <div className="footer-brand">
                    <span className="footer-logo"><img src={assets.logo} alt='One Stop' /></span>
                    <p>Phones, laptops, TVs, monitors and gaming gear in one place.</p>
                </div>

                <nav aria-label="Shop">
                    <h3>Shop</h3>
                    <ul>
                        <li><Link to='/shopping-cart'>Home</Link></li>
                        <li><Link to='/shopping-cart/wishlist'>Wishlist</Link></li>
                        <li><Link to='/shopping-cart/cart'>Cart</Link></li>
                        <li><Link to='/shopping-cart/myorders'>My orders</Link></li>
                    </ul>
                </nav>

                <nav aria-label="Categories" className="footer-cats">
                    <h3>Categories</h3>
                    <ul>
                        {menu_list.map((item) => (
                            <li key={item.menu_name}>
                                <Link to='/shopping-cart' state={{ category: item.menu_name, scrollTo: 'explore-menu' }}>{categoryLabel(item.menu_name)}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div>
                    <h3>Contact us</h3>
                    <ul>
                        <li><a href='tel:+27112331245'><PhoneIcon />+27 11 233 1245</a></li>
                        <li><a href='mailto:demo@onestop.com'><MailIcon />demo@onestop.com</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bar">
                <p>&copy; {new Date().getFullYear()} One Stop. All rights reserved.</p>
                <button type="button" className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Back to top <ArrowUpIcon />
                </button>
            </div>
        </div>
    </footer>
  );
}

export default Footer;
