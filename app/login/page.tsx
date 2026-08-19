'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 🚀 CRITICAL SCRIPT HYDRATION FIX: 
  // Forces the engine to wait until your laptop browser is 100% ready before painting layout containers!
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const targetOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      
      const res = await fetch(`${targetOrigin}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          window.location.replace('/');
        }
      } else {
        setError(data.message || 'Authentication rejected.');
      }
    } catch (err) {
      setError('Network transmission error connecting to terminal root.');
    } finally {
      setLoading(false);
    }
  };

  // While the browser prepares the engine assets, show a clean, native loading text
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-xs text-slate-500">
        INITIALIZING SECURITY GATEWAY MODULE...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold tracking-wider font-mono text-emerald-400">CameraStream</h1>
          <p className="text-xs text-slate-500 mt-1">Industrial Conveyor Monitoring Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1.5">Operator ID</label>
            <input 
              type="text" 
              required
              disabled={loading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-slate-200"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1.5">Security Token</label>
            <input 
              type="password" 
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-slate-200"
              placeholder="password"
            />
          </div>

          {error && (
            <p className="text-[11px] text-rose-500 font-mono bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded text-center">
              ⚠ {error}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40 font-mono font-bold text-xs py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/10 mt-2"
          >
            {loading ? 'Validating Token Node...' : 'Authenticate Terminal'}
          </button>
        </form>
      </div>
    </div>
  );
}
