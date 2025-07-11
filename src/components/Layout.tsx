import React from 'react';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <div className="min-h-screen bg-gray-50">{children}</div>
  </>
);

export default Layout;
