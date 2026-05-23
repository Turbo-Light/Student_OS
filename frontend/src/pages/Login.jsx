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
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[250px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 p-8 shadow-2xl shadow-cyan-950/10 relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <span className="h-2 w-2 bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <p className="text-xs uppercase tracking-[0.25em] font-mono text-cyan-400 font-bold">AI Student OS</p>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-100 mb-6 font-sans">
          {isLogin ? 'SYSTEM AUTHENTICATION' : 'USER REGISTRATION'}
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-mono">
            [ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs uppercase font-mono text-neutral-500 tracking-wider">IDENTIFIER [NAME]</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-200 px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-700"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs uppercase font-mono text-neutral-500 tracking-wider">CREDENTIAL [EMAIL]</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-200 px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-700"
              placeholder="user@domain.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-mono text-neutral-500 tracking-wider">SECURITY KEY [PASSWORD]</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-200 px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-700"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-mono font-bold tracking-wider py-3 mt-4 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
          >
            {isLoading && <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>}
            {isLogin ? 'INITIALIZE SESSION' : 'ESTABLISH PROFILE'}
          </button>
        </form>

        <div className="mt-8 border-t border-neutral-800 pt-6">
          <p className="text-xs text-neutral-500 font-mono text-center">
            {isLogin ? "NO ACCESS CLEARANCE?" : "EXISTING CLEARANCE?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-400/30 cursor-pointer"
            >
              {isLogin ? "REQUEST ACCESS" : "AUTHENTICATE"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
