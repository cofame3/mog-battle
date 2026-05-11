import React from 'react';
import { X, Shield, FileText, RefreshCw } from 'lucide-react';

export default function LegalModal({ onClose, lang }) {
  const isRu = lang === 'ru';

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cyber-panel border border-cyber-border rounded-xl w-full max-w-2xl max-h-[85vh] relative overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,255,157,0.15)]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-cyber-border bg-black/40">
          <div className="flex items-center gap-3">
            <Shield className="text-cyber-neon" size={24} />
            <h2 className="text-xl font-black text-white tracking-widest uppercase">
              {isRu ? 'Юридическая информация' : 'Legal Information'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar font-sans text-gray-300 leading-relaxed">
          
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-cyber-neon border-b border-cyber-neon/20 pb-2">
              <FileText size={18} />
              <h3 className="font-black uppercase tracking-wider">{isRu ? 'Условия использования' : 'Terms of Use'}</h3>
            </div>
            <div className="text-sm space-y-3 opacity-80">
              <p>
                {isRu 
                  ? 'Добро пожаловать в Mog-Battle. Используя наш сервис, вы соглашаетесь со следующими условиями:' 
                  : 'Welcome to Mog-Battle. By using our service, you agree to the following terms:'}
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{isRu ? 'Сервис предоставляется "как есть". Мы не несем ответственности за точность AI-анализа.' : 'Service is provided "as is". We are not responsible for the accuracy of AI analysis.'}</li>
                <li>{isRu ? 'Вам должно быть не менее 18 лет для использования функций оплаты.' : 'You must be at least 18 years old to use payment features.'}</li>
                <li>{isRu ? 'Запрещено загружать контент, нарушающий права третьих лиц или закон.' : 'Uploading content that violates third-party rights or the law is prohibited.'}</li>
                <li>{isRu ? 'Мы оставляем за собой право блокировать аккаунты за попытки злоупотребления системой.' : 'We reserve the right to block accounts for attempts to abuse the system.'}</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-cyber-accent border-b border-cyber-accent/20 pb-2">
              <Shield size={18} />
              <h3 className="font-black uppercase tracking-wider">{isRu ? 'Политика конфиденциальности' : 'Privacy Policy'}</h3>
            </div>
            <div className="text-sm space-y-3 opacity-80">
              <p>
                {isRu 
                  ? 'Ваша приватность важна для нас. Мы собираем только необходимые данные:' 
                  : 'Your privacy is important to us. We collect only necessary data:'}
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{isRu ? 'Мы не сохраняем ваши фотографии в базах данных без вашего согласия (кроме аватарок профиля).' : 'We do not store your photos in databases without your consent (except profile avatars).'}</li>
                <li>{isRu ? 'Фотографии для анализа обрабатываются "на лету" и не используются для обучения сторонних AI.' : 'Photos for analysis are processed "on the fly" and are not used for training third-party AIs.'}</li>
                <li>{isRu ? 'Ваш Email (при входе через Google) используется только для идентификации аккаунта.' : 'Your Email (when logging in via Google) is used only for account identification.'}</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-500 border-b border-yellow-500/20 pb-2">
              <RefreshCw size={18} />
              <h3 className="font-black uppercase tracking-wider">{isRu ? 'Политика возврата' : 'Refund Policy'}</h3>
            </div>
            <div className="text-sm space-y-3 opacity-80">
              <p>
                {isRu 
                  ? 'Поскольку Mog-Battle предоставляет цифровые услуги (AI-токены), которые активируются мгновенно:' 
                  : 'Since Mog-Battle provides digital services (AI tokens) that are activated instantly:'}
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{isRu ? 'Возврат средств за использованные токены не производится.' : 'Refunds for used tokens are not provided.'}</li>
                <li>{isRu ? 'В случае технических ошибок при оплате, пожалуйста, свяжитесь с поддержкой.' : 'In case of technical errors during payment, please contact support.'}</li>
                <li>{isRu ? 'Оспаривание транзакций через PayPal без предварительного обращения к нам приведет к блокировке аккаунта.' : 'Disputing transactions through PayPal without contacting us first will result in account suspension.'}</li>
              </ul>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-cyber-border bg-black/20 text-center">
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            © 2026 MOG-BATTLE PROTOCOL. ALL RIGHTS RESERVED.
          </p>
        </div>

      </div>
    </div>
  );
}
