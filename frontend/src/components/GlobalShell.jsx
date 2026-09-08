import React from 'react';
import Navbar from './Navbar';

const GlobalShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col selection:bg-cyan/30 selection:text-cyan">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default GlobalShell;
