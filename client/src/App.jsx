import React, { useState, useEffect } from 'react';
import BattleArena from './components/BattleArena';
import AuthForm from './components/AuthForm';
import AgeVerification from './components/AgeVerification';
import LegalModal from './components/LegalModal';
import { translations } from './utils/translations';

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('mog_lang') || 'ru');
  const [isGlitching, setIsGlitching] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  const t = translations[lang];

  const toggleLang = () => {
    const newLang = lang === 'ru' ? 'en' : 'ru';
    setLang(newLang);
    localStorage.setItem('mog_lang', newLang);
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 300);
  };

  // Восстановить сессию при перезагрузке страницы
  useEffect(() => {
    const stored = localStorage.getItem('mog_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('mog_user');
        localStorage.removeItem('mog_token');
      }
    }
    setChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mog_token');
    localStorage.removeItem('mog_user');
    setUser(null);
  };

  if (checking) return null;

  return (
    <div className="min-h-screen relative">
      <AgeVerification lang={lang} />
      {/* Language Toggle */}
      <button
        onClick={toggleLang}
        className={`fixed top-6 left-6 z-50 bg-black/60 border border-cyber-border px-3 py-1 rounded text-xs font-black tracking-widest text-cyber-neon hover:bg-cyber-neon hover:text-black transition-all backdrop-blur-md ${isGlitching ? 'animate-glitch' : ''}`}
      >
        {lang.toUpperCase()}
      </button>

      {!user ? (
        <AuthForm onAuth={setUser} lang={lang} t={t} onShowLegal={() => setShowLegal(true)} />
      ) : (
        <BattleArena user={user} setUser={setUser} onLogout={handleLogout} lang={lang} t={t} />
      )}

      {showLegal && <LegalModal lang={lang} onClose={() => setShowLegal(false)} />}
    </div>
  );
}

export default App;
