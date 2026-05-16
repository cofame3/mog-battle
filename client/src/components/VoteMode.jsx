import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Users, X, Zap, ChevronDown, TrendingUp, Trophy, Timer, MessageSquare } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

const FEED_MESSAGES = {
  ru: [
    "проголосовал за",
    "сделал выбор в пользу",
    "считает, что лучше",
    "отдал голос за",
    "выбрал аватарку"
  ],
  en: [
    "voted for",
    "picked",
    "prefers",
    "gave a vote to",
    "chose"
  ]
};

export default function VoteMode({ t, lang, onClose }) {
  const [pair, setPair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voted, setVoted] = useState(false);
  const [winner, setWinner] = useState(null);

  // Game Logic States
  const [streak, setStreak] = useState(0);
  const [agreement, setAgreement] = useState(null);
  const [votesLeft, setVotesLeft] = useState(999);
  const [cooldown, setCooldown] = useState(null);
  const [feedMsg, setFeedMsg] = useState("");
  const [userNames, setUserNames] = useState(["MogMaster", "AlphaMew", "Looksmaxxer", "JawlineKing"]);

  const feedInterval = useRef(null);
  const namesRef = useRef(userNames);

  useEffect(() => {
    namesRef.current = userNames;
  }, [userNames]);

  useEffect(() => {
    // Fetch real usernames for the feed
    fetch(`${SOCKET_URL}/api/users/names`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUserNames(data);
        }
      })
      .catch(err => console.error("Failed to fetch names", err));

    // Limit removed for better retention
    localStorage.removeItem('vote_limit_data');

    updateFeed();
    feedInterval.current = setInterval(updateFeed, 3000);
    return () => clearInterval(feedInterval.current);
  }, []);

  const updateFeed = () => {
    const names = namesRef.current;
    if (!names || names.length === 0) return;
    const name = names[Math.floor(Math.random() * names.length)];
    const messages = FEED_MESSAGES[lang] || FEED_MESSAGES.en;
    const msg = messages[Math.floor(Math.random() * messages.length)];
    const target = lang === 'ru' ? "участника" : "a participant";
    setFeedMsg(`${name} ${msg} ${target}`);
  };

  const checkAndUpdateLimit = () => {
    // Limits disabled
    return true;
  };

  const fetchPair = async () => {
    if (cooldown) return;
    setLoading(true);
    setError(null);
    setVoted(false);
    setWinner(null);
    setAgreement(null);
    try {
      const res = await fetch(`${SOCKET_URL}/api/vote/pair`);
      const data = await res.json();
      if (res.ok) {
        setPair(data);
      } else {
        setError(data.error || (lang === 'ru' ? 'Ошибка загрузки' : 'Load error'));
      }
    } catch (err) {
      setError(lang === 'ru' ? 'Ошибка соединения' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPair();
  }, [cooldown]);

  const handleVote = async (winnerKey) => {
    if (voted || !pair || cooldown) return;

    setVoted(true);
    setWinner(winnerKey);

    const loserKey = winnerKey === 'player1' ? 'player2' : 'player1';

    try {
      const res = await fetch(`${SOCKET_URL}/api/vote/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerUsername: pair[winnerKey].username,
          loserUsername: pair[loserKey].username
        })
      });
      const data = await res.json();

      if (data.success) {
        setAgreement(data.agreement);
        if (data.agreement > 50) {
          setStreak(s => s + 1);
        } else {
          setStreak(0);
        }
      }
    } catch (err) {
      console.error(err);
    }

    checkAndUpdateLimit();

    setTimeout(() => {
      if (votesLeft > 1) fetchPair();
    }, 1500);
  };

  const getCooldownTime = () => {
    if (!cooldown) return "";
    const diff = cooldown - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}${lang === 'ru' ? 'ч' : 'h'} ${mins}${lang === 'ru' ? 'м' : 'm'}`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex flex-col bg-black animate-reveal overflow-hidden overscroll-none">
      {/* Live Feed Header */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyber-neon to-transparent z-[2100]"></div>
      <div className="absolute top-1 inset-x-0 flex justify-center z-[2100]">
        <div className="bg-black/80 backdrop-blur-md px-4 py-1 rounded-b-lg border-x border-b border-white/10 flex items-center gap-2 animate-reveal">
          <MessageSquare size={12} className="text-cyber-neon" />
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{feedMsg}</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="relative z-[2010] flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-black/60 backdrop-blur-xl mt-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h2 className="text-sm md:text-xl font-black tracking-[0.2em] text-white uppercase">
              {lang === 'ru' ? 'АРЕНА ВЫБОРА' : 'CHOICE ARENA'}
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={12} className="text-cyber-neon" />
                <span className="text-[10px] font-black text-cyber-neon uppercase tracking-widest">Streak: {streak}</span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                <Timer size={12} className={votesLeft <= 1 ? "text-red-500" : "text-gray-400"} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${votesLeft <= 1 ? "text-red-500" : "text-gray-400"}`}>
                  {votesLeft} / 5
                </span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 border border-white/10 rounded-xl transition-all">
          <X size={20} className="text-gray-400 group-hover:text-red-500" />
        </button>
      </div>

      {/* Content Area */}
      <div className="relative flex-1 overflow-y-auto flex flex-col items-center">
        {cooldown ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-reveal">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
              <Timer className="text-red-500" size={48} />
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-widest mb-4">
              {lang === 'ru' ? 'ЛИМИТ ИСЧЕРПАН' : 'LIMIT REACHED'}
            </h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-8">
              {lang === 'ru' ? 'Твои 5 голосов потрачены.' : 'Your 5 votes are spent.'} <br />
              {lang === 'ru' ? 'Возвращайся через:' : 'Return in:'} <span className="text-red-500">{getCooldownTime()}</span>
            </p>
            <button onClick={onClose} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest hover:bg-white/10">
              {lang === 'ru' ? 'ВЕРНУТЬСЯ ПОЗЖЕ' : 'RETURN LATER'}
            </button>
          </div>
        ) : loading && !pair ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-cyber-neon/20 border-t-cyber-neon rounded-full animate-spin mb-6"></div>
            <div className="text-cyber-neon font-black tracking-widest animate-pulse uppercase">
              {lang === 'ru' ? 'ПОИСК КАНДИДАТОВ...' : 'SEARCHING...'}
            </div>
          </div>
        ) : pair ? (
          <div className="w-full max-w-6xl flex flex-col items-center py-10 px-4">

            <div className="text-center mb-12 animate-reveal">
              <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-[0.2em] drop-shadow-lg">
                {lang === 'ru' ? 'КТО ВЫГЛЯДИТ ЛУЧШЕ?' : 'WHO LOOKS BETTER?'}
              </h3>
              {streak > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 bg-cyber-neon/10 border border-cyber-neon/30 px-6 py-2 rounded-full animate-bounce">
                  <span className="text-cyber-neon font-black text-sm uppercase tracking-widest">COMBO STREAK x{streak}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-20 w-full justify-center items-center relative py-10">
              {['player1', 'player2'].map((pKey, idx) => {
                const player = pair[pKey];
                const isWinner = winner === pKey;
                const isLoser = voted && !isWinner;

                return (
                  <div
                    key={pKey}
                    onClick={() => handleVote(pKey)}
                    className={`relative group cursor-pointer transition-all duration-700 flex flex-col items-center w-full max-w-[360px] md:max-w-[480px]
                      ${voted && !isWinner ? 'scale-90 opacity-10 grayscale blur-sm pointer-events-none' : 'hover:scale-[1.03]'}
                      ${voted && isWinner ? 'scale-105 z-30' : ''}
                    `}
                  >
                    <div className={`relative w-full aspect-[3/4.5] rounded-[3rem] overflow-hidden border-[6px] bg-[#050505] transition-all duration-700
                      ${voted && isWinner ? 'border-cyber-neon shadow-[0_0_80px_rgba(0,255,157,0.4)]' : 'border-white/5'}
                    `}>
                      {player.avatarUrl ? (
                        <img 
                          src={player.avatarUrl.startsWith('http') ? player.avatarUrl : `${SOCKET_URL}${player.avatarUrl}`} 
                          alt={player.username} 
                          className="w-full h-full object-cover" 
                          style={{ imageRendering: 'high-quality' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black">
                          <Users size={64} className="text-gray-800" />
                        </div>
                      )}

                      {/* Win Rate Badge */}
                      <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                        <Trophy size={14} className="text-cyber-neon" />
                        <span className="text-xs font-black text-white">{player.winRate}% WR</span>
                      </div>

                      {/* Info Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                        <h4 className="text-2xl md:text-4xl font-black tracking-widest text-white uppercase truncate mb-4 drop-shadow-lg">
                          {player.username}
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2">
                            <Zap size={16} className="text-yellow-400" />
                            <span className="text-lg font-black text-yellow-400">{player.elo || 400}</span>
                          </div>
                        </div>
                      </div>

                      {/* Agreement Overlay */}
                      {voted && agreement !== null && (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm transition-opacity duration-500
                          ${isWinner ? 'bg-cyber-neon/20' : 'bg-black/60'}
                        `}>
                          <span className="text-6xl font-black text-white mb-2 drop-shadow-lg">
                            {isWinner ? agreement : 100 - agreement}%
                          </span>
                          <span className="text-xs font-black text-white/60 uppercase tracking-widest">
                            {lang === 'ru' ? 'СОГЛАСНЫ' : 'AGREED'}
                          </span>
                        </div>
                      )}
                    </div>

                    {voted && isWinner && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-reveal">
                        <div className="bg-cyber-neon text-black px-8 py-2.5 rounded-full font-black text-lg shadow-[0_0_40px_rgba(0,255,157,0.8)]">
                          WINNER
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-gray-500 text-xs font-black tracking-[0.4em] uppercase opacity-40 animate-pulse pb-20">
              {voted ? (lang === 'ru' ? 'ЗАГРУЗКА...' : 'LOADING...') : (lang === 'ru' ? 'ТВОЙ ГОЛОС ВЛИЯЕТ НА МИРОВОЙ РЕЙТИНГ' : 'YOUR VOTE CHANGES GLOBAL RANKING')}
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
