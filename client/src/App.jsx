import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BattleArena from './components/BattleArena';
import AuthForm from './components/AuthForm';
import AgeVerification from './components/AgeVerification';
import LegalModal from './components/LegalModal';
import FAQ from './components/FAQ';
import Comparison from './components/Comparison';
import Guide from './components/Guide';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import Footer from './components/Footer';
import { translations } from './utils/translations';

import DailyRewards from './components/DailyRewards';

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('mog_lang') || 'ru');
  const [isGlitching, setIsGlitching] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const location = useLocation();

  const t = translations[lang];

  const toggleLang = () => {
    const newLang = lang === 'ru' ? 'en' : 'ru';
    setLang(newLang);
    localStorage.setItem('mog_lang', newLang);
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 300);
  };

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const path = location.pathname === '/' ? '' : location.pathname;
      canonical.setAttribute('href', `https://omogle.me${path}`);
    }
  }, [location.pathname]);

  // Update Meta Tags and Lang dynamically
  useEffect(() => {
    // HTML Lang
    document.documentElement.lang = lang;
    
    // Title
    document.title = t.seoTitle || "Omogle — AI Face Rating";
    
    // Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t.seoDesc || "");
    }
    
    // Open Graph Title/Desc
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', t.seoTitle || "");
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', t.seoDesc || "");
  }, [lang, t]);

  // Восстановить сессию при перезагрузке страницы
  useEffect(() => {
    const stored = localStorage.getItem('mog_user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
        
        // Check daily rewards
        const lastClaim = localStorage.getItem('mog_last_claim');
        if (lastClaim !== new Date().toDateString()) {
          setShowDaily(true);
        }
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

  const handleClaimReward = (reward) => {
    setUser(prev => {
      if (!prev) return prev;
      const newUser = { ...prev };
      
      if (reward.type === 'premium') {
        newUser.scans = (newUser.scans || 0) + reward.value;
      } else if (reward.type === 'points') {
        newUser.points = (newUser.points || 0) + reward.value;
      } else if (reward.type === 'analysis') {
        newUser.premiumEnabled = true;
      }
      
      localStorage.setItem('mog_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  if (checking) return null;

  return (
    <div className="min-h-screen relative flex flex-col">
      <AgeVerification lang={lang} />
      {/* Language Toggle */}
      <button
        onClick={toggleLang}
        className={`fixed top-6 left-6 z-[100] bg-black/60 border border-cyber-border px-3 py-1 rounded text-xs font-black tracking-widest text-cyber-neon hover:bg-cyber-neon hover:text-black transition-all backdrop-blur-md ${isGlitching ? 'animate-glitch' : ''}`}
      >
        {lang.toUpperCase()}
      </button>

      <div className="flex-1">
        <Routes>
          <Route path="/" element={
            !user ? (
              <AuthForm onAuth={(u) => { 
                setUser(u); 
                // Show rewards immediately after login if not claimed
                if (localStorage.getItem('mog_last_claim') !== new Date().toDateString()) {
                  setShowDaily(true);
                }
              }} lang={lang} t={t} onShowLegal={() => setShowLegal(true)} />
            ) : (
              <BattleArena 
                user={user} 
                setUser={setUser} 
                onLogout={handleLogout} 
                lang={lang} 
                t={t} 
                onShowDaily={() => setShowDaily(true)}
              />
            )
          } />
          <Route path="/faq" element={<FAQ lang={lang} />} />
          <Route path="/about" element={<Comparison lang={lang} />} />
          <Route path="/guide" element={<Guide lang={lang} />} />
          <Route path="/terms" element={<Terms lang={lang} />} />
          <Route path="/privacy" element={<Privacy lang={lang} />} />
        </Routes>
      </div>

      <Footer lang={lang} />
      {showLegal && <LegalModal lang={lang} onClose={() => setShowLegal(false)} />}
      {showDaily && user && (
        <DailyRewards 
          lang={lang} 
          onClaim={handleClaimReward} 
          onClose={() => setShowDaily(false)} 
        />
      )}
    </div>
  );
}

export default App;
