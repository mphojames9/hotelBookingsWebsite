import React from 'react';
import './Navbar.css';
import { NavLink } from 'react-router-dom';
import Brand from '../Brand/Brand';
import { LogoutIcon, UserIcon } from '../Icons';

const Navbar = ({logout}) => {
  return (
    <header className='navbar'>
      <NavLink to='/dashboard' className='navbar-brand' aria-label='PrimeStay admin, go to dashboard'>
        <Brand />
      </NavLink>

      <div className="navbar-right">
        <div className="navbar-user">
          <span className="avatar" aria-hidden="true"><UserIcon size={18} /></span>
          <span className="navbar-role">Admin</span>
        </div>
        <button className="logout-btn" onClick={logout} aria-label="Log out">
          <LogoutIcon size={18} />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
