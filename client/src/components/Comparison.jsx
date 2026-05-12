import React from 'react';
import { Check, X, Shield, Zap, Target, Users } from 'lucide-react';
import LightPillar from './LightPillar';

export default function Comparison({ lang }) {
  const isRu = lang === 'ru';

  const features = [
    {
      name: isRu ? "ИИ Детекция" : "AI Face Detection",
      our: isRu ? "468-точечный 3D Mesh" : "468-Point 3D Mesh",
      others: isRu ? "68-точечные ориентиры" : "68-Point Landmarks",
      status: true
    },
    {
      name: isRu ? "Система Тиров (Рангов)" : "Tier Classification",
      our: isRu ? "8 Профессиональных уровней" : "8 Professional Tiers",
      others: isRu ? "6 Базовых уровней" : "6 Generic Tiers",
      status: true
    },
    {
      name: isRu ? "Количество метрик" : "Sub-Metric Breakdown",
      our: isRu ? "6+ Глубоких параметров" : "6+ Deep Metrics",
      others: isRu ? "5 Базовых метрик" : "5 Basic Metrics",
      status: true
    },
    {
      name: isRu ? "Режим Battle Arena (PvP)" : "Battle Arena (PvP Mode)",
      our: isRu ? "Да (Real-time 1v1)" : "Yes (Real-time 1v1)",
      others: isRu ? "Отсутствует" : "Not Available",
      status: true
    },
    {
      name: isRu ? "Анализ геометрии" : "Scan Visualization",
      our: isRu ? "Детальный 3D Скан" : "Detailed 3D Scan",
      others: isRu ? "Радарная диаграмма" : "Radar Chart",
      status: true
    },
    {
      name: isRu ? "История и Рейтинг" : "History & Leaderboards",
      our: isRu ? "Глобальная система ELO" : "Global ELO System",
      others: isRu ? "Отсутствует" : "None",
      status: true
    },
    {
      name: isRu ? "Мобильная поддержка" : "Mobile Support",
      our: isRu ? "Адаптивный Web-App" : "Responsive Web-App",
      others: isRu ? "Только браузер" : "Web only",
      status: true
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20">
        <LightPillar topColor="#00ff9d" bottomColor="#ff0055" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-16 animate-reveal">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyber-neon to-gray-500">
            {isRu ? 'Omogle.me vs Остальные' : 'Omogle.me vs Others'}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {isRu 
              ? 'Узнайте, почему профессиональные аналитики и ценители эстетики выбирают нашу платформу для самого точного анализа внешности.' 
              : 'Discover why professional analysts and aesthetic enthusiasts choose our platform for the most accurate facial analysis.'}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-reveal delay-100">
          <div className="grid grid-cols-3 bg-white/5 border-b border-white/10 p-8 font-black uppercase tracking-widest text-xs italic">
            <div className="text-gray-500">{isRu ? 'Возможности' : 'Features'}</div>
            <div className="text-cyber-neon text-center">Omogle.me</div>
            <div className="text-gray-500 text-center">{isRu ? 'Конкуренты' : 'Competitors'}</div>
          </div>

          <div className="divide-y divide-white/5">
            {features.map((f, i) => (
              <div key={i} className="grid grid-cols-3 p-8 items-center group hover:bg-white/[0.02] transition-colors">
                <div className="font-bold text-sm md:text-base pr-4">{f.name}</div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-cyber-neon/10 text-cyber-neon px-4 py-2 rounded-full text-xs md:text-sm font-black border border-cyber-neon/30">
                    <Check size={14} />
                    {f.our}
                  </div>
                </div>
                <div className="text-center text-gray-500 text-xs md:text-sm italic">
                  <div className="inline-flex items-center gap-2 opacity-50">
                    <X size={14} />
                    {f.others}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-reveal delay-200">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:border-cyber-neon/30 transition-all">
            <Target className="text-cyber-neon mb-4 w-10 h-10" />
            <h3 className="text-xl font-black uppercase mb-2 italic">{isRu ? 'Точность' : 'Precision'}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {isRu ? 'Мы используем 468-точечную сетку для анализа каждой микро-складки вашего лица.' : 'We use a 468-point mesh to analyze every micro-fold of your face.'}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:border-cyber-neon/30 transition-all">
            <Zap className="text-cyber-neon mb-4 w-10 h-10" />
            <h3 className="text-xl font-black uppercase mb-2 italic">{isRu ? 'Скорость' : 'Speed'}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {isRu ? 'Анализ происходит в реальном времени прямо в вашем браузере с использованием WebGL.' : 'Analysis happens in real-time directly in your browser using WebGL.'}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:border-cyber-neon/30 transition-all">
            <Shield className="text-cyber-neon mb-4 w-10 h-10" />
            <h3 className="text-xl font-black uppercase mb-2 italic">{isRu ? 'Защита' : 'Security'}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {isRu ? 'Ваши данные зашифрованы. Мы ценим вашу анонимность выше всего.' : 'Your data is encrypted. We value your anonymity above all else.'}
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-20 text-center">
          <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.5em] mb-8">
            {isRu ? 'Готовы узнать свой настоящий балл?' : 'Ready to discover your real score?'}
          </p>
          <a href="/" className="px-12 py-5 bg-cyber-neon text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,157,0.5)] transition-all">
            {isRu ? 'Начать битву' : 'Start Battle'}
          </a>
        </div>
      </div>
    </div>
  );
}
