import React from 'react';
import { ShieldCheck, EyeOff, Lock, Database, Info } from 'lucide-react';
import LightPillar from './LightPillar';

export default function Privacy({ lang }) {
  const isRu = lang === 'ru';

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-20">
        <LightPillar topColor="#ff0055" bottomColor="#000000" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8">
          <ShieldCheck className="text-cyber-accent w-10 h-10" />
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            {isRu ? 'Политика конфиденциальности' : 'Privacy Policy'}
          </h1>
        </div>

        <div className="space-y-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
              <EyeOff className="text-cyber-neon mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">{isRu ? 'Никакого хранения фото' : 'No Photo Storage'}</h3>
              <p className="text-sm text-gray-400">
                {isRu 
                  ? "Ваши фотографии для анализа обрабатываются локально или в оперативной памяти сервера без записи на жесткий диск. Мы не создаем базы данных лиц."
                  : "Your analysis photos are processed locally or in the server's RAM without being written to the hard drive. We do not create facial databases."}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
              <Lock className="text-cyber-accent mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">{isRu ? 'Защита данных' : 'Data Protection'}</h3>
              <p className="text-sm text-gray-400">
                {isRu
                  ? "Все соединения защищены 256-битным SSL шифрованием. Доступ к вашему профилю защищен JWT-токенами."
                  : "All connections are protected by 256-bit SSL encryption. Access to your profile is secured by JWT tokens."}
              </p>
            </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic border-l-4 border-cyber-accent pl-4">
              {isRu ? 'Какие данные мы собираем?' : 'What data do we collect?'}
            </h2>
            <div className="space-y-4 text-gray-300">
              <div className="flex gap-4 items-start">
                <Database className="text-gray-500 mt-1 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-white mb-1">{isRu ? 'Аккаунт и профиль' : 'Account & Profile'}</h4>
                  <p className="text-sm">
                    {isRu 
                      ? "Имя пользователя, хэшированный пароль и статистика побед/поражений. Если вы используете Google Login, мы получаем ваш email для аутентификации."
                      : "Username, hashed password, and win/loss statistics. If you use Google Login, we receive your email for authentication."}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Info className="text-gray-500 mt-1 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-white mb-1">{isRu ? 'Технические данные' : 'Technical Data'}</h4>
                  <p className="text-sm">
                    {isRu 
                      ? "IP-адрес (для предотвращения спама), тип браузера и файлы Cookies для сохранения сессии."
                      : "IP address (for spam prevention), browser type, and Cookies for session persistence."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-cyber-accent/5 border border-cyber-accent/20 rounded-[2rem] p-8">
            <h3 className="text-lg font-bold mb-4">{isRu ? 'Третьи стороны' : 'Third Parties'}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {isRu
                ? "Мы интегрируем PayPal для обработки платежей и Google OAuth для авторизации. Эти сервисы имеют свои собственные политики конфиденциальности. Мы не продаем и не передаем ваши личные данные рекламным сетям."
                : "We integrate PayPal for payment processing and Google OAuth for authorization. These services have their own privacy policies. We do not sell or share your personal data with advertising networks."}
            </p>
          </section>
        </div>

        <div className="mt-20 text-center text-gray-500 text-[10px] font-mono uppercase tracking-[0.4em]">
          Omogle Privacy Protocol / Updated: May 2026
        </div>
      </div>
    </div>
  );
}
