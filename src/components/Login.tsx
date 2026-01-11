
import React, { useState } from 'react';
import { Auth } from '../../types';

interface Props {
  onLogin: (auth: Auth) => void;
  t: (key: string) => string;
}

const ADMIN_PASSWORD = '12345678';

const Login: React.FC<Props> = ({ onLogin, t }) => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  // Simple user login - just tap to enter!
  const handleUserLogin = () => {
    onLogin({
      uid: 'user_' + Date.now(),
      role: 'user',
      name: 'Little Explorer',
      provider: 'guest'
    });
  };

  // Admin login with password
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (adminPassword === ADMIN_PASSWORD) {
      onLogin({
        uid: 'admin',
        role: 'admin',
        name: 'Garden Keeper',
        provider: 'admin'
      });
    } else {
      setError(t('wrongPassword'));
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-rose-100 to-amber-100 relative overflow-hidden h-full w-full select-none">
      {/* Floating decorations */}
      <div className="absolute top-10 left-10 text-6xl opacity-10 pointer-events-none animate-pulse">🌳</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-10 pointer-events-none animate-bounce">🌲</div>
      <div className="absolute top-1/4 right-20 text-4xl opacity-10 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}>🌸</div>
      <div className="absolute bottom-1/4 left-20 text-4xl opacity-10 pointer-events-none animate-bounce" style={{ animationDelay: '0.5s' }}>🌺</div>

      {!showAdmin ? (
        // Simple User Login - Just one big button!
        <div className="w-full max-w-lg text-center">
          <h1 className="text-6xl font-kids text-rose-600 mb-4 drop-shadow-lg animate-bounce">
            🌸
          </h1>
          <h2 className="text-4xl font-kids text-rose-600 mb-2 drop-shadow-sm">
            Welcome to StoryTime!
          </h2>
          <p className="text-rose-400 text-lg mb-8">
            Tap below to start your adventure!
          </p>

          {/* Big friendly button for kids */}
          <button
            onClick={handleUserLogin}
            className="group relative bg-gradient-to-r from-rose-500 to-pink-500 text-white px-16 py-8 rounded-[3rem] shadow-2xl border-b-8 border-rose-700 hover:border-b-4 hover:translate-y-1 transition-all"
          >
            <span className="text-4xl font-black tracking-widest">
              Enter Garden 🌸
            </span>
          </button>

          {/* Tiny admin link */}
          <button
            onClick={() => setShowAdmin(true)}
            className="mt-8 text-rose-400 hover:text-rose-600 text-xs transition-colors opacity-60 hover:opacity-100"
          >
            For Garden Keepers
          </button>
        </div>
      ) : (
        // Admin Login - Simple password
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-4 border-white transform transition-all">
          <h2 className="text-3xl font-kids text-rose-600 text-center mb-2 drop-shadow-sm">
            {t('gardenKeeper')} 👑
          </h2>
          <p className="text-center text-rose-400 text-sm mb-6">
            {t('secretPassword')}
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder={t('enterPassword')}
                className="w-full px-6 py-4 rounded-2xl border-none focus:ring-4 focus:ring-rose-200 outline-none bg-white/50 text-rose-950 font-kids text-xl shadow-inner text-center"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium animate-pulse text-center">
                {t('wrongPassword')}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAdmin(false);
                  setAdminPassword('');
                  setError('');
                }}
                className="flex-1 py-4 bg-gray-200 text-gray-600 rounded-2xl font-black uppercase text-lg tracking-widest shadow-lg hover:bg-gray-300 transition-all"
              >
                {t('back')}
              </button>

              <button
                type="submit"
                className="flex-1 py-4 bg-amber-400 text-rose-950 rounded-2xl font-black uppercase text-lg tracking-widest shadow-xl border-b-4 border-amber-600 hover:border-b-2 hover:translate-y-0.5 transition-all"
              >
                {t('enter')} 👑
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;
