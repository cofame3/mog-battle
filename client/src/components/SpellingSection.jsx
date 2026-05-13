import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function SpellingSection({ lang }) {
  const isRu = lang === 'ru';

  const spellings = [
    {
      term: "omogle",
      desc: isRu
        ? "Основное написание, которое приведёт вас прямо к нам."
        : "The main spelling that brings you straight to us."
    },
    {
      term: "ommoggle",
      desc: isRu
        ? "Частая вариация — вы всё равно попадёте в нужное место."
        : "A common variation — you'll still end up in the right place."
    },
    {
      term: "ommogle",
      desc: isRu
        ? "Ещё один популярный вариант для того же видеочата."
        : "Another popular spelling for the same video chat app."
    },
    {
      term: "ommoggle omoggle",
      desc: isRu
        ? "Комбинированный поисковый запрос для проверки названия."
        : "A combined search phrase people use to find the app."
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 border-t border-white/5 bg-white/[0.01]">
      <div className="max-w-5xl mx-auto px-6 text-center">
        {/* Headline section centered */}
        <div className="space-y-6 max-w-3xl mx-auto mb-16">
          <p className="text-cyber-neon text-[10px] font-black uppercase tracking-[0.4em]">
            {isRu ? 'Название' : 'The Name'}
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1]">
            {isRu
              ? <>Как бы вы ни написали,<br />Omogle — это то, что вы искали.</>
              : <>However you spell it, Omogle is the app.</>}
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mx-auto">
            {isRu
              ? "Люди попадают сюда через разные варианты написания. Omogle — это название приложения, и мы подключаем все популярные запросы, чтобы те, кто набирает omogle, ommoggle или ommoggle omoggle, всегда попадали куда нужно."
              : "People arrive here through a few spellings. Omogle is the name of the app, and we keep the common searches connected so visitors who type omogle, ommoggle, or ommoggle omoggle still get where they meant to go."}
          </p>
        </div>

        {/* Spelling cards centered in a 2x2 or 4x1 grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {spellings.map((item) => (
            <div
              key={item.term}
              className="group bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-cyber-neon/30 hover:bg-white/[0.05] transition-all duration-300 cursor-default text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-cyber-neon font-mono font-bold text-sm tracking-wide">
                  {item.term}
                </span>
                <ArrowRight size={14} className="text-cyber-neon opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-gray-500 text-[10px] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
