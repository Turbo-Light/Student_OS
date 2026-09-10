import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TaskContext } from '../context/TaskContext';
import { FocusContext } from '../context/FocusContext';
import { Clock, Trash2, Check, Plus, X, Target } from 'lucide-react';

const Tasks = () => {
  const location = useLocation();
  const { tasks, isLoading, fetchTasks, addTask, updateTask, deleteTask } = useContext(TaskContext);
  const { openFocusLauncher } = useContext(FocusContext) || {};
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    deadline: '',
    subject: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (location.search.includes('new=true')) {
      setShowForm(true);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask(formData);
    setFormData({ title: '', description: '', priority: 'Medium', deadline: '', subject: '' });
  };

  const renderPriorityBadge = (priority) => {
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter(task => {
    if (task.status === 'Completed') return false;
    if (!task.deadline) return false;
    const taskDate = new Date(task.deadline);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
  });

  const upcomingTasks = tasks.filter(task => {
    if (task.status === 'Completed') return false;
    if (!task.deadline) return true;
    const taskDate = new Date(task.deadline);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate >= today;
  });

  const completedTasks = tasks.filter(task => task.status === 'Completed');

  const renderTaskCard = (task) => {
    const isCompleted = task.status === 'Completed';
    const isOverdue = !isCompleted && task.deadline && (new Date(task.deadline).setHours(0, 0, 0, 0) < today.getTime());
    const formattedDate = task.deadline 
      ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No due date';

    return (
      <div 
        key={task._id} 
        className={`group flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 ${
          isCompleted 
            ? 'bg-surface/40 border-border-subtle opacity-60' 
            : 'bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-raised'
        }`}
      >
        {/* Checkbox Toggle */}
        <button 
          onClick={() => updateTask(task._id, { status: isCompleted ? 'Pending' : 'Completed' })}
          className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
            isCompleted 
              ? 'bg-cyan/20 border-cyan/50 text-cyan' 
              : 'bg-surface-inset border-border-subtle hover:border-cyan text-transparent hover:text-cyan/40'
          }`}
          title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Card Body */}
        <div className="flex-grow min-w-0">
          {/* Header Row: Title & Badges on Left, Right-Aligned Due Date & Priority on Right */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h3 className={`text-sm font-sans font-semibold truncate ${isCompleted ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                {task.title}
              </h3>

              {/* Subject Badge */}
              {task.subject && (
                <span className="px-2 py-0.5 rounded-sm font-sans text-xs bg-cyan-dim text-cyan border border-cyan/20">
                  {task.subject}
                </span>
              )}

              {/* AI-Generated Tag Cross-Pollination */}
              {(task.isAiGenerated || task.source === 'ai' || task.source === 'AI') && (
                <span className="px-2 py-0.5 rounded-sm font-sans text-xs bg-violet-dim text-violet border border-violet/30 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet" />
                  AI-generated
                </span>
              )}
            </div>

            {/* Right-Aligned Badges: Priority + Due Date */}
            <div className="shrink-0 flex items-center gap-2.5 text-right">
              {renderPriorityBadge(task.priority)}

              <span className={`text-xs font-mono tracking-tight flex items-center gap-1.5 ${
                isCompleted 
                  ? 'text-text-tertiary' 
                  : isOverdue 
                    ? 'text-danger font-semibold' 
                    : 'text-text-secondary'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>Due: {formattedDate}</span>
              </span>
            </div>
          </div>
          
          {/* Description */}
          {task.description && (
            <p className="text-xs font-sans text-text-secondary line-clamp-2 leading-relaxed mb-3">
              {task.description}
            </p>
          )}

          {/* Footer Metadata & Actions */}
          <div className="flex items-center justify-between text-xs font-sans text-text-tertiary pt-2 border-t border-border-subtle/50 mt-2">
            <span>
              Updated {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}
            </span>
            
            <div className="flex items-center gap-1.5">
              {/* Start Focus Button with Target Icon */}
              {!isCompleted && (
                <button 
                  onClick={() => openFocusLauncher && openFocusLauncher({
                    subject: task.subject || '',
                    topic: task.title || '',
                    taskId: task._id,
                    goal: task.description ? `Complete task: ${task.title}` : ''
                  })}
                  className="text-cyan hover:text-cyan-tint hover:bg-cyan-dim px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-sans font-medium"
                  title="Start Focus Session"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Start Focus</span>
                </button>
              )}

              {/* Standard SaaS Delete Button */}
              <button 
                onClick={() => deleteTask(task._id)}
                className="text-text-tertiary hover:text-danger hover:bg-danger/10 px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-sans"
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base text-text-primary font-sans selection:bg-cyan/30 selection:text-cyan py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[250px] bg-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border-subtle pb-5 gap-4">
          <div>
            <p className="text-xs font-sans text-cyan font-medium uppercase tracking-wider mb-1">
              Tasks
            </p>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-text-primary">
              Active Tasks
            </h1>
          </div>

          {/* Standard SaaS Trigger Button */}
          <button
            onClick={() => setShowForm(prev => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cyan text-text-on-accent font-sans font-medium text-sm hover:brightness-110 transition-all cursor-pointer shadow-sm"
          >
            {showForm ? (
              <>
                <X className="w-4 h-4" />
                <span>Close</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>+ New Task</span>
              </>
            )}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Section A: Task Input Form (Collapsible) */}
          {showForm && (
            <div className="lg:col-span-4 transition-all">
              <div className="bg-surface border border-border-subtle rounded-lg p-6 sticky top-20">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan" />
                    <h2 className="text-sm font-sans font-semibold text-text-primary">
                      Create New Task
                    </h2>
                  </div>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="text-text-tertiary hover:text-text-primary text-xs font-sans cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-sans font-medium text-text-secondary">
                      Title
                    </label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-text-tertiary"
                      placeholder="e.g., Computer Architecture Review"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-sans font-medium text-text-secondary">
                      Subject
                    </label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-text-tertiary"
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-sans font-medium text-text-secondary">
                      Description
                    </label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-text-tertiary min-h-[80px]"
                      placeholder="Add any notes or context..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-sans font-medium text-text-secondary">
                        Priority
                      </label>
                      <select 
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-sans font-medium text-text-secondary">
                        Due Date
                      </label>
                      <input 
                        type="date" 
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        className="w-full bg-surface-inset border border-border-subtle text-text-secondary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Primary Action Button: Standard SaaS button */}
                  <button 
                    type="submit" 
                    className="w-full bg-cyan text-text-on-accent hover:brightness-110 font-sans font-medium text-sm py-2.5 rounded-md transition-all shadow-sm flex justify-center items-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Create Task</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Section B: Task Registry */}
          <div className={showForm ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <div className="bg-surface border border-border-subtle rounded-lg p-6 min-h-[500px]">
              <div className="flex justify-between items-center mb-6 border-b border-border-subtle pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan" />
                  <h2 className="text-sm font-sans font-semibold text-text-primary">
                    All Tasks
                  </h2>
                </div>
                {isLoading && <div className="text-xs font-sans text-cyan animate-pulse">Syncing tasks...</div>}
              </div>

              {tasks.length === 0 && !isLoading ? (
                <div className="text-center py-20 border border-dashed border-border-subtle bg-surface-inset/50 rounded-lg">
                  <p className="text-text-tertiary font-sans text-xs">No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* OVERDUE SECTOR */}
                  {overdueTasks.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-sans font-semibold text-danger border-b border-danger/20 pb-2 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                        Overdue ({overdueTasks.length})
                      </h3>
                      {overdueTasks.map(task => renderTaskCard(task))}
                    </div>
                  )}

                  {/* UPCOMING SECTOR */}
                  {upcomingTasks.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-sans font-semibold text-cyan border-b border-cyan/20 pb-2 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan" />
                        Upcoming ({upcomingTasks.length})
                      </h3>
                      {upcomingTasks.map(task => renderTaskCard(task))}
                    </div>
                  )}

                  {/* COMPLETED SECTOR */}
                  {completedTasks.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-sans font-semibold text-text-tertiary border-b border-border-subtle pb-2 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-border-strong" />
                        Completed ({completedTasks.length})
                      </h3>
                      {completedTasks.map(task => renderTaskCard(task))}
                    </div>
                  )}
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
