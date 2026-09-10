import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let res;
    if (isLogin) {
      res = await login(formData.email, formData.password);
    } else {
      res = await register(formData.name, formData.email, formData.password);
    }

    if (!res.success) {
      setError(res.message || 'Authentication failed');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4 selection:bg-cyan/30 selection:text-cyan text-text-primary">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[250px] bg-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-lg p-8 relative z-10">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan shrink-0" />
          <p className="text-xs uppercase tracking-wider font-sans text-cyan font-semibold">AI Student OS</p>
        </div>

        <h1 className="text-2xl font-sans font-bold tracking-tight text-text-primary mb-6">
          {isLogin ? 'Sign In' : 'Create an Account'}
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-md text-danger text-xs font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-sans font-medium text-text-secondary">
                Full Name
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-text-tertiary"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-sans font-medium text-text-secondary">
              Email Address
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-text-tertiary"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans font-medium text-text-secondary">
              Password
            </label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-text-tertiary"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-cyan text-text-on-accent hover:brightness-110 font-sans font-medium text-sm py-2.5 rounded-md transition-all shadow-sm flex justify-center items-center gap-2 cursor-pointer mt-3 disabled:opacity-50"
          >
            {isLoading && <div className="h-4 w-4 border-2 border-text-on-accent border-t-transparent rounded-full animate-spin"></div>}
            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

        <div className="mt-6 border-t border-border-subtle pt-4">
          <p className="text-xs text-text-secondary font-sans text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 text-cyan hover:text-cyan-tint font-medium underline underline-offset-4 cursor-pointer"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
