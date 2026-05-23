import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#00FF41', '#FF2A2A'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const currentStreak = user?.streak || 0;
  const maxXP = currentLevel * 100;
  const xpPercentage = Math.min((currentXP / maxXP) * 100, 100);

  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch('http://localhost:5000/api/tasks/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchSystemHealth = async () => {
    setLoading(true);
    const startTime = performance.now();
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const data = await response.json();
      const endTime = performance.now();
      
      setHealthData(data);
      setLatency(Math.round(endTime - startTime));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to establish connection to backend service.');
      setHealthData(null);
      setLatency(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    fetchStats();
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  // Mock data for upcoming modules to demonstrate the visual vision
  const modules = [
    {
      name: 'Authentication System',
      phase: 'Phase 2',
      status: 'LOCKED',
      description: 'JWT authorization, secure hashing, and role-based route guards.',
      color: 'from-amber-500/20 to-amber-900/10 border-amber-500/20 text-amber-400',
    },
    {
      name: 'Task & Habit Manager',
      phase: 'Phase 3',
      status: 'LOCKED',
      description: 'Deadline tracking, daily habit lists, and priority matrices.',
      color: 'from-purple-500/20 to-purple-900/10 border-purple-500/20 text-purple-400',
    },
    {
      name: 'Gamification Engine',
      phase: 'Phase 4',
      status: 'LOCKED',
      description: 'XP gains, leveling, streak multipliers, and leaderboard ranks.',
      color: 'from-rose-500/20 to-rose-900/10 border-rose-500/20 text-rose-400',
    },
    {
      name: 'AI Study Assistant',
      phase: 'Phase 5',
      status: 'LOCKED',
      description: 'Gemini AI integration for personalized schedules and feedback.',
      color: 'from-indigo-500/20 to-indigo-900/10 border-indigo-500/20 text-indigo-400',
    },
  ];

  const chartData = [
    { name: 'Completed', value: stats.completedTasks },
    { name: 'Pending', value: stats.pendingTasks },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sleek top grid pattern decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Decorative top ambient glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[250px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[250px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Navigation / Header bar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-800 pb-6 mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <p className="text-xs uppercase tracking-[0.25em] font-mono text-cyan-400 font-bold">AI Student OS v1.0.0</p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-400">
              Control Center
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <Link 
                to="/tasks" 
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] sm:text-xs font-bold hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all group"
              >
                <span>[LAUNCH TASK MATRIX]</span>
              </Link>
              <Link 
                to="/ai-planner" 
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] sm:text-xs font-bold hover:bg-indigo-500/20 hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all group"
              >
                <span>[NEURAL PLANNER]</span>
              </Link>
            </div>

            <div className="flex items-center gap-4 bg-neutral-900/60 backdrop-blur-md px-4 py-2 rounded-lg border border-neutral-800/80">
              <span className="text-xs font-mono text-neutral-400">DB CLUSTER</span>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${healthData ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'} absolute`} />
              <span className={`h-2.5 w-2.5 rounded-full ${healthData ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
              <span className="text-xs font-mono font-bold text-neutral-200">
                {loading ? 'RESOLVING...' : (healthData ? 'EMBEDDED_LOCAL' : 'OFFLINE')}
              </span>
            </div>
          </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT & CENTER PANELS - CORE SYSTEMS AND DIAGNOSTICS */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* USER METRICS / TELEMETRY */}
            <div className="bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/10 p-6">
              <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-neutral-400 mb-6 border-b border-neutral-800 pb-2">
                &gt; USER_TELEMETRY
              </h2>
              
              {loadingStats ? (
                <div className="py-8 flex items-center justify-center">
                  <span className="text-xs font-mono text-cyan-500 animate-pulse tracking-[0.3em]">[ RETRIEVING TELEMETRY... ]</span>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                  {/* Left: Stat Cards */}
                  <div className="flex flex-col gap-4 flex-1">
                    {/* Total Tasks */}
                    <div className="bg-[#111] border border-neutral-800 p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                      <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-2">TOTAL DIRECTIVES</p>
                      <p className="text-4xl font-extrabold font-mono text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                        {stats.totalTasks}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Pending Tasks */}
                      <div className="bg-[#111] border border-neutral-800 p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-red-500/50 transition-colors">
                        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-2">PENDING</p>
                        <p className="text-3xl font-extrabold font-mono text-red-400 drop-shadow-[0_0_12px_rgba(255,42,42,0.4)]">
                          {stats.pendingTasks}
                        </p>
                      </div>
                      {/* Completed Tasks */}
                      <div className="bg-[#111] border border-neutral-800 p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#00FF41]/50 transition-colors">
                        <div className="absolute inset-0 bg-[#00FF41]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-2">COMPLETE</p>
                        <p className="text-3xl font-extrabold font-mono text-[#00FF41] drop-shadow-[0_0_12px_rgba(0,255,65,0.4)]">
                          {stats.completedTasks}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Donut Chart */}
                  <div className="bg-[#111] border border-neutral-800 flex flex-col items-center justify-center p-4 w-full lg:w-auto lg:min-w-[220px]">
                    <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 mb-2">COMPLETION_RATIO</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          innerRadius={55}
                          outerRadius={78}
                          stroke="none"
                          paddingAngle={chartData[0].value > 0 && chartData[1].value > 0 ? 3 : 0}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontFamily: 'monospace', fontSize: '11px' }}
                          itemStyle={{ color: '#ccc' }}
                          cursor={false}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="flex gap-4 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00FF41]" />
                        <span className="text-[10px] font-mono text-neutral-400">DONE</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF2A2A]" />
                        <span className="text-[10px] font-mono text-neutral-400">PENDING</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Window / Health Check Diagnostics */}
            <div className="bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/10">
              
              {/* Terminal Title Bar */}
              <div className="flex justify-between items-center bg-neutral-900/60 px-5 py-3.5 border-b border-neutral-800/60">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/70" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-xs font-mono text-neutral-400 ml-2">sys_diagnostics.sh</span>
                </div>

                <button 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-cyan-400 disabled:opacity-50 transition-colors duration-200 group cursor-pointer"
                >
                  <svg 
                    className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : 'group-hover:rotate-180 transition-transform duration-500'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                  </svg>
                  [REFRESH]
                </button>
              </div>

              {/* Terminal Content */}
              <div className="p-6 space-y-6">
                
                {/* Main Dynamic Status Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Status Indicator Block */}
                  <div className={`p-5 rounded-lg border transition-all duration-300 ${
                    loading 
                      ? 'bg-neutral-900/30 border-neutral-800/50' 
                      : error 
                      ? 'bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-950/5' 
                      : 'bg-cyan-500/5 border-cyan-500/20 shadow-lg shadow-cyan-950/5'
                  }`}>
                    <p className="text-xs uppercase font-mono text-neutral-400 tracking-wider mb-2">Network Connection</p>
                    {loading ? (
                      <div className="flex items-center gap-2.5 py-1">
                        <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-lg font-mono font-bold text-neutral-300">PINGING HOST...</span>
                      </div>
                    ) : error ? (
                      <div className="py-1">
                        <div className="text-xl font-extrabold text-rose-500 font-mono tracking-tight">SYSTEM OFFLINE</div>
                        <p className="text-xs text-rose-400/80 font-mono mt-1">CORS_OR_CONNECTION_ERR</p>
                      </div>
                    ) : (
                      <div className="py-1">
                        <div className="text-xl font-extrabold text-cyan-400 font-mono tracking-tight">SYSTEM ONLINE</div>
                        <p className="text-xs text-cyan-400/80 font-mono mt-1">HOST_RESOLVED_OK</p>
                      </div>
                    )}
                  </div>

                  {/* Metadata Dashboard Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-900/40 p-4 rounded-lg border border-neutral-800/60">
                      <p className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider mb-1">LATENCY</p>
                      <p className="text-lg font-mono font-bold text-neutral-200">
                        {loading ? '---' : latency !== null ? `${latency} ms` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-neutral-900/40 p-4 rounded-lg border border-neutral-800/60">
                      <p className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider mb-1">PORT</p>
                      <p className="text-lg font-mono font-bold text-neutral-200">5000</p>
                    </div>
                  </div>

                </div>

                {/* Console Log Printout */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-500 px-1">
                    <span>E2E INTER ACTION STATUS</span>
                    <span>HTTPS / REST</span>
                  </div>
                  
                  <div className="bg-[#0b0d13] border border-neutral-800/80 rounded-lg p-5 font-mono text-sm leading-relaxed overflow-x-auto min-h-[140px] whitespace-pre-wrap break-words">
                    {loading ? (
                      <div className="text-neutral-500 space-y-1.5 animate-pulse">
                        <p className="text-cyan-500/80 font-bold">$ GET http://localhost:5000/api/health</p>
                        <p>Connecting to api socket...</p>
                        <p>Buffering raw bytes...</p>
                      </div>
                    ) : error ? (
                      <div className="space-y-2 text-rose-400">
                        <p className="text-rose-500 font-bold">$ GET http://localhost:5000/api/health</p>
                        <p className="font-semibold text-rose-500">[ERROR_REPORT]</p>
                        <p className="text-neutral-400 bg-neutral-950 p-3 border border-rose-500/20 rounded font-mono text-xs text-rose-300">
                          {error}
                        </p>
                        <p className="text-xs text-neutral-500 mt-2">💡 Quick tip: Ensure the backend server is running (`npm run dev` inside backend directory) and MongoDB can connect.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs text-cyan-400/70 border-b border-neutral-800/40 pb-2">
                          <span className="font-bold">$ GET http://localhost:5000/api/health</span>
                          <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold text-[10px]">200 OK</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs py-1">
                          <div className="flex justify-between border-b border-neutral-800/20 py-1">
                            <span className="text-neutral-400">Response Status:</span>
                            <span className="text-emerald-400 font-bold uppercase">{healthData.status}</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-800/20 py-1">
                            <span className="text-neutral-400">Database Context:</span>
                            <span className="text-cyan-400 font-bold">{healthData.database}</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-800/20 py-1 md:col-span-2">
                            <span className="text-neutral-400">Server Timestamp:</span>
                            <span className="text-neutral-200 font-mono">{healthData.timestamp}</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-800/20 py-1">
                            <span className="text-neutral-400">Node Environment:</span>
                            <span className="text-neutral-300">{healthData.env}</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-800/20 py-1">
                            <span className="text-neutral-400">Latency Duration:</span>
                            <span className="text-neutral-200 font-bold">{latency} ms</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Diagnostic Tip Panel */}
            <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-xl p-5 flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-200 mb-1">E2E Integration Status Verified</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  This interface proves the frontend client is fully integrated with the Node.js backend. All headers, CORS permissions, and data structures are functioning within baseline margins.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL - MODULE ROADMAP */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* GAMIFICATION MATRIX / OPERATOR STATUS */}
            <div className="bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/10 p-6">
              <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-neutral-400 mb-5 border-b border-neutral-800 pb-2">
                &gt; OPERATOR_STATUS
              </h2>
              
              <div className="space-y-6">
                {/* Level and Streak Header */}
                <div className="flex justify-between items-center">
                  <div className="bg-cyan-500/10 border border-cyan-500/50 px-3 py-1 text-cyan-400 font-mono text-xs font-bold tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                    LEVEL [{currentLevel}]
                  </div>
                  
                  <div className={`flex items-center gap-1.5 font-mono text-xs font-bold ${currentStreak > 0 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'text-neutral-500'}`}>
                    {currentStreak > 0 && (
                      <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                    )}
                    [{currentStreak}] DAY STREAK
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400 tracking-wider">
                    <span>EXPERIENCE_POINTS</span>
                    <span className="text-cyan-400">{currentXP} / {maxXP}</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-900 border border-neutral-800 overflow-hidden relative">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,211,238,0.8)] relative"
                      style={{ width: `${xpPercentage}%` }}
                    >
                      {/* Inner glow/pulse effect on the progress bar */}
                      <div className="absolute inset-0 bg-white/20 w-full animate-[pulse_2s_ease-in-out_infinite]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-950/40 p-1 border border-neutral-800/60 rounded-xl">
              <div className="px-5 py-4 border-b border-neutral-800/40">
                <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-neutral-400">SYSTEM ARCHITECTURE ROADMAP</h3>
                <p className="text-xs text-neutral-500 mt-1">Overview of components scheduled for integration</p>
              </div>
              
              <div className="p-4 space-y-4">
                {modules.map((mod, idx) => (
                  <div 
                    key={idx}
                    className={`relative overflow-hidden bg-neutral-900/30 border rounded-lg p-4 transition-all duration-300 ${mod.color}`}
                  >
                    {/* Locked Watermark Grid lines */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1f293708_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-mono font-bold opacity-60">
                          {mod.phase}
                        </span>
                        <h4 className="text-sm font-bold text-neutral-200 tracking-tight mt-0.5">{mod.name}</h4>
                      </div>
                      
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-current bg-neutral-950/60 text-[9px] font-mono font-bold tracking-wider relative">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        {mod.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400/80 leading-normal relative z-10">{mod.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
