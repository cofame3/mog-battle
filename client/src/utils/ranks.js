export const getMogRank = (elo) => {
  const score = elo || 400; // По умолчанию 400, если нет данных
  
  if (score >= 2301) return { name: 'HUNTER', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/50' };
  if (score >= 2001) return { name: 'CHAD', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/50' };
  if (score >= 1701) return { name: 'CHADLITE', color: 'text-yellow-300', bg: 'bg-yellow-300/10', border: 'border-yellow-300/50' };
  if (score >= 1401) return { name: 'HTN', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/50' };
  if (score >= 1101) return { name: 'MTN', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/50' };
  if (score >= 801) return { name: 'LTN', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/50' };
  if (score >= 501) return { name: 'SUB-5', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/50' };
  
  return { name: 'SUB-3', color: 'text-red-900', bg: 'bg-red-900/10', border: 'border-red-900/50' };
};
