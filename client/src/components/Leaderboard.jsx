import React, { useState, useEffect } from 'react';
import { Trophy, X, Medal } from 'lucide-react';
import { getMogRank } from '../utils/ranks';

const SOCKET_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export default function Leaderboard({ t, onClose, currentUser }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${SOCKET_URL}/api/leaderboard`);
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
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-reveal">
      <div className="relative w-full max-w-lg bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/40 rounded-t-xl">
          <div className="flex items-center gap-2">
            < Trophy className="text-cyber-accent" size={24} />
            <h2 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon to-cyber-accent">
              {t.leaderboard}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
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
            leaders.map((player, index) => {
              const isCurrentUser = currentUser && player.username === currentUser.username;
              const rank = getMogRank(player.elo || 400);

              // Top 3 medals
              let rankColor = "text-gray-500";
              if (index === 0) rankColor = "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]";
              else if (index === 1) rankColor = "text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.8)]";
              else if (index === 2) rankColor = "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)]";

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isCurrentUser
                    ? 'bg-white/5 border-cyber-neon/50 shadow-[0_0_15px_rgba(0,255,157,0.2)]'
                    : 'bg-black/20 border-white/5 hover:border-white/20'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`font-black w-6 text-center ${rankColor}`}>
                      {index < 3 ? <Medal size={20} className="mx-auto" /> : `#${index + 1}`}
                    </div>

                    {/* Аватар */}
                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                      {player.avatarUrl ? (
                        <img
                          src={`${SOCKET_URL}${player.avatarUrl}`}
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
                      <div className={`font-bold tracking-widest text-sm ${isCurrentUser ? 'text-cyber-neon' : 'text-white'}`}>
                        {player.username}
                        {isCurrentUser && <span className="ml-2 text-[8px] bg-cyber-neon text-black px-1 rounded uppercase font-black">You</span>}
                      </div>
                      <div className={`text-[9px] font-black tracking-tighter px-1.5 py-0.5 rounded border inline-block w-fit mt-1 ${rank.color} ${rank.bg} ${rank.border}`}>
                        {rank.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold tracking-wider">ELO</span>
                      <span className="font-black text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                        ⚡ {player.elo || 400}
                      </span>
                    </div>
                    <div className="flex flex-col w-12 border-l border-white/5 pl-3">
                      <span className="text-[10px] text-gray-500 font-bold tracking-wider">W / L</span>
                      <span className="font-bold text-gray-300 text-sm">
                        <span className="text-green-400">{player.wins}</span><span className="text-gray-600">/</span><span className="text-red-400">{player.losses}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
