import React, { useState } from 'react';
import { Zap, User, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import LightPillar from './LightPillar';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : `http://${window.location.hostname}:3001/api`;

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка');
        setLoading(false);
        return;
      }

      // Сохранить токен и данные пользователя
      localStorage.setItem('mog_token', data.token);
      localStorage.setItem('mog_user', JSON.stringify({
        username: data.username,
        wins: data.wins || 0,
        losses: data.losses || 0,
        bestScore: data.bestScore || 0,
      }));

      onAuth({ username: data.username, wins: data.wins || 0, losses: data.losses || 0, bestScore: data.bestScore || 0 });
    } catch (err) {
      setError('Сервер недоступен. Убедись, что server.js запущен.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black z-0">
        <LightPillar
          topColor="#00ff9d"
          bottomColor="#ff0055"
          intensity={1.0}
          rotationSpeed={0.3}
          glowAmount={0.005}
          pillarWidth={3.0}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={0}
          interactive={false}
          mixBlendMode="screen"
        />
      </div>

      {/* Animated grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,255,157,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,157,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Zap className="w-16 h-16 text-cyber-neon mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-cyber-accent drop-shadow-[0_0_10px_rgba(0,255,157,0.5)]">
            OMOGLE
          </h1>
          <p className="text-gray-400 mt-2 text-sm tracking-widest">AESTHETIC EVALUATION PROTOCOL</p>
        </div>

        {/* Card */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-8 shadow-[0_0_40px_rgba(0,255,157,0.08)]">
          {/* Tabs */}
          <div className="flex mb-8 border border-cyber-border rounded-lg overflow-hidden">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3 font-bold tracking-widest text-sm uppercase transition-all flex items-center justify-center gap-2 ${mode === 'login'
                  ? 'bg-cyber-neon text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <LogIn size={16} />
              Войти
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-3 font-bold tracking-widest text-sm uppercase transition-all flex items-center justify-center gap-2 ${mode === 'register'
                  ? 'bg-cyber-neon text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <UserPlus size={16} />
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="НИКНЕЙМ"
                maxLength={20}
                autoComplete="username"
                className="w-full bg-black border-2 border-cyber-border rounded-lg px-4 py-3 pl-10 text-white font-mono tracking-widest focus:border-cyber-neon focus:outline-none transition-colors placeholder-gray-600 uppercase"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="ПАРОЛЬ"
                maxLength={50}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-black border-2 border-cyber-border rounded-lg px-4 py-3 pl-10 pr-10 text-white font-mono tracking-widest focus:border-cyber-neon focus:outline-none transition-colors placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm font-bold tracking-wide">
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full py-4 rounded-lg font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-cyber-neon text-black hover:shadow-[0_0_25px_rgba(0,255,157,0.5)] hover:bg-white active:scale-[0.98]"
            >
              {loading ? (
                <span className="animate-pulse">ЗАГРУЗКА...</span>
              ) : mode === 'login' ? (
                'ВОЙТИ В СИСТЕМУ'
              ) : (
                'СОЗДАТЬ АККАУНТ'
              )}
            </button>
          </form>

          {/* Guest hint */}
          <p className="text-center text-gray-600 text-xs mt-6 tracking-wider">
            Данные хранятся на сервере · JWT авторизация
          </p>
        </div>
      </div>
    </div>
  );
}
