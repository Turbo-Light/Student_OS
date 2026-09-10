import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TaskContext } from '../context/TaskContext';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Circle, 
  Clock, 
  Flame, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  TrendingUp, 
  Target, 
  Activity, 
  Zap 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CustomFocusTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface/95 backdrop-blur-md border border-border-subtle rounded-lg p-3 shadow-xl text-xs font-sans">
        <p className="font-semibold text-text-primary mb-1">{data.day} ({data.date})</p>
        <div className="space-y-1">
          <p className="text-cyan font-mono font-bold">Focus Score: {data.score}%</p>
          <p className="text-text-secondary">Sessions: {data.sessions}</p>
          <p className="text-text-tertiary">Total Focus: {data.focusMinutes} min</p>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { tasks, fetchTasks, updateTask } = useContext(TaskContext);

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const currentStreak = user?.streak || 0;
  const maxXP = currentLevel * 100;
  const xpPercentage = Math.min((currentXP / maxXP) * 100, 100);

  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Historical Focus Session Analytics State
  const [focusStats, setFocusStats] = useState({ history: [], dailyAverages: [] });
  const [loadingFocusStats, setLoadingFocusStats] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch(`${API_URL}/api/tasks/stats`, {
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

  const fetchFocusStats = async () => {
    setLoadingFocusStats(true);
    try {
      const response = await fetch(`${API_URL}/api/focus/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFocusStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch focus stats:', err);
    } finally {
      setLoadingFocusStats(false);
    }
  };

  // Dynamic Real-time Temporal State (Live Clock & Calendar)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeekOfYear = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const dayOfWeek = currentTime.toLocaleDateString(undefined, { weekday: 'long' });
  const fullDate = currentTime.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  const liveTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const weekNumber = getWeekOfYear(currentTime);

  useEffect(() => {
    fetchStats();
    fetchFocusStats();
    if (fetchTasks) {
      fetchTasks();
    }
  }, []);

  // Compute Mon-Sun weekly historical data
  const weeklyFocusData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = (currentDayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    return days.map((dayLabel, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);
      const dateStr = dayDate.toISOString().split('T')[0];

      const match = (focusStats.dailyAverages || []).find(d => d.date === dateStr);
      return {
        day: dayLabel,
        date: dateStr,
        score: match ? match.averageScore : 0,
        sessions: match ? match.sessionsCount : 0,
        focusMinutes: match ? Math.round(match.totalFocusTime / 60) : 0,
        hasData: Boolean(match)
      };
    });
  }, [focusStats]);

  const scoredDays = weeklyFocusData.filter(d => d.hasData);
  const avgFocusScore = scoredDays.length > 0
    ? Math.round(scoredDays.reduce((acc, curr) => acc + curr.score, 0) / scoredDays.length)
    : 0;
  const totalWeeklyFocusMinutes = (focusStats.history || []).reduce((acc, curr) => acc + Math.round((curr.actualFocusedTime || 0) / 60), 0);
  const totalCompletedSessions = (focusStats.history || []).length;

  // Filter nearest pending tasks for "Up Next"
  const pendingTasks = (tasks || [])
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    })
    .slice(0, 3);

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const ringData = [
    { name: 'Completed', value: stats.completedTasks },
    { name: 'Pending', value: Math.max(stats.pendingTasks, stats.totalTasks === 0 ? 1 : 0) },
  ];

  const ringColors = stats.totalTasks === 0 
    ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.06)']
    : ['#34D399', 'rgba(255,255,255,0.08)'];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded-sm font-sans text-xs font-semibold bg-danger/15 text-danger border border-danger/30">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded-sm font-sans text-xs font-semibold bg-warning/15 text-warning border border-warning/30">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="px-2 py-0.5 rounded-sm font-sans text-xs font-medium text-text-tertiary border border-border-subtle bg-transparent">
            Low
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-base text-text-primary font-sans selection:bg-cyan/30 selection:text-cyan py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[250px] bg-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border-subtle pb-5 gap-4">
          <div>
            <p className="text-xs font-sans text-cyan font-medium uppercase tracking-wider mb-1">
              Overview
            </p>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-text-primary">
              System Dashboard
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Dynamic Real-time Temporal Metadata Badge */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 bg-surface border border-border-subtle rounded-lg px-3.5 py-2 text-xs font-sans shadow-sm">
              {/* Day & Full Date */}
              <div className="flex items-center gap-2 text-text-primary">
                <Calendar className="w-3.5 h-3.5 text-cyan shrink-0" />
                <span className="font-semibold text-text-primary">{dayOfWeek}</span>
                <span className="text-text-tertiary">•</span>
                <span className="text-text-secondary">{fullDate}</span>
              </div>

              {/* Divider */}
              <div className="h-3.5 w-px bg-border-subtle shrink-0 hidden xs:block" />

              {/* Week Number */}
              <div className="px-2 py-0.5 rounded bg-surface-raised text-text-secondary font-medium text-[11px] border border-border-subtle/60 shrink-0">
                Week {weekNumber}
              </div>

              {/* Divider */}
              <div className="h-3.5 w-px bg-border-subtle shrink-0" />

              {/* Live Clock Readout */}
              <div className="flex items-center gap-1.5 font-mono text-cyan font-semibold tracking-wider shrink-0">
                <Clock className="w-3.5 h-3.5 text-cyan shrink-0" />
                <span className="tabular-nums" id="live-clock">{liveTime}</span>
              </div>
            </div>

            {/* Primary Action Button: Standard SaaS button style */}
            <Link
              to="/tasks?new=true"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cyan text-text-on-accent font-sans font-medium text-sm hover:brightness-110 transition-all cursor-pointer shadow-sm shrink-0"
            >
              <span>+ New Task</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Merged Progress Card */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-surface border border-border-subtle rounded-lg p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan" />
                    <h2 className="text-sm font-sans font-semibold text-text-primary">
                      Task Overview
                    </h2>
                  </div>
                  <span className="text-xs font-sans text-text-tertiary">
                    {loadingStats ? 'Syncing...' : 'Real-time task tracking'}
                  </span>
                </div>

                {/* Merged Visualization: Progress Ring + Stat Readouts */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  
                  {/* Left side: Progress Ring Donut */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center relative py-2 min-w-0">
                    <div className="w-[160px] h-[160px] min-h-[160px] min-w-0 relative flex items-center justify-center">
                      <ResponsiveContainer 
                        width="100%" 
                        height="100%" 
                        minWidth={0} 
                        minHeight={160}
                        initialDimension={{ width: 160, height: 160 }}
                      >
                        <PieChart data={ringData || []}>
                          <Pie
                            data={ringData || []}
                            dataKey="value"
                            innerRadius={58}
                            outerRadius={74}
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                            isAnimationActive={false}
                          >
                            {(ringData || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={ringColors[index]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Ring Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-sans font-bold text-text-primary tracking-tight">
                          {completionRate}%
                        </span>
                        <span className="text-xs font-sans text-text-secondary">
                          Complete
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Labeled Plain Figures */}
                  <div className="sm:col-span-7 flex flex-col justify-center space-y-4 sm:pl-4 sm:border-l sm:border-border-subtle">
                    {/* Total Tasks */}
                    <div className="flex items-baseline justify-between bg-surface-inset border border-border-subtle/60 rounded-md px-4 py-3">
                      <div>
                        <p className="text-xs font-sans font-medium text-text-secondary">Total Tasks</p>
                        <p className="text-xs text-text-tertiary font-sans mt-0.5">All active tasks in your workspace</p>
                      </div>
                      <span className="text-2xl font-mono font-bold text-cyan tracking-tight">
                        {stats.totalTasks}
                      </span>
                    </div>

                    {/* Completed */}
                    <div className="flex items-baseline justify-between bg-surface-inset border border-border-subtle/60 rounded-md px-4 py-3">
                      <div>
                        <p className="text-xs font-sans font-medium text-text-secondary">Completed</p>
                        <p className="text-xs text-text-tertiary font-sans mt-0.5">Satisfied objectives</p>
                      </div>
                      <span className="text-2xl font-mono font-bold text-success tracking-tight">
                        {stats.completedTasks}
                      </span>
                    </div>

                    {/* Pending - NOT RED per design specification */}
                    <div className="flex items-baseline justify-between bg-surface-inset border border-border-subtle/60 rounded-md px-4 py-3">
                      <div>
                        <p className="text-xs font-sans font-medium text-text-secondary">Pending</p>
                        <p className="text-xs text-text-tertiary font-sans mt-0.5">Awaiting completion</p>
                      </div>
                      <span className="text-2xl font-mono font-bold text-text-secondary tracking-tight">
                        {stats.pendingTasks}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Card Footer Link */}
              <div className="border-t border-border-subtle mt-6 pt-4 flex items-center justify-between text-xs font-sans">
                <span className="text-text-tertiary">
                  Status: {completionRate === 100 && stats.totalTasks > 0 ? 'All Tasks Completed' : `${stats.pendingTasks} Tasks Pending`}
                </span>
                <Link to="/tasks" className="text-cyan hover:text-cyan-tint font-sans font-medium flex items-center gap-1 transition-colors">
                  <span>View All Tasks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Gamification Bar & Up Next */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* GAMIFICATION CARD — AMBER ACCENT */}
            <div className="bg-surface border border-border-subtle rounded-lg p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber/5 blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber" />
                  <h2 className="text-sm font-sans font-semibold text-text-primary">
                    Your Progress
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-amber text-xs font-sans font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber fill-amber/20" />
                  <span>{currentStreak} Day Streak</span>
                </div>
              </div>

              <div className="space-y-5">
                {/* Level Pill */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 border border-amber/30 text-amber font-sans font-semibold text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                    <span>Level {currentLevel}</span>
                  </div>
                  <span className="text-xs font-sans text-amber/80">
                    Tier {Math.floor(currentLevel / 5) + 1}
                  </span>
                </div>

                {/* Amber XP Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-sans text-text-secondary">
                    <span>Experience Points</span>
                    <span className="font-mono font-semibold text-amber">{currentXP} / {maxXP} XP</span>
                  </div>
                  
                  {/* Track */}
                  <div className="h-2 w-full bg-surface-inset border border-border-subtle rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-amber rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${xpPercentage}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed font-sans">
                  Complete active tasks and daily study sessions to earn XP, maintain your streak, and level up.
                </p>
              </div>
            </div>

            {/* UP NEXT */}
            <div className="bg-surface border border-border-subtle rounded-lg p-6">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan" />
                  <h2 className="text-sm font-sans font-semibold text-text-primary">
                    Up Next
                  </h2>
                </div>
                <Link to="/tasks" className="text-xs font-sans text-cyan hover:text-cyan-tint font-medium transition-colors">
                  <span>View all</span>
                </Link>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 bg-surface-inset border border-border-subtle/50 rounded-md">
                  <ShieldCheck className="w-8 h-8 text-text-tertiary mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-sans font-medium text-text-secondary">No pending tasks</p>
                  <p className="text-xs text-text-tertiary font-sans mt-0.5">All scheduled tasks completed</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingTasks.map((task) => (
                    <div
                      key={task._id}
                      className="group flex items-center justify-between gap-3 p-3 bg-surface-inset hover:bg-surface-raised border border-border-subtle/60 hover:border-border-strong rounded-md transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          onClick={() => updateTask(task._id, { status: 'Completed' })}
                          title="Mark Complete"
                          className="shrink-0 text-text-tertiary hover:text-success transition-colors cursor-pointer"
                        >
                          <Circle className="w-4 h-4" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-sans font-medium text-text-primary truncate">
                              {task.title}
                            </p>
                            {(task.isAiGenerated || task.source === 'ai' || task.source === 'AI') && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm font-sans text-[10px] font-medium bg-violet/10 text-violet border border-violet/30 tracking-tight shrink-0">
                                <span className="h-1 w-1 rounded-full bg-violet" />
                                AI
                              </span>
                            )}
                          </div>
                          {task.subject && (
                            <span className="text-xs font-sans text-text-tertiary truncate block">
                              {task.subject}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {getPriorityBadge(task.priority)}
                        <span className="text-xs font-mono text-text-secondary whitespace-nowrap">
                          {task.deadline 
                            ? `Due: ${new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` 
                            : 'No date'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* FOCUS PERFORMANCE & ANALYTICS CARD (Mon - Sun Focus Scores)              */}
        {/* ========================================================================= */}
        <div id="focus-analytics-card" className="bg-surface border border-border-subtle rounded-lg p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-4 mb-6 gap-4">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-cyan" />
              <div>
                <h2 className="text-sm font-sans font-semibold text-text-primary flex items-center gap-2">
                  <span>Focus Score Analytics</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan/10 border border-cyan/30 text-cyan font-normal">
                    Mon – Sun
                  </span>
                </h2>
                <p className="text-xs text-text-tertiary font-sans mt-0.5">
                  Historical deep work telemetry and weekly performance breakdown
                </p>
              </div>
            </div>

            {/* Metric Readout Badges */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="bg-surface-inset border border-border-subtle/80 rounded-md px-3 py-1.5 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-cyan" />
                <span className="text-xs text-text-secondary">Weekly Avg:</span>
                <span className="font-mono font-bold text-xs text-cyan" id="analytics-avg-score">
                  {avgFocusScore}%
                </span>
              </div>

              <div className="bg-surface-inset border border-border-subtle/80 rounded-md px-3 py-1.5 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-amber" />
                <span className="text-xs text-text-secondary">Total Focus:</span>
                <span className="font-mono font-bold text-xs text-amber" id="analytics-total-minutes">
                  {totalWeeklyFocusMinutes}m
                </span>
              </div>

              <div className="bg-surface-inset border border-border-subtle/80 rounded-md px-3 py-1.5 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-success" />
                <span className="text-xs text-text-secondary">Sessions:</span>
                <span className="font-mono font-bold text-xs text-success" id="analytics-total-sessions">
                  {totalCompletedSessions}
                </span>
              </div>
            </div>
          </div>

          {/* Graph Display */}
          <div className="w-full h-64 min-h-[250px] min-w-0 pt-2">
            <ResponsiveContainer 
              width="100%" 
              height="100%" 
              minWidth={0} 
              minHeight={250}
              initialDimension={{ width: 600, height: 250 }}
            >
              <BarChart 
                data={weeklyFocusData || []} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#8B96A3', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fill: '#8B96A3', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip 
                  content={<CustomFocusTooltip />} 
                  cursor={{ fill: 'rgba(34, 211, 238, 0.06)' }}
                />
                <Bar 
                  dataKey="score" 
                  name="Focus Score" 
                  fill="#22D3EE" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={48}
                  isAnimationActive={false}
                >
                  {(weeklyFocusData || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.hasData ? (entry.score >= 80 ? '#22D3EE' : entry.score >= 50 ? '#34D399' : '#FBBF24') : 'rgba(255, 255, 255, 0.08)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Card Footer Insights */}
          <div className="border-t border-border-subtle mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-text-tertiary">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan" />
                <span>High Focus (80%+)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-success" />
                <span>Moderate (50-79%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber" />
                <span>Baseline (&lt;50%)</span>
              </div>
            </div>
            <span>Calculated from focused time, pause ratio, and self-assessment</span>
          </div>
        </div>

        {/* Quiet System Status Line */}
        <div className="pt-2 flex items-center justify-between text-xs font-sans text-text-tertiary">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span>All systems operational</span>
          </div>
          <span>AI Student OS v1.0</span>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
