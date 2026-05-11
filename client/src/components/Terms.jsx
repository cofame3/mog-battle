import React from 'react';
import { FileText, Shield, AlertCircle } from 'lucide-react';
import LightPillar from './LightPillar';

export default function Terms({ lang }) {
  const isRu = lang === 'ru';

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-20">
        <LightPillar topColor="#00ff9d" bottomColor="#000000" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8">
          <FileText className="text-cyber-neon w-10 h-10" />
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            {isRu ? 'Условия использования' : 'Terms of Use'}
          </h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-gray-300">
          <section>
            <h2 className="text-cyber-neon text-lg font-black uppercase mb-4 flex items-center gap-2">
              <Shield size={18} />
              1. {isRu ? 'Принятие условий' : 'Acceptance of Terms'}
            </h2>
            <p className="leading-relaxed">
              {isRu 
                ? "Добро пожаловать в Omogle. Используя наш веб-сайт и услуги, вы соглашаетесь соблюдать настоящие Условия использования. Если вы не согласны с какими-либо пунктами, пожалуйста, прекратите использование сервиса."
                : "Welcome to Omogle. By using our website and services, you agree to comply with these Terms of Use. If you do not agree with any of these points, please stop using the service."}
            </p>
          </section>

          <section>
            <h2 className="text-cyber-neon text-lg font-black uppercase mb-4 flex items-center gap-2">
              <Shield size={18} />
              2. {isRu ? 'Описание услуг' : 'Description of Services'}
            </h2>
            <p className="leading-relaxed">
              {isRu
                ? "Omogle предоставляет инструменты на базе искусственного интеллекта для анализа симметрии лица и эстетических характеристик. Сервис предоставляется исключительно в развлекательных целях. Мы не гарантируем точность результатов и не даем медицинских советов."
                : "Omogle provides AI-powered tools for facial symmetry and aesthetic analysis. The service is provided solely for entertainment purposes. We do not guarantee the accuracy of results and do not provide medical advice."}
            </p>
          </section>

          <section>
            <h2 className="text-cyber-neon text-lg font-black uppercase mb-4 flex items-center gap-2">
              <Shield size={18} />
              3. {isRu ? 'Возрастные ограничения' : 'Age Restrictions'}
            </h2>
            <p className="leading-relaxed">
              {isRu
                ? "Вы должны быть старше 18 лет для совершения любых покупок внутри сервиса. Пользователи младше 13 лет не допускаются к использованию платформы без контроля родителей или опекунов."
                : "You must be over 18 years old to make any in-service purchases. Users under 13 are not allowed to use the platform without parental or guardian supervision."}
            </p>
          </section>

          <section>
            <h2 className="text-cyber-neon text-lg font-black uppercase mb-4 flex items-center gap-2">
              <Shield size={18} />
              4. {isRu ? 'Пользовательский контент' : 'User Content'}
            </h2>
            <p className="leading-relaxed">
              {isRu
                ? "Вы несете полную ответственность за любые фотографии, которые вы загружаете. Запрещено загружать контент, содержащий наготу, насилие, незаконные материалы или нарушающий авторские права третьих лиц."
                : "You are solely responsible for any photos you upload. It is forbidden to upload content containing nudity, violence, illegal materials, or violating the copyrights of third parties."}
            </p>
          </section>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex gap-4">
            <AlertCircle className="text-red-500 shrink-0" size={24} />
            <p className="text-xs italic text-red-400/80">
              {isRu 
                ? "Внимание: Нарушение данных условий может привести к немедленной блокировке вашего аккаунта без возврата средств за приобретенные цифровые товары." 
                : "Warning: Violation of these terms may lead to the immediate blocking of your account without a refund for purchased digital goods."}
            </p>
          </div>
        </div>

        <div className="mt-20 text-center text-gray-500 text-[10px] font-mono uppercase tracking-[0.4em]">
          Omogle Protocol v1.0 / Updated: May 2026
        </div>
      </div>
    </div>
  );
}
