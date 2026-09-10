import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { FocusProvider } from './context/FocusContext';
import FocusLauncherModal from './components/focus/FocusLauncherModal';
import FocusActiveOverlay from './components/focus/FocusActiveOverlay';
import FocusSummaryModal from './components/focus/FocusSummaryModal';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import AIPlanner from './pages/AIPlanner';
import GlobalShell from './components/GlobalShell';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <BrowserRouter>
      <Toaster toastOptions={{ style: { background: '#0D141B', color: '#F2F5F7', border: '1px solid rgba(255,255,255,0.14)', fontFamily: 'JetBrains Mono, monospace' } }} />
      <AuthProvider>
        <TaskProvider>
          <FocusProvider>
            <FocusLauncherModal />
            <FocusActiveOverlay />
            <FocusSummaryModal />
            <Routes>
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <GlobalShell>
                      <Dashboard />
                    </GlobalShell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <GlobalShell>
                      <Tasks />
                    </GlobalShell>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-planner" 
                element={
                  <ProtectedRoute>
                    <GlobalShell>
                      <AIPlanner />
                    </GlobalShell>
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<Login />} />
            </Routes>
          </FocusProvider>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
