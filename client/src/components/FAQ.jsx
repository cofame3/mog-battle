import React from 'react';
import { HelpCircle, Shield, Zap, Info } from 'lucide-react';
import LightPillar from './LightPillar';

export default function FAQ({ lang }) {
  const isRu = lang === 'ru';

  const faqs = [
    {
      q: isRu ? "Как ИИ оценивает мое лицо?" : "How does AI evaluate my face?",
      a: isRu 
        ? "Мы используем технологию Face Mesh для построения высокоточной 3D-сетки вашего лица. Алгоритм анализирует более 468 точек, измеряя симметрию, пропорции (золотое сечение), линию челюсти, наклон глаз (canthal tilt) и другие параметры, которые в совокупности определяют эстетический рейтинг."
        : "We use Face Mesh technology to build a high-precision 3D mesh of your face. The algorithm analyzes over 468 points, measuring symmetry, proportions (golden ratio), jawline, canthal tilt, and other parameters that collectively determine the aesthetic rating."
    },
    {
      q: isRu ? "Это анонимно?" : "Is it anonymous?",
      a: isRu
        ? "Да. Ваши фотографии обрабатываются в режиме реального времени. Мы не сохраняем ваши изображения на сервере без вашего явного разрешения (например, для установки аватара профиля). Ваши данные для анализа удаляются сразу после завершения сессии."
        : "Yes. Your photos are processed in real-time. We do not store your images on our servers without your explicit permission (e.g., for setting a profile avatar). Your analysis data is deleted immediately after the session ends."
    },
    {
      q: isRu ? "Как работает Battle Arena?" : "How does Battle Arena work?",
      a: isRu
        ? "Battle Arena — это PvP режим, где вы соревнуетесь с другими пользователями. Система подбирает вам оппонента, после чего ИИ одновременно оценивает обоих участников. Тот, чей рейтинг выше, забирает победу и повышает свой ELO-рейтинг."
        : "Battle Arena is a PvP mode where you compete with other users. The system matches you with an opponent, after which the AI simultaneously evaluates both participants. The one with the higher rating takes the win and increases their ELO rating."
    },
    {
      q: isRu ? "Что такое PSL-отчет?" : "What is a PSL Report?",
      a: isRu
        ? "PSL Report — это расширенный анализ вашей внешности, который включает подробные метрики каждого параметра лица, сравнение со средними значениями и персональные рекомендации по улучшению эстетики (looksmaxxing)."
        : "PSL Report is an advanced analysis of your appearance that includes detailed metrics for each facial parameter, comparison with average values, and personalized recommendations for improving aesthetics (looksmaxxing)."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-30">
        <LightPillar topColor="#00ff9d" bottomColor="#ff0055" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-cyber-neon/20 p-3 rounded-2xl border border-cyber-neon/50">
            <HelpCircle className="text-cyber-neon w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              {isRu ? 'Вопросы и ответы' : 'Questions & Answers'}
            </h1>
            <p className="text-cyber-neon text-xs font-bold tracking-[0.3em] uppercase opacity-70">
              Mog-Battle Protocol v1.0 / FAQ
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 hover:border-cyber-neon/30 transition-all duration-500">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span className="text-cyber-neon font-mono text-sm">0{idx + 1}.</span>
                {faq.q}
              </h3>
              <p className="text-gray-400 leading-relaxed pl-8 border-l-2 border-white/5 group-hover:border-cyber-neon/20 transition-colors">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-cyber-neon/10 to-transparent border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-black uppercase italic mb-2">
              {isRu ? 'Остались вопросы?' : 'Still have questions?'}
            </h2>
            <p className="text-gray-400 text-sm italic">
              {isRu ? 'Наша команда AI-аналитиков готова помочь вам.' : 'Our AI analysts team is ready to help you.'}
            </p>
          </div>
          <a href="mailto:support@omogle.me" className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-cyber-neon hover:scale-105 transition-all shadow-xl">
            {isRu ? 'Связаться' : 'Contact Us'}
          </a>
        </div>
      </div>
    </div>
  );
}
