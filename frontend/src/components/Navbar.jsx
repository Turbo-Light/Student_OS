import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const currentPath = location.pathname;

  const navItems = [
    { label: 'Dashboard', path: '/', zone: 'cyan' },
    { label: 'Tasks', path: '/tasks', zone: 'cyan' },
    { label: 'AI Planner', path: '/ai-planner', zone: 'violet' },
  ];

  const currentLevel = user?.level || 1;

  return (
    <header className="w-full h-16 bg-base sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6 sm:gap-10">
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded-sm">
            <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_8px_#22D3EE] animate-pulse" />
            <span className="font-display font-bold tracking-wider text-sm sm:text-base text-text-primary group-hover:text-cyan transition-colors">
              AI STUDENT OS
            </span>
          </Link>

          {/* Inline Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-6">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              
              let activeColorClass = 'text-text-secondary font-medium hover:text-text-primary';
              if (isActive) {
                if (item.zone === 'violet') {
                  activeColorClass = 'text-violet font-semibold';
                } else {
                  activeColorClass = 'text-cyan font-semibold';
                }
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-xs sm:text-sm px-2.5 py-1 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong ${activeColorClass}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: System Status & User Level Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Status Dot */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono text-text-secondary" title="System Status: Online">
            <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_#34D399]" />
            <span className="hidden md:inline uppercase text-[10px] tracking-wider text-text-tertiary">SYSTEM</span>
          </div>

          {/* Level Pill (Amber accent - gamification only) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(251,191,36,0.12)] border border-amber/30 text-amber font-display font-semibold text-xs tracking-tight shadow-[0_0_10px_rgba(251,191,36,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_4px_#FBBF24]" />
            <span>Lvl {currentLevel}</span>
          </div>

          {/* Logout Action (if logged in) */}
          {user && (
            <button
              onClick={logout}
              title="Terminate Session"
              className="text-text-tertiary hover:text-danger p-1.5 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-danger"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
