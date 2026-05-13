import React, { useState } from 'react';
import { Zap, User, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import LightPillar from './LightPillar';
import SpellingSection from './SpellingSection';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : `http://${window.location.hostname}:3001/api`;

export default function AuthForm({ onAuth, lang, t, onShowLegal }) {
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
        setError(data.error || (t.ru ? 'Ошибка' : 'Error'));
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
        avatarUrl: data.avatarUrl || '',
        lastNicknameChange: data.lastNicknameChange || null,
      }));

      onAuth({ username: data.username, wins: data.wins || 0, losses: data.losses || 0, bestScore: data.bestScore || 0, avatarUrl: data.avatarUrl || '', lastNicknameChange: data.lastNicknameChange || null });
    } catch (err) {
      setError(t.ru ? 'Сервер недоступен. Убедись, что server.js запущен.' : 'Server unavailable. Make sure server.js is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    const guestId = Math.floor(1000 + Math.random() * 9000);
    const guestName = `GUEST_${guestId}`;
    const guestData = {
      username: guestName,
      wins: 0,
      losses: 0,
      bestScore: 0,
      isGuest: true
    };

    localStorage.setItem('mog_user', JSON.stringify(guestData));
    // При гостевом входе mog_token не устанавливается
    onAuth(guestData);
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API.replace('/api', '')}/api/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Google Auth Failed');
        return;
      }

      localStorage.setItem('mog_token', data.token);
      localStorage.setItem('mog_user', JSON.stringify({
        username: data.username,
        wins: data.wins || 0,
        losses: data.losses || 0,
        bestScore: data.bestScore || 0,
        avatarUrl: data.avatarUrl || '',
        lastNicknameChange: data.lastNicknameChange || null,
      }));

      onAuth(data);
    } catch (err) {
      setError('Google Login Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-20 relative overflow-hidden">
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

      <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-reveal">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Omogle Logo" className="w-32 h-32 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(0,255,157,0.5)] object-cover rounded-[2rem]" />
          <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-cyber-accent drop-shadow-[0_0_10px_rgba(0,255,157,0.5)]">
            OMOGLE — AI FACE RATING
          </h1>
          <p className="text-gray-400 mt-2 text-sm tracking-widest uppercase">{t.protocol}</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8 border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 font-bold tracking-widest text-sm uppercase transition-all flex items-center justify-center gap-2 ${mode === 'login'
              ? 'bg-cyber-neon text-black'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <LogIn size={16} />
            {t.login}
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-3 font-bold tracking-widest text-sm uppercase transition-all flex items-center justify-center gap-2 ${mode === 'register'
              ? 'bg-cyber-neon text-black'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <UserPlus size={16} />
            {t.register}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={t.username}
              maxLength={20}
              autoComplete="username"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white font-mono tracking-widest focus:border-cyber-neon focus:outline-none transition-colors placeholder-gray-600 uppercase"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t.password}
              maxLength={50}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-white font-mono tracking-widest focus:border-cyber-neon focus:outline-none transition-colors placeholder-gray-600"
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
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl px-4 py-3 text-red-400 text-xs font-bold tracking-wide">
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full py-3.5 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-cyber-neon text-black hover:shadow-[0_0_25px_rgba(0,255,157,0.5)] hover:bg-white active:scale-[0.98]"
          >
            {loading ? (
              <span className="animate-pulse">{t.loading}</span>
            ) : mode === 'login' ? (
              t.loginBtn
            ) : (
              t.registerBtn
            )}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink-0 mx-4 text-gray-600 text-[10px] font-bold tracking-[0.3em] uppercase">{t.or}</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <button
            type="button"
            onClick={handleGuest}
            className="w-full py-2.5 rounded-xl font-bold uppercase tracking-widest border border-white/10 text-gray-400 hover:border-cyber-accent hover:text-white hover:bg-cyber-accent/5 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {t.guestBtn}
          </button>
          <p className="text-[8px] text-center text-gray-600 mt-1 tracking-widest uppercase italic leading-tight">
            {t.guestWarning}
          </p>

          <div className="mt-4 flex flex-col items-center gap-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              width="280"
            />
            <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase opacity-60">
              {t.ru ? 'Продолжая, вы принимаете' : 'By joining, you agree to our'}{' '}
              <button
                type="button"
                onClick={onShowLegal}
                className="text-cyber-neon/80 hover:text-cyber-neon hover:underline transition-colors"
              >
                Terms of Use
              </button>
            </p>
          </div>
        </form>

        {/* Guest hint */}
        <p className="text-center text-gray-600 text-[10px] mt-6 tracking-wider opacity-50">
          {t.ru ? 'Данные хранятся на сервере · JWT авторизация' : 'Data stored on server · JWT authorization'}
        </p>

        {/* SEO Block */}
        <div className="mt-12 pt-8 border-t border-white/5 space-y-4 text-[11px] text-gray-500 leading-relaxed font-sans italic opacity-60 text-center">
          <p>
            {t.ru
              ? "Omogle — это передовая платформа для оценки внешности с использованием искусственного интеллекта. Наш AI Face Rating анализирует черты вашего лица, такие как симметрия, линия челюсти и наклон глаз (canthal tilt), чтобы дать объективную оценку вашей привлекательности. Это не просто инструмент для анализа, а настоящая Beauty Battle Arena, где вы можете соревноваться с другими пользователями в реальном времени."
              : "Omogle is a cutting-edge platform for facial evaluation using artificial intelligence. Our AI Face Rating analyzes your facial features, such as symmetry, jawline, and canthal tilt, to provide an objective assessment of your attractiveness. This is more than just an analysis tool; it's a real Beauty Battle Arena where you can compete with others in real-time."}
          </p>
          <p>
            {t.ru
              ? "Если вы искали omogle, ommoggle или ommoggle omoggle, вы попали на официальный сайт. Это не просто видеочат, а настоящая Mog Battle Arena для looksmaxxing. Вступай в битву и докажи, что ты настоящий Гигачад!"
              : "If you found us by searching for omogle, ommoggle, or ommoggle omoggle, you are in the right place. This is more than just a random video chat; it's the Mog Battle Arena for looksmaxxing. Enter the battle and prove you're a true Gigachad!"}
          </p>
        </div>
      </div>

      {/* Spelling Variations SEO Section */}
      <SpellingSection lang={lang} />
    </div>
  );
}
