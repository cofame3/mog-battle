import React from 'react';
import { BookOpen, Droplets, Scissors, Dumbbell, Star, ChevronRight, Zap } from 'lucide-react';
import LightPillar from './LightPillar';

export default function Guide({ lang }) {
  const isRu = lang === 'ru';

  const sections = [
    {
      icon: <Droplets className="text-blue-400" />,
      title: isRu ? "Уход за кожей (Skin Care)" : "Skincare Routine",
      points: isRu ? [
        "Очищение: Используйте мягкое средство утром и вечером, чтобы убрать загрязнения.",
        "Увлажнение: Важно для любого типа кожи, помогает сохранить эластичность и здоровый блеск.",
        "SPF: Защита от солнца — критический фактор против морщин и пигментации.",
        "Пилинг: Используйте кислоты (AHA/BHA) 1-2 раза в неделю для обновления кожи."
      ] : [
        "Cleansing: Use a gentle face wash twice daily to remove pollutants and oil.",
        "Moisturizing: Essential for skin elasticity and a healthy, vibrant glow.",
        "Sun Protection: SPF is your best defense against premature aging and spots.",
        "Exfoliation: Use chemical exfoliants (AHA/BHA) weekly for skin renewal."
      ]
    },
    {
      icon: <Dumbbell className="text-cyber-neon" />,
      title: isRu ? "Челюсть и Осанка" : "Jawline & Posture",
      points: isRu ? [
        "Осанка шеи: Исправьте наклон головы вперед, чтобы подтянуть линию подбородка.",
        "Мьюинг (Mewing): Постоянное давление языка на нёбо расширяет челюсть со временем.",
        "Жевание: Жесткая пища или специальные тренажеры развивают жевательные мышцы.",
        "Снижение жира: Лицо становится рельефным при проценте жира ниже 12-15%."
      ] : [
        "Neck Posture: Fix forward head posture to tighten your jawline naturally.",
        "Mewing: Keeping the tongue on the roof of the mouth helps expand the palate.",
        "Chewing: Harder foods or gum can help develop masseter muscles for a wider look.",
        "Leanness: Low body fat (below 15%) is required for visible bone structure."
      ]
    },
    {
      icon: <Scissors className="text-cyber-accent" />,
      title: isRu ? "Груминг и Волосы" : "Grooming & Hair",
      points: isRu ? [
        "Линия роста волос: Подбирайте стрижку, которая скрывает недостатки и подчеркивает скулы.",
        "Брови: Охотничий взгляд (Hunter Eyes) часто зависит от низкой и густой посадки бровей.",
        "Уход за бородой: Борода может визуально удлинить подбородок или скрыть слабую челюсть.",
        "Гигиена: Чистота волос и правильный шампунь — база вашего имиджа."
      ] : [
        "Hairline: Choose a cut that complements your forehead and cheekbones.",
        "Eyebrows: A 'hunter' look is enhanced by low-set, thick, and straight eyebrows.",
        "Beard Fraudding: Use facial hair to create an illusion of a stronger chin.",
        "Hair Health: Healthy, voluminous hair is a primary indicator of high vitality."
      ]
    },
    {
      icon: <Zap className="text-yellow-400" />,
      title: isRu ? "Взгляд и Мимика" : "Eyes & Expression",
      points: isRu ? [
        "Сквинтинг (Squinting): Легкое прищуривание нижних век делает взгляд более уверенным.",
        "Темные круги: Сон и холодные компрессы помогут убрать усталость под глазами.",
        "Улыбка глазами: Учитесь выражать эмоции глазами, сохраняя челюсть расслабленной.",
        "Визуальный контакт: Уверенный взгляд — это 50% вашей привлекательности."
      ] : [
        "Squinting: Slightly tensing the lower lids creates a more dominant 'hunter' look.",
        "Dark Circles: Sleep and hydration are key to maintaining a fresh eye area.",
        "Eye Contact: Holding a steady, calm gaze signals high status and confidence.",
        "Relaxed Face: Avoid excessive frowning to prevent permanent tension lines."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-20">
        <LightPillar topColor="#00ff9d" bottomColor="#ff0055" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-reveal">
          <div className="inline-flex items-center gap-2 bg-cyber-neon/10 text-cyber-neon px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-cyber-neon/30 mb-6">
            <Zap size={12} className="animate-pulse" />
            SEO Optimized Guide
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            {isRu ? 'Гайд по внешности' : 'Looksmaxxing Guide'}
          </h1>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            {isRu 
              ? 'Ваше пошаговое руководство по улучшению эстетики лица и достижению максимального потенциала привлекательности.' 
              : 'Your step-by-step roadmap to enhancing facial aesthetics and reaching your peak attractiveness potential.'}
          </p>
        </div>

        {/* Introduction Block */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 mb-12 animate-reveal delay-100">
          <h2 className="text-2xl font-black uppercase italic mb-6 flex items-center gap-3">
            <BookOpen className="text-cyber-neon" />
            {isRu ? 'Что такое Looksmaxxing?' : 'What is Looksmaxxing?'}
          </h2>
          <div className="space-y-4 text-gray-400 leading-relaxed text-base">
            <p>
              {isRu 
                ? "Это процесс максимизации ваших естественных данных через уход, спорт и правильные привычки. Наш ИИ-анализ помогает выявить зоны роста, а этот гайд дает инструменты для действий."
                : "It is the process of maximizing your natural features through grooming, fitness, and better habits. Our AI analysis helps identify areas for growth, and this guide provides the tools for action."}
            </p>
            <p>
              {isRu
                ? "В основе лежит понимание анатомии: симметрии, структуры костей и качества кожи. Даже небольшие изменения в осанке или режиме ухода могут поднять ваш PSL-балл на новый уровень."
                : "It starts with understanding facial anatomy: symmetry, bone structure, and skin quality. Even minor changes in posture or skincare can elevate your PSL score to the next level."}
            </p>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 gap-6 animate-reveal delay-200">
          {sections.map((section, idx) => (
            <div key={idx} className="group bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:border-cyber-neon/30 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                  {section.icon}
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight">{section.title}</h3>
              </div>
              <ul className="space-y-4">
                {section.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                    <ChevronRight className="text-cyber-neon flex-shrink-0 mt-1" size={16} />
                    <span className="text-base">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-20 bg-gradient-to-br from-cyber-accent/20 to-transparent border border-white/5 rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <Star className="text-yellow-400 mx-auto mb-6 w-12 h-12 animate-spin-slow" />
            <h2 className="text-3xl font-black uppercase italic mb-4">
              {isRu ? 'Готовы проверить результат?' : 'Ready to test the results?'}
            </h2>
            <p className="text-gray-400 mb-10 max-w-md mx-auto">
              {isRu 
                ? 'Примените советы на практике и пройдите повторный ИИ-анализ через 30 дней.' 
                : 'Put these tips into practice and take a follow-up AI analysis in 30 days.'}
            </p>
            <a href="/" className="inline-block px-10 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-cyber-neon hover:scale-105 transition-all shadow-2xl">
              {isRu ? 'Пройти тест заново' : 'Retake Analysis'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
