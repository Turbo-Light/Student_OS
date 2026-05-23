import React, { useContext, useEffect, useState } from 'react';
import { TaskContext } from '../context/TaskContext';
import { Link } from 'react-router-dom';

const Tasks = () => {
  const { tasks, isLoading, fetchTasks, addTask, updateTask, deleteTask } = useContext(TaskContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask(formData);
    setFormData({ title: '', description: '', priority: 'Medium', dueDate: '' });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-rose-500 shadow-[0_0_8px_#f43f5e]';
      case 'Medium': return 'bg-amber-500 shadow-[0_0_8px_#f59e0b]';
      case 'Low': return 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
      default: return 'bg-neutral-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 py-10 px-6 relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-neutral-800 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <p className="text-xs uppercase tracking-[0.25em] font-mono text-cyan-400 font-bold">MODULE // TASK_MATRIX</p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-400">
              Active Directives
            </h1>
          </div>
          <Link to="/" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 px-4 py-2 rounded bg-cyan-500/5 transition-all">
            [RETURN TO DASHBOARD]
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Section A: Command Input */}
          <div className="lg:col-span-4">
            <div className="bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 p-6 shadow-2xl shadow-cyan-950/10 sticky top-10">
              <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-neutral-400 mb-6 border-b border-neutral-800 pb-2">
                &gt; Initialize_Task
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">PARAMETER [TITLE]</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-200 px-3 py-2 font-mono text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-700"
                    placeholder="Enter directive title"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">PARAMETER [DESCRIPTION]</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-200 px-3 py-2 font-mono text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-700 min-h-[80px]"
                    placeholder="Elaborate on objectives..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">LEVEL [PRIORITY]</label>
                    <select 
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-200 px-3 py-2 font-mono text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    >
                      <option value="Low">LOW</option>
                      <option value="Medium">MEDIUM</option>
                      <option value="High">HIGH</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">TARGET [DUE_DATE]</label>
                    <input 
                      type="date" 
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-400 px-3 py-2 font-mono text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-mono font-bold tracking-wider text-xs py-2.5 mt-2 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all flex justify-center items-center gap-2 cursor-pointer"
                >
                  [EXECUTE APPEND]
                </button>
              </form>
            </div>
          </div>

          {/* Section B: Active Matrix */}
          <div className="lg:col-span-8">
            <div className="bg-neutral-900/20 border border-neutral-800/60 p-6 min-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-neutral-400">
                  <span className="text-cyan-500 mr-2">_</span>TASK_REGISTRY
                </h2>
                {isLoading && <div className="text-xs font-mono text-cyan-500 animate-pulse">SYNCING...</div>}
              </div>

              {tasks.length === 0 && !isLoading ? (
                <div className="text-center py-20 border border-dashed border-neutral-800 bg-neutral-900/10">
                  <p className="text-neutral-500 font-mono text-xs">NO ACTIVE DIRECTIVES IN MATRIX</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div 
                      key={task._id} 
                      className={`group flex items-start gap-4 p-4 border transition-all duration-300 ${
                        task.status === 'Completed' 
                          ? 'bg-neutral-950/40 border-neutral-800/40 opacity-60' 
                          : 'bg-neutral-950/80 border-neutral-700/50 hover:border-cyan-500/30 hover:bg-[#0b0d13]'
                      }`}
                    >
                      {/* Checkbox Toggle */}
                      <button 
                        onClick={() => updateTask(task._id, { status: task.status === 'Completed' ? 'Pending' : 'Completed' })}
                        className={`mt-1 shrink-0 w-5 h-5 border flex items-center justify-center transition-colors cursor-pointer ${
                          task.status === 'Completed' 
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                            : 'bg-neutral-900 border-neutral-600 hover:border-cyan-500 text-transparent hover:text-cyan-500/30'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className={`text-sm font-bold truncate ${task.status === 'Completed' ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 bg-neutral-900/80 border border-neutral-800">
                            <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
                            <span className="text-[9px] font-mono uppercase text-neutral-400 tracking-wider">{task.priority}</span>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-neutral-400/80 line-clamp-2 leading-relaxed mb-3">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              TGT: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            UPD: {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => deleteTask(task._id)}
                          className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                          title="Purge Task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Tasks;
