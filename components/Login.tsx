
import React, { useState } from 'react';
import { Auth, UserRole } from '../types';

interface Props {
  onLogin: (auth: Auth) => void;
  t: (key: string) => string;
}

const Login: React.FC<Props> = ({ onLogin, t }) => {
  const [role, setRole] = useState<UserRole>('user');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'admin') {
      if (password === 'DejSeg@22') {
        onLogin({ role: 'admin', name: 'Administrator' });
      } else {
        setError('Incorrect administrator password.');
      }
    } else {
      // User name is no longer mandatory
      onLogin({ role: 'user', name: name.trim() || 'Explorer' });
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-rose-100 to-amber-100 relative overflow-hidden h-full w-full select-none">
      <div className="absolute top-10 left-10 text-6xl opacity-10 pointer-events-none animate-pulse">🌳</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-10 pointer-events-none animate-bounce">🌲</div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-4 border-white transform transition-all">
        <h2 className="text-4xl font-kids text-rose-600 text-center mb-8 drop-shadow-sm">Who is visiting?</h2>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setRole('user')}
            type="button"
            className={`flex-1 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${role === 'user' ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-rose-50 text-rose-300'}`}
          >
            Little Explorer
          </button>
          <button 
            onClick={() => setRole('admin')}
            type="button"
            className={`flex-1 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${role === 'admin' ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-rose-50 text-rose-300'}`}
          >
            Garden Keeper
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {role === 'user' ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-rose-400 uppercase px-2 tracking-widest">Your Name (Optional)</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Explorer..."
                className="w-full px-6 py-4 rounded-2xl border-none focus:ring-4 focus:ring-rose-200 outline-none bg-white/50 text-rose-950 font-kids text-xl shadow-inner"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-rose-400 uppercase px-2 tracking-widest">Secret Word</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-4 rounded-2xl border-none focus:ring-4 focus:ring-rose-200 outline-none bg-white/50 text-rose-950 font-kids text-xl shadow-inner"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest animate-pulse">{error}</p>}

          <button 
            type="submit"
            className="w-full py-5 bg-amber-400 text-rose-950 rounded-3xl font-black uppercase text-xl tracking-widest shadow-xl border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 transition-all"
          >
            Enter Garden 🌸
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
