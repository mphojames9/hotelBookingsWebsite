import React from 'react';
import './Sidebar.css';
import { NavLink, useLocation } from 'react-router-dom';
import { DashboardIcon, PlusIcon, BedIcon, CalendarIcon, StarIcon, MailIcon } from '../Icons';

const items = [
  { to:'/dashboard', label:'Dashboard', Icon:DashboardIcon },
  { to:'/add',      label:'Add room', Icon:PlusIcon },
  { to:'/rooms',    label:'Rooms',    Icon:BedIcon, also:['/edit'] },
  { to:'/bookings', label:'Bookings', Icon:CalendarIcon },
  { to:'/reviews',  label:'Reviews',  Icon:StarIcon },
  { to:'/messages', label:'Messages', Icon:MailIcon },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const activeIndex = Math.max(0, items.findIndex((item)=>[item.to,...(item.also||[])].some((path)=>pathname.startsWith(path))));

  return (
    <nav className='sidebar' aria-label='Main' style={{'--idx': activeIndex, '--count': items.length}}>
      {/* one pill that slides to the active item (left sidebar on desktop, bottom dock on mobile) */}
      <span className='sidebar-indicator' aria-hidden='true' />
      {items.map(({ to, label, Icon })=>(
        <NavLink key={to} to={to} className='sidebar-option'>
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default Sidebar;
