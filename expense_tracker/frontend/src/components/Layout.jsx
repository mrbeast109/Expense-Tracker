import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import bgImage from '../assets/dashboard-bg.jpg';

const Layout = ({ onLogout, user }) => {
  const location = useLocation();

  return (
    <div
      className="flex flex-col lg:flex-row h-screen w-full overflow-hidden relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src={bgImage}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <Navbar onLogout={onLogout} user={user} />
      <main className="flex-1 overflow-y-auto relative z-10 w-full min-w-0 flex flex-col pb-10 sm:pb-6">
        <div key={location.pathname} className="animate-fade-in w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
