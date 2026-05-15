import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, Scan, Gift, X, Star } from 'lucide-react';

const REWARDS_POOL = [
  { id: 'p10', type: 'points', value: 10, icon: <Zap size={24} />, label: '10 POINTS', color: 'text-gray-400', border: 'border-gray-600', bg: 'bg-gray-600/10', weight: 40 },
  { id: 'p50', type: 'points', value: 50, icon: <Star size={24} />, label: '50 POINTS', color: 'text-blue-400', border: 'border-blue-600', bg: 'bg-blue-600/10', weight: 30 },
  { id: 'p100', type: 'points', value: 100, icon: <Trophy size={24} />, label: '100 POINTS', color: 'text-purple-400', border: 'border-purple-600', bg: 'bg-purple-600/10', weight: 15 },
  { id: 's1', type: 'premium', value: 1, icon: <Scan size={24} />, label: '1 PSL SCAN', color: 'text-cyber-neon', border: 'border-cyber-neon', bg: 'bg-cyber-neon/10', weight: 10 },
  { id: 's3', type: 'premium', value: 3, icon: <Scan size={24} className="text-yellow-400" />, label: '3 PSL SCANS', color: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10', weight: 4 },
  { id: 'prem', type: 'analysis', value: 1, icon: <Gift size={24} />, label: 'PREMIUM', color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500/10', weight: 1 },
];

export default function Roulette({ onClaim, onClose, lang }) {
  const [claimedToday, setClaimedToday] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [tape, setTape] = useState([]);
  const [winningReward, setWinningReward] = useState(null);
  const tapeRef = useRef(null);
  const ru = lang === 'ru';

  const ITEM_WIDTH = 120; // Width of each roulette item including gap

  useEffect(() => {
    const lastClaim = localStorage.getItem('mog_last_roulette');
    const today = new Date().toDateString();

    if (lastClaim === today) {
      setClaimedToday(true);
    }
    
    generateTape();
  }, []);

  const getRandomReward = () => {
    const totalWeight = REWARDS_POOL.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    for (const reward of REWARDS_POOL) {
      if (random < reward.weight) return reward;
      random -= reward.weight;
    }
    return REWARDS_POOL[0];
  };

  const generateTape = (winner = null) => {
    const newTape = [];
    const TAPE_LENGTH = 50;
    const WIN_INDEX = 40;

    for (let i = 0; i < TAPE_LENGTH; i++) {
      if (winner && i === WIN_INDEX) {
        newTape.push(winner);
      } else {
        newTape.push(getRandomReward());
      }
    }
    setTape(newTape);
    return { newTape, winIndex: WIN_INDEX };
  };

  const spin = () => {
    if (claimedToday || isSpinning) return;
    
    setIsSpinning(true);
    setShowResult(false);
    
    const winner = getRandomReward();
    setWinningReward(winner);
    
    const { winIndex } = generateTape(winner);

    setTimeout(() => {
      if (tapeRef.current) {
        const containerWidth = tapeRef.current.parentElement.offsetWidth;
        const tapePadding = window.innerWidth / 2;
        const randomOffset = Math.floor(Math.random() * (ITEM_WIDTH - 20)) - (ITEM_WIDTH / 2 - 10);
        
        const targetCenter = tapePadding + (winIndex * ITEM_WIDTH) + (ITEM_WIDTH / 2);
        const translate = targetCenter - (containerWidth / 2) + randomOffset;
        
        tapeRef.current.style.transition = 'transform 5s cubic-bezier(0.1, 0.8, 0.1, 1)';
        tapeRef.current.style.transform = `translateX(-${translate}px)`;
      }
    }, 100);

    setTimeout(() => {
      setIsSpinning(false);
      setShowResult(true);
      handleClaimFinal(winner);
    }, 5500);
  };

  const handleClaimFinal = (reward) => {
    const today = new Date().toDateString();
    localStorage.setItem('mog_last_roulette', today);
    setClaimedToday(true);
    
    if (reward.type === 'premium') {
      const current = parseInt(localStorage.getItem('mog_scans_balance') || '0');
      localStorage.setItem('mog_scans_balance', (current + reward.value).toString());
    } else if (reward.type === 'points') {
      const current = parseInt(localStorage.getItem('mog_points_balance') || '0');
      localStorage.setItem('mog_points_balance', (current + reward.value).toString());
    }

    onClaim(reward);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-cyber-dark border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,255,157,0.15)] relative">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 text-gray-500 hover:text-white transition-colors"
          disabled={isSpinning}
        >
          <X size={24} />
        </button>

        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyber-neon/20 blur-[80px] rounded-full" />
        
        <div className="p-8 relative">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-2">
              {ru ? 'ЕЖЕДНЕВНАЯ РУЛЕТКА' : 'DAILY ROULETTE'}
            </h2>
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase opacity-60">
              {ru ? 'Испытай удачу раз в день' : 'Test your luck once a day'}
            </p>
          </div>

          <div className="relative w-full h-32 bg-black/50 border-y border-white/10 overflow-hidden mb-8 shadow-inner flex items-center">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-cyber-neon z-20 -translate-x-1/2 shadow-[0_0_10px_rgba(0,255,157,1)]" />
            
            <div 
              ref={tapeRef}
              className="flex items-center gap-2 px-[50vw] absolute"
              style={{ transform: 'translateX(0px)', transition: 'none' }}
            >
              {tape.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex-shrink-0 w-[112px] h-[100px] border-2 rounded-xl flex flex-col items-center justify-center ${item.bg} ${item.border}`}
                >
                  <div className={`mb-2 ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className={`text-[10px] font-black text-center px-1 uppercase ${item.color}`}>
                    {ru && item.type === 'premium' ? item.label.replace('PSL SCAN', 'СКАН') : item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[80px]">
            {showResult && winningReward ? (
              <div className="text-center animate-fadeIn scale-110 mb-4">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{ru ? 'ВЫ ВЫИГРАЛИ:' : 'YOU WON:'}</span>
                <div className={`text-2xl font-black uppercase mt-1 ${winningReward.color} drop-shadow-md flex items-center justify-center gap-2`}>
                  {winningReward.icon} 
                  {ru && winningReward.type === 'premium' ? winningReward.label.replace('PSL SCAN', 'СКАН') : winningReward.label}
                </div>
              </div>
            ) : null}

            {!showResult && (
              <button
                onClick={spin}
                disabled={claimedToday || isSpinning}
                className={`w-full py-4 rounded-2xl font-black tracking-[0.2em] uppercase transition-all duration-300 ${
                  claimedToday || isSpinning
                    ? 'bg-white/5 text-gray-500 border border-white/5 cursor-default'
                    : 'bg-cyber-neon text-black shadow-[0_0_30px_rgba(0,255,157,0.4)] hover:scale-[1.02] active:scale-95'
                }`}
              >
                {claimedToday ? (ru ? 'ДОСТУПНО ЗАВТРА' : 'AVAILABLE TOMORROW') : isSpinning ? (ru ? 'КРУТИМ...' : 'SPINNING...') : (ru ? 'КРУТИТЬ РУЛЕТКУ' : 'SPIN ROULETTE')}
              </button>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
