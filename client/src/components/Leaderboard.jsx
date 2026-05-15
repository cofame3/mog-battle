import React, { useState, useEffect } from 'react';
import { Trophy, X, Medal } from 'lucide-react';
import { getMogRank } from '../utils/ranks';

const SOCKET_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export default function Leaderboard({ t, onClose, currentUser }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rankType, setRankType] = useState('arena'); // 'arena' or 'community'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${SOCKET_URL}/api/leaderboard?type=${rankType}`);
        if (res.ok) {
          const data = await res.json();
          setLeaders(data);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [rankType]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-reveal">
      <div className="relative w-full max-w-lg bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex flex-col p-4 border-b border-white/5 bg-black/40 rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className={rankType === 'arena' ? "text-cyber-neon" : "text-cyber-accent"} size={24} />
              <h2 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-cyber-accent uppercase">
                {rankType === 'arena' ? (t.leaderboard || "РЕЙТИНГ АРЕНЫ") : (t.communityChoice || "ВЫБОР ОБЩЕСТВА")}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setRankType('arena')}
              className={`flex-1 py-2 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all ${rankType === 'arena' ? 'bg-cyber-neon text-black shadow-[0_0_15px_rgba(0,255,157,0.4)]' : 'text-gray-400 hover:text-white'}`}
            >
              Arena 1v1
            </button>
            <button
              onClick={() => setRankType('community')}
              className={`flex-1 py-2 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all ${rankType === 'community' ? 'bg-cyber-accent text-white shadow-[0_0_15px_rgba(255,0,85,0.4)]' : 'text-gray-400 hover:text-white'}`}
            >
              Community
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="text-center py-8 text-cyber-neon font-bold tracking-widest animate-pulse">
              {t.loadingLeaderboard}
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-bold tracking-widest">
              NO DATA
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Пьедестал для Топ-3 */}
              {leaders.length > 0 && (
                <div className="flex justify-center items-end gap-2 md:gap-4 mb-4 mt-2 px-2">
                  {/* 2 место */}
                  {leaders.length > 1 && (
                    <div className="flex flex-col items-center animate-reveal w-[90px] md:w-[120px]" style={{ animationDelay: '0.1s' }}>
                      <div className="text-gray-300 mb-2 drop-shadow-[0_0_10px_rgba(209,213,219,1)]"><Medal size={32} /></div>
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-gray-300 overflow-hidden bg-black mb-2 shadow-[0_0_20px_rgba(209,213,219,0.5)]">
                        {leaders[1].avatarUrl ? (
                          <img src={leaders[1].avatarUrl.startsWith('http') ? leaders[1].avatarUrl : `${SOCKET_URL}${leaders[1].avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                        )}
                      </div>
                      <div className="text-xs font-black tracking-widest text-white truncate w-full text-center px-1">{leaders[1].username}</div>
                      <div className={`text-[10px] font-bold ${rankType === 'arena' ? 'text-yellow-500' : 'text-cyber-accent'} drop-shadow-md`}>
                        {rankType === 'arena' ? '⚡' : '✨'} {rankType === 'arena' ? (leaders[1].elo || 400) : (leaders[1].communityElo || 400)}
                      </div>
                      {rankType === 'arena' && (
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-tighter mt-0.5">
                          {leaders[1].wins || 0}W - {leaders[1].losses || 0}L
                        </div>
                      )}
                      <div className={`w-full h-24 md:h-28 bg-gradient-to-t ${rankType === 'arena' ? 'from-gray-300/40' : 'from-cyber-accent/20'} to-transparent border-t-2 border-x border-x-white/10 border-gray-300 mt-2 rounded-t-lg flex items-start justify-center pt-2 shadow-[0_0_20px_rgba(209,213,219,0.3)]`}>
                        <span className="text-gray-300 font-black text-2xl drop-shadow-md">2</span>
                      </div>
                    </div>
                  )}

                  {/* 1 место */}
                  <div className="flex flex-col items-center animate-reveal relative z-10 w-[110px] md:w-[150px]" style={{ animationDelay: '0s' }}>
                    <div className={`absolute inset-0 ${rankType === 'arena' ? 'bg-yellow-400/5' : 'bg-cyber-accent/10'} blur-3xl -z-10 rounded-full animate-pulse`}></div>

                    {/* Sparkles SVG */}
                    <svg viewBox="0 0 100 100" className={`absolute -top-4 -left-2 w-5 h-5 ${rankType === 'arena' ? 'text-yellow-400' : 'text-cyber-accent'} animate-sparkle drop-shadow-[0_0_5px_currentColor]`} style={{ animationDelay: '0.2s', fill: 'currentColor' }}>
                      <path d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z" />
                    </svg>
                    <svg viewBox="0 0 100 100" className="absolute top-10 -right-4 w-7 h-7 text-white animate-sparkle drop-shadow-[0_0_5px_white]" style={{ animationDelay: '0.8s', fill: 'currentColor' }}>
                      <path d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z" />
                    </svg>

                    <div className={`${rankType === 'arena' ? 'text-yellow-400' : 'text-cyber-accent'} mb-2 drop-shadow-[0_0_20px_currentColor] animate-bounce`}><Trophy size={42} /></div>
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 ${rankType === 'arena' ? 'border-yellow-400' : 'border-cyber-accent'} overflow-hidden bg-black mb-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]`}>
                      {leaders[0].avatarUrl ? (
                        <img src={leaders[0].avatarUrl.startsWith('http') ? leaders[0].avatarUrl : `${SOCKET_URL}${leaders[0].avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                      )}
                    </div>
                    <div className="text-sm font-black tracking-widest text-white truncate w-full text-center px-1 drop-shadow-md">{leaders[0].username}</div>
                    <div className={`text-xs font-black ${rankType === 'arena' ? 'text-yellow-500' : 'text-cyber-accent'} drop-shadow-md`}>
                      {rankType === 'arena' ? '⚡' : '✨'} {rankType === 'arena' ? (leaders[0].elo || 400) : (leaders[0].communityElo || 400)}
                    </div>
                    {rankType === 'arena' && (
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-1">
                        {leaders[0].wins || 0}W - {leaders[0].losses || 0}L
                      </div>
                    )}
                    <div className={`w-full h-32 md:h-36 bg-gradient-to-t ${rankType === 'arena' ? 'from-yellow-400/50' : 'from-cyber-accent/40'} to-transparent border-t-4 border-x border-x-white/10 ${rankType === 'arena' ? 'border-yellow-400' : 'border-cyber-accent'} mt-2 rounded-t-xl flex items-start justify-center pt-2 shadow-[0_0_35px_rgba(255,255,255,0.1)] animate-pulse`}>
                      <span className={`${rankType === 'arena' ? 'text-yellow-400' : 'text-white'} font-black text-4xl drop-shadow-lg`}>1</span>
                    </div>
                  </div>

                  {/* 3 место */}
                  {leaders.length > 2 && (
                    <div className="flex flex-col items-center animate-reveal w-[80px] md:w-[110px]" style={{ animationDelay: '0.2s' }}>
                      <div className="text-amber-600 mb-2 drop-shadow-[0_0_10px_rgba(217,119,6,1)]"><Medal size={26} /></div>
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-amber-600 overflow-hidden bg-black mb-2 shadow-[0_0_20px_rgba(217,119,6,0.5)]">
                        {leaders[2].avatarUrl ? (
                          <img src={leaders[2].avatarUrl.startsWith('http') ? leaders[2].avatarUrl : `${SOCKET_URL}${leaders[2].avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                        )}
                      </div>
                      <div className="text-[10px] font-black tracking-widest text-white truncate w-full text-center px-1">{leaders[2].username}</div>
                      <div className={`text-[9px] font-bold ${rankType === 'arena' ? 'text-yellow-500' : 'text-cyber-accent'} drop-shadow-md`}>
                        {rankType === 'arena' ? '⚡' : '✨'} {rankType === 'arena' ? (leaders[2].elo || 400) : (leaders[2].communityElo || 400)}
                      </div>
                      {rankType === 'arena' && (
                        <div className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">
                          {leaders[2].wins || 0}W - {leaders[2].losses || 0}L
                        </div>
                      )}
                      <div className={`w-full h-20 md:h-24 bg-gradient-to-t ${rankType === 'arena' ? 'from-amber-600/40' : 'from-cyber-accent/20'} to-transparent border-t-2 border-x border-x-white/10 border-amber-600 mt-2 rounded-t-lg flex items-start justify-center pt-2 shadow-[0_0_20px_rgba(217,119,6,0.3)]`}>
                        <span className="text-amber-600 font-black text-xl drop-shadow-md">3</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Остальные игроки (начиная с 4-го места) */}
              <div className="space-y-2 mt-2">
                {leaders.slice(3).map((player, index) => {
                  const actualRank = index + 3;
                  const isCurrentUser = currentUser && player.username === currentUser.username;
                  const currentElo = rankType === 'arena' ? (player.elo || 400) : (player.communityElo || 400);
                  const rank = getMogRank(currentElo);

                  return (
                    <div
                      key={actualRank}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all animate-reveal ${isCurrentUser
                        ? `bg-white/5 ${rankType === 'arena' ? 'border-cyber-neon/50' : 'border-cyber-accent/50'} shadow-[0_0_15px_rgba(255,255,255,0.05)]`
                        : 'bg-black/20 border-white/5 hover:border-white/20'
                        }`}
                      style={{ animationDelay: `${(index + 3) * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-black w-6 text-center text-gray-500 text-xs">
                          #{actualRank + 1}
                        </div>

                        {/* Аватар */}
                        <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                          {player.avatarUrl ? (
                            <img
                              src={player.avatarUrl.startsWith('http') ? player.avatarUrl : `${SOCKET_URL}${player.avatarUrl}`}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <div className={`font-bold tracking-widest text-sm ${isCurrentUser ? (rankType === 'arena' ? 'text-cyber-neon' : 'text-cyber-accent') : 'text-white'}`}>
                            {player.username}
                          </div>
                          <div className={`text-[9px] font-black tracking-tighter px-1.5 py-0.5 rounded border inline-block w-fit mt-1 ${rank.color} ${rank.bg} ${rank.border}`}>
                            {rank.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">ELO / W-L</span>
                          <span className={`font-black ${rankType === 'arena' ? 'text-yellow-500' : 'text-cyber-accent'} drop-shadow-md`}>
                            {rankType === 'arena' ? '⚡' : '✨'} {currentElo}
                            {rankType === 'arena' && (
                              <span className="text-gray-500 text-[10px] ml-2 font-bold">
                                ({player.wins || 0}W-{player.losses || 0}L)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
