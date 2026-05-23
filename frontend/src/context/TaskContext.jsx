import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Network Error');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [...prev, newTask]);
        toast.success('Directive Appended');
      }
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error('Network Error');
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => t._id === id ? updatedTask : t));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Network Error');
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t._id !== id));
        toast.success('Directive Terminated');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Network Error');
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, isLoading, fetchTasks, addTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
