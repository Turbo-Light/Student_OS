import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FocusContext } from '../context/FocusContext';
import { LogOut, Target } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { openFocusLauncher, activeSession, remainingSeconds, setIsOverlayOpen } = useContext(FocusContext) || {};
  const currentPath = location.pathname;

  const navItems = [
    { label: 'Dashboard', path: '/', zone: 'cyan' },
    { label: 'Tasks', path: '/tasks', zone: 'cyan' },
    { label: 'AI Planner', path: '/ai-planner', zone: 'violet' },
  ];

  const currentLevel = user?.level || 1;

  return (
    <header className="w-full h-16 bg-base/90 backdrop-blur-md border-b border-border-subtle sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: Brand Identity & Navigation */}
        <div className="flex items-center gap-8 sm:gap-10">
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded-md">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan shrink-0" />
            <span className="font-sans font-bold tracking-tight text-base text-text-primary whitespace-nowrap">
              AI Student OS
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              
              let activeClasses = 'text-text-secondary hover:text-text-primary hover:bg-surface-raised font-sans font-medium';
              if (isActive) {
                if (item.zone === 'violet') {
                  activeClasses = 'text-violet bg-violet/10 font-sans font-semibold';
                } else {
                  activeClasses = 'text-cyan bg-cyan/10 font-sans font-semibold';
                }
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm px-3 py-1.5 rounded-md transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong ${activeClasses}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: System Status & User Level Pill */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Persistent Focus Mode Trigger / Active Indicator */}
          {activeSession ? (
            <button
              onClick={() => setIsOverlayOpen && setIsOverlayOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium bg-cyan/15 text-cyan border border-cyan/40 hover:bg-cyan/25 transition-all cursor-pointer shadow-sm animate-pulse"
              title="Active Focus Session - Click to expand"
              id="nav-focus-active-btn"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
              <span className="font-mono font-bold tracking-tight">
                {Math.floor((remainingSeconds || 0) / 60)}:{String((remainingSeconds || 0) % 60).padStart(2, '0')}
              </span>
              <span className="hidden sm:inline">Focus</span>
            </button>
          ) : (
            <button
              onClick={() => openFocusLauncher && openFocusLauncher()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium text-cyan bg-cyan-dim border border-cyan/30 hover:bg-cyan/20 hover:border-cyan/50 transition-all cursor-pointer shadow-sm"
              title="Launch Focus Session"
              id="nav-focus-btn"
            >
              <Target className="w-3.5 h-3.5 text-cyan" />
              <span className="hidden xs:inline">Focus Mode</span>
            </button>
          )}

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-sans text-text-secondary" title="Status: Online">
            <span className="h-2 w-2 rounded-full bg-success shrink-0" />
            <span className="hidden md:inline text-xs text-text-tertiary font-medium">Online</span>
          </div>

          {/* Level Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-dim border border-amber/30 text-amber font-sans font-semibold text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            <span>Level {currentLevel}</span>
          </div>

          {/* Logout Action */}
          {user && (
            <button
              onClick={logout}
              title="Sign Out"
              className="text-text-tertiary hover:text-danger hover:bg-surface-raised p-1.5 rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-danger cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
