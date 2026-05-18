import React from 'react';
import { HelpCircle, Shield, Zap, Info } from 'lucide-react';
import LightPillar from './LightPillar';

export default function FAQ({ lang }) {
  const isRu = lang === 'ru';

  const faqs = [
    {
      q: isRu ? "Как ИИ оценивает мое лицо на Omogle?" : "How does Omogle AI evaluate my face?",
      a: isRu
        ? "Мы используем технологию Face Mesh для построения высокоточной 3D-сетки вашего лица. Алгоритм анализирует более 468 точек, измеряя симметрию, пропорции (золотое сечение), линию челюсти, наклон глаз (canthal tilt) и другие параметры, которые в совокупности определяют эстетический рейтинг. Это самая точная система для Looksmaxxing анализа."
        : "We use Face Mesh technology to build a high-precision 3D mesh of your face. The algorithm analyzes over 468 points, measuring symmetry, proportions (golden ratio), jawline, canthal tilt, and other parameters that collectively determine the aesthetic rating. It is the most accurate system for Looksmaxxing analysis."
    },
    {
      q: isRu ? "Почему Omogle называют лучшей альтернативой Ommoggle?" : "Why is Omogle called the best Ommoggle alternative?",
      a: isRu
        ? "Omogle (или ommoggle) предлагает уникальный опыт, объединяющий случайный видеочат и соревновательный рейтинг внешности. В отличие от простых чатов, наша платформа дает объективную оценку вашего прогресса в уходе за собой и позволяет соревноваться с реальными людьми в Battle Arena."
        : "Omogle (or ommoggle) offers a unique experience combining random video chat and competitive looks rating. Unlike simple chats, our platform provides an objective assessment of your self-care progress and allows you to compete with real people in the Battle Arena."
    },
    {
      q: isRu ? "Это анонимно и безопасно?" : "Is it anonymous and safe?",
      a: isRu
        ? "Да. Ваши фотографии обрабатываются в режиме реального времени с помощью WebGL. Мы не сохраняем ваши изображения на сервере без вашего разрешения. Ваши данные для анализа удаляются сразу после завершения сессии. Мы ценим приватность нашего комьюнити."
        : "Yes. Your photos are processed in real-time using WebGL. We do not store your images on our servers without your permission. Your analysis data is deleted immediately after the session ends. We value the privacy of our community."
    },
    {
      q: isRu ? "Как работает Battle Arena 1v1?" : "How does the 1v1 Battle Arena work?",
      a: isRu
        ? "Battle Arena — это PvP режим, где вы соревнуетесь с другими пользователями. Система подбирает вам оппонента, после чего ИИ одновременно оценивает обоих участников. Тот, чей рейтинг выше, забирает победу и повышает свой ELO-рейтинг. Это лучший способ проверить свой 'Mog' уровень."
        : "Battle Arena is a PvP mode where you compete with other users. The system matches you with an opponent, after which the AI simultaneously evaluates both participants. The one with the higher rating takes the win and increases their ELO rating. It's the best way to test your 'Mog' level."
    },
    {
      q: isRu ? "Что такое PSL-отчет и как его получить?" : "What is a PSL Report and how to get it?",
      a: isRu
        ? "PSL Report — это расширенный анализ вашей внешности. Он включает подробные метрики каждого параметра лица, сравнение со средними значениями по нашей базе данных и персональные рекомендации по улучшению эстетики. Отчет доступен после прохождения сканирования в личном кабинете."
        : "PSL Report is an advanced analysis of your appearance. It includes detailed metrics for each facial parameter, comparison with average values in our database, and personalized recommendations for improving aesthetics. The report is available after completing a scan in your profile."
    },
    {
      q: isRu ? "Помогают ли ваши советы по Looksmaxxing?" : "Do your Looksmaxxing tips actually work?",
      a: isRu
        ? "Наши гайды основаны на принципах эстетической медицины и антропометрии. Советы по мьюингу, осанке и уходу за кожей — это проверенные методы улучшения визуальной привлекательности. Регулярный анализ на Omogle поможет вам отслеживать изменения."
        : "Our guides are based on principles of aesthetic medicine and anthropometry. Tips on mewing, posture, and skincare are proven methods for improving visual appeal. Regular analysis on Omogle will help you track your transformation."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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

        {/* Pro Tips Section */}
        <div className="mt-20">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="text-cyber-neon w-6 h-6 animate-pulse" />
            <h2 className="text-2xl font-black uppercase tracking-widest italic">
              {isRu ? 'Как получить высший балл?' : 'How to Maximize Your Score?'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: isRu ? "Ракурс" : "Angle",
                desc: isRu ? "Держите телефон на уровне глаз. Снимок строго в анфас исключает искажение пропорций." : "Keep your device at eye level. A straight-on shot prevents facial proportion distortion."
              },
              {
                title: isRu ? "Свет" : "Lighting",
                desc: isRu ? "Естественный дневной свет — ваш лучший друг. Избегайте ламп сверху, создающих глубокие тени." : "Natural daylight is key. Avoid harsh overhead lights that create deep, unflattering shadows."
              },
              {
                title: isRu ? "Мимика" : "Expression",
                desc: isRu ? "Расслабьте лицо. Нейтральный взгляд или очень легкая улыбка дают самый точный результат." : "Relax your face. A neutral look or a very subtle smile produces the most reliable analysis."
              },
              {
                title: isRu ? "Фон" : "Background",
                desc: isRu ? "Используйте пустую стену. Лишние предметы в кадре могут сбивать алгоритмы детекции." : "Stand against a plain wall. Cluttered backgrounds can interfere with the AI detection accuracy."
              },
              {
                title: isRu ? "Видимость" : "Visibility",
                desc: isRu ? "Уберите волосы со лба и челюсти. Эти зоны критически важны для расчета эстетического рейтинга." : "Ensure your hair doesn't hide your jaw or forehead. These areas are vital for the rating calculation."
              },
              {
                title: isRu ? "Честность" : "Authenticity",
                desc: isRu ? "Никаких фильтров и очков. ИИ должен видеть вашу реальную структуру лица для честной оценки." : "No filters or sunglasses. The AI needs to analyze your actual facial structure for an honest result."
              }
            ].map((tip, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <h4 className="text-cyber-neon font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyber-neon rounded-full" />
                  {tip.title}
                </h4>
                <p className="text-gray-400 text-sm leading-snug">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
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
