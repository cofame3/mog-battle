export const RANK_TIERS = [
  { name: 'SUB-3',    minElo: 0,    maxElo: 499,  color: 'text-red-900',     bg: 'bg-red-900/10',     border: 'border-red-900/50' },
  { name: 'SUB-5',    minElo: 500,  maxElo: 999,  color: 'text-gray-400',    bg: 'bg-gray-400/10',    border: 'border-gray-400/50' },
  { name: 'LTN',      minElo: 1000, maxElo: 1499, color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/50' },
  { name: 'MTN',      minElo: 1500, maxElo: 1999, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/50' },
  { name: 'HTN',      minElo: 2000, maxElo: 2499, color: 'text-cyan-400',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/50' },
  { name: 'CHADLITE', minElo: 2500, maxElo: 2999, color: 'text-yellow-300',  bg: 'bg-yellow-300/10',  border: 'border-yellow-300/50' },
  { name: 'CHAD',     minElo: 3000, maxElo: 3499, color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/50' },
  { name: 'HUNTER',   minElo: 3500, maxElo: Infinity, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/50' },
];

export const getMogRank = (elo) => {
  const score = elo || 400;
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (score >= RANK_TIERS[i].minElo) return RANK_TIERS[i];
  }
  return RANK_TIERS[0];
};
