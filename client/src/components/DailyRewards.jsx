import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Star, Zap, Gift, Scan, X } from 'lucide-react';

const REWARDS = [
  { day: 1, type: 'premium', value: 1, icon: <Scan size={20} />, label: 'PSL SCAN' },
  { day: 2, type: 'points', value: 20, icon: <Zap size={20} />, label: 'POINTS' },
  { day: 3, type: 'premium', value: 1, icon: <Scan size={20} />, label: 'PSL SCAN' },
  { day: 4, type: 'points', value: 40, icon: <Star size={20} />, label: 'POINTS' },
  { day: 5, type: 'points', value: 60, icon: <Trophy size={20} />, label: 'POINTS' },
  { day: 6, type: 'points', value: 100, icon: <Trophy size={20} />, label: 'POINTS' },
  { day: 7, type: 'analysis', value: 1, icon: <Gift size={24} />, special: true, label: 'PREMIUM' },
];

export default function DailyRewards({ onClaim, onClose, lang }) {
  const [streak, setStreak] = useState(1);
  const [claimedToday, setClaimedToday] = useState(false);
  const ru = lang === 'ru';

  useEffect(() => {
    const lastClaim = localStorage.getItem('mog_last_claim');
    const currentStreak = parseInt(localStorage.getItem('mog_streak') || '0');
    const today = new Date().toDateString();

    if (lastClaim === today) {
      setClaimedToday(true);
      setStreak(currentStreak);
    } else {
      // Check if missed a day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastClaim === yesterday.toDateString()) {
        const nextStreak = currentStreak >= 7 ? 1 : currentStreak + 1;
        setStreak(nextStreak);
      } else {
        setStreak(1);
      }
    }
  }, []);

  const handleClaim = () => {
    const today = new Date().toDateString();
    localStorage.setItem('mog_last_claim', today);
    localStorage.setItem('mog_streak', streak.toString());
    setClaimedToday(true);
    
    const reward = REWARDS[streak - 1];
    
    // Give rewards
    if (reward.type === 'premium') {
      localStorage.setItem('mog_premium_ticket', 'true');
    } else if (reward.type === 'analysis') {
      localStorage.setItem('mog_analysis_ticket', 'true');
    }

    onClaim(reward);
    
    // Auto-close after 2 seconds
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-cyber-dark border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,255,157,0.15)] relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyber-neon/20 blur-[80px] rounded-full" />
        
        <div className="p-8 relative">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-2">
              {ru ? 'ЕЖЕДНЕВНЫЙ БОНУС' : 'DAILY REWARDS'}
            </h2>
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase opacity-60">
              {ru ? 'Заходи каждый день для супер-награды' : 'Login daily to unlock elite perks'}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-8">
            {REWARDS.map((item) => {
              const isCurrent = item.day === streak;
              const isPast = item.day < streak || (item.day === streak && claimedToday);
              
              return (
                <div 
                  key={item.day}
                  className={`relative aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all duration-500 ${
                    item.special ? 'col-span-2 aspect-auto h-full bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border-yellow-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 
                    isCurrent ? 'bg-cyber-neon/10 border-cyber-neon shadow-[0_0_15px_rgba(0,255,157,0.2)] scale-105 z-10' :
                    isPast ? 'bg-white/5 border-white/10 opacity-40' : 'bg-white/5 border-white/5'
                  }`}
                >
                  {isPast && (
                    <div className="absolute -top-1 -right-1 text-cyber-neon bg-black rounded-full">
                      <CheckCircle2 size={16} fill="currentColor" className="text-black" />
                    </div>
                  )}
                  
                  <div className={`mb-1 ${item.special ? 'text-yellow-400 scale-125 mb-2' : isCurrent ? 'text-cyber-neon' : 'text-gray-500'}`}>
                    {item.icon}
                  </div>
                  
                  <div className="text-[10px] font-black text-white/40 uppercase mb-0.5">
                    {ru ? `ДЕНЬ ${item.day}` : `DAY ${item.day}`}
                  </div>
                  
                  <div className={`text-[10px] text-center px-1 font-black leading-tight ${item.special ? 'text-yellow-500' : isCurrent ? 'text-white' : 'text-gray-600'}`}>
                    {item.type === 'points' ? `+${item.value}` : (ru ? (item.type === 'premium' ? 'SCAN' : 'PREMIUM') : item.label)}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleClaim}
            disabled={claimedToday}
            className={`w-full py-4 rounded-2xl font-black tracking-[0.2em] uppercase transition-all duration-300 ${
              claimedToday 
                ? 'bg-white/5 text-gray-500 border border-white/5 cursor-default'
                : 'bg-cyber-neon text-black shadow-[0_0_30px_rgba(0,255,157,0.4)] hover:scale-[1.02] active:scale-95'
            }`}
          >
            {claimedToday ? (ru ? 'ЗАБРАНО' : 'CLAIMED') : (ru ? 'ЗАБРАТЬ НАГРАДУ' : 'CLAIM REWARD')}
          </button>

          {!claimedToday && (
            <button 
              onClick={onClose}
              className="w-full mt-4 text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              {ru ? 'МОЖЕТ ПОЗЖЕ' : 'MAYBE LATER'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
