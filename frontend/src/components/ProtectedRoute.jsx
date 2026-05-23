import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] gap-4">
        {/* Animated scan line */}
        <div className="relative w-48 h-px bg-neutral-800">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
        </div>
        {/* Spinner + label */}
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-cyan-400 font-mono text-sm tracking-[0.3em] uppercase">
            VERIFYING CLEARANCE...
          </span>
        </div>
        {/* Bottom scan line */}
        <div className="relative w-48 h-px bg-neutral-800">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
