import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Mail } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export default function Footer({ lang }) {
  const isRu = lang === 'ru';
  const [onlineCount, setOnlineCount] = useState(500);

  useEffect(() => {
    const fetchOnline = async () => {
      try {
        const res = await fetch(`${SOCKET_URL}/api/online`);
        if (res.ok) {
          const data = await res.json();
          setOnlineCount(data.online + 500);
        }
      } catch (err) {
        // Fallback or ignore
      }
    };

    fetchOnline();
    const interval = setInterval(fetchOnline, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative z-50 bg-black/80 backdrop-blur-3xl border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.jpg" alt="Omogle" className="w-10 h-10 rounded-xl group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-cyber-neon to-cyber-accent">
                OMOGLE
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {isRu 
                ? "Ведущая AI-платформа для оценки эстетики и соревнований в реальном времени."
                : "The leading AI platform for aesthetic evaluation and real-time competition."}
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-cyber-neon hover:bg-white/10 transition-all">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Globe size={18} />
              </a>
              <a href="mailto:support@omogle.me" className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-cyber-accent hover:bg-white/10 transition-all">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Links: Platform */}
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-[0.3em] mb-6">
              {isRu ? 'Платформа' : 'Platform'}
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link to="/" className="text-gray-500 hover:text-cyber-neon transition-colors">
                  {isRu ? 'Главная' : 'Home'}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-500 hover:text-cyber-neon transition-colors">
                  {isRu ? 'Почему Omogle?' : 'Why Omogle?'}
                </Link>
              </li>
              <li>
                <Link to="/guide" className="text-gray-500 hover:text-cyber-neon transition-colors">
                  {isRu ? 'Гайд по внешности' : 'Looksmaxxing Guide'}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-500 hover:text-cyber-neon transition-colors">
                  {isRu ? 'Вопросы и ответы' : 'FAQ'}
                </Link>
              </li>
              <li>
                <a href="/#battle" className="text-gray-500 hover:text-cyber-neon transition-colors">
                  {isRu ? 'Битва Арена' : 'Battle Arena'}
                </a>
              </li>
            </ul>
          </div>

          {/* Links: Legal */}
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-[0.3em] mb-6">
              {isRu ? 'Юридические' : 'Legal'}
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link to="/terms" className="text-gray-500 hover:text-cyber-neon transition-colors">
                  {isRu ? 'Условия использования' : 'Terms of Use'}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-500 hover:text-cyber-neon transition-colors">
                  {isRu ? 'Приватность' : 'Privacy Policy'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Status */}
          <div>
            <div className="bg-gradient-to-br from-cyber-neon/10 to-transparent border border-cyber-neon/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-cyber-neon rounded-full animate-pulse" />
                <span className="text-cyber-neon text-[10px] font-black uppercase tracking-widest">System Online</span>
              </div>
              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-4">
                {isRu ? `ОНЛАЙН: ${onlineCount}` : `USERS ONLINE: ${onlineCount}`}
              </p>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-cyber-neon h-full w-[85%] animate-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* SEO Text Block */}
        <div className="mb-12 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] animate-reveal">
          <h5 className="text-white text-xs font-black uppercase tracking-widest mb-4 opacity-50">
            {isRu ? 'О проекте Omogle' : 'About Omogle Protocol'}
          </h5>
          <p className="text-gray-600 text-[11px] leading-relaxed text-justify font-medium">
            {isRu 
              ? "Omogle (омогле) — это оригинальная и самая продвинутая платформа для Mog Battle и ИИ-анализа лиц. Если вы искали ommoggle, omeggle или способы луксмаксинга (looksmaxxing) — вы нашли цель. Наша нейросеть анализирует симметрию лица, челюсть и взгляд. Omogle.me — это золотой стандарт в мире ИИ-анализа внешности."
              : "Omogle is the original and most advanced platform for Mog Battles and AI face rating (looksmaxxing). (Also known as ommoggle, omeggle or omogged). Whether you are looksmaxxing or just curious about your facial aesthetics, our neural network provides a precise score and real-time PvP competitions. Join the original Omogle experience."}
          </p>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-600 font-mono tracking-[0.5em] uppercase">
            © 2026 OMOGLE PROTOCOL. ESTABLISHED IN THE VOID.
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] text-gray-700 font-mono uppercase tracking-widest">
              Built with AI
            </span>
            <span className="text-[10px] text-gray-700 font-mono uppercase tracking-widest">
              Encrypted
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
