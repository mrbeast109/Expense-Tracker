import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import bgImage from '../assets/dashboard-bg.jpg';

const Layout = ({ onLogout, user }) => {
  return (
    <div
      className="flex h-screen w-screen overflow-hidden relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <img
        src={bgImage}
        alt=""
        className="fixed inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />
      <div className="fixed inset-0 bg-black/10 pointer-events-none z-0" />
      <Navbar onLogout={onLogout} user={user} />
      <div className="flex-1 overflow-y-auto relative z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
