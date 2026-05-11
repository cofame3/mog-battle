import React, { useState, useEffect } from 'react';

const AgeVerification = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isVerified = localStorage.getItem('mog_age_verified');
    if (!isVerified) {
      setIsVisible(true);
      // Блокируем скролл пока открыто окно
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('mog_age_verified', 'true');
    setIsVisible(false);
    document.body.style.overflow = 'unset';
  };

  const handleDeny = () => {
    window.location.href = "https://google.com";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 transition-all duration-500">
      <div className="bg-cyber-panel/80 border border-cyber-border/50 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,255,157,0.05)]">
        
        {/* Анимированный фоновый градиент */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyber-neon/10 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 mb-6 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-cyber-accent/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative w-16 h-16 bg-cyber-dark border border-cyber-accent/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,0,85,0.2)]">
              <span className="text-cyber-accent text-2xl font-black tracking-widest drop-shadow-[0_0_8px_rgba(255,0,85,0.8)]">18+</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-widest font-mono drop-shadow-md">
            {lang === 'ru' ? 'Доступ ограничен' : 'Restricted Access'}
          </h2>
          
          <p className="text-gray-400 mb-8 leading-relaxed font-mono text-sm max-w-[90%] mx-auto">
            {lang === 'ru' 
              ? 'Этот контент предназначен только для взрослой аудитории. Подтвердите, что вам исполнилось 18 лет.' 
              : 'This content is intended for mature audiences only. Please confirm that you are at least 18 years old.'}
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleConfirm}
              className="group relative w-full py-4 bg-cyber-neon/10 hover:bg-cyber-neon/20 border border-cyber-neon/50 text-cyber-neon font-black rounded-xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-neon/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <span className="relative tracking-widest uppercase text-sm drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]">
                {lang === 'ru' ? 'Мне исполнилось 18' : 'I am 18 or older'}
              </span>
            </button>
            
            <button
              onClick={handleDeny}
              className="w-full py-3 bg-transparent text-gray-500 hover:text-gray-300 font-mono text-xs uppercase tracking-widest transition-colors duration-300"
            >
              {lang === 'ru' ? 'Покинуть сайт' : 'Leave Site'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
