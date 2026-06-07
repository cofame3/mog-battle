import React, { useState } from 'react';
import { Zap, User, Lock, LogIn, UserPlus, Eye, EyeOff, Camera, Shield, Trophy, Target, Cpu, Users, Scan, ChevronRight, Star } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import LightPillar from './LightPillar';

const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : `http://${window.location.hostname}:3001/api`;

export default function AuthForm({ onAuth, lang, t, onShowLegal }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRu = lang === 'ru';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (t.ru ? 'Ошибка' : 'Error'));
        setLoading(false);
        return;
      }

      // Сохранить токен и данные пользователя
      localStorage.setItem('mog_token', data.token);
      localStorage.setItem('mog_user', JSON.stringify({
        username: data.username,
        wins: data.wins || 0,
        losses: data.losses || 0,
        bestScore: data.bestScore || 0,
        elo: data.elo || 400,
        communityElo: data.communityElo || 400,
        avatarUrl: data.avatarUrl || '',
        lastNicknameChange: data.lastNicknameChange || null,
      }));

      onAuth({ username: data.username, wins: data.wins || 0, losses: data.losses || 0, bestScore: data.bestScore || 0, elo: data.elo || 400, communityElo: data.communityElo || 400, avatarUrl: data.avatarUrl || '', lastNicknameChange: data.lastNicknameChange || null });
    } catch (err) {
      setError(t.ru ? 'Сервер недоступен. Убедись, что server.js запущен.' : 'Server unavailable. Make sure server.js is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    const guestId = Math.floor(1000 + Math.random() * 9000);
    const guestName = `GUEST_${guestId}`;
    const guestData = {
      username: guestName,
      wins: 0,
      losses: 0,
      bestScore: 0,
      isGuest: true
    };

    localStorage.setItem('mog_user', JSON.stringify(guestData));
    // При гостевом входе mog_token не устанавливается
    onAuth(guestData);
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Google Auth Failed');
        return;
      }

      localStorage.setItem('mog_token', data.token);
      localStorage.setItem('mog_user', JSON.stringify({
        username: data.username,
        wins: data.wins || 0,
        losses: data.losses || 0,
        bestScore: data.bestScore || 0,
        avatarUrl: data.avatarUrl || '',
        lastNicknameChange: data.lastNicknameChange || null,
      }));

      onAuth(data);
    } catch (err) {
      setError('Google Login Error');
    } finally {
      setLoading(false);
    }
  };

  const howItWorks = [
    {
      step: '01',
      icon: <Camera className="w-8 h-8" />,
      title: isRu ? 'Сканирование' : 'Face Scan',
      desc: isRu
        ? 'Наша нейросеть строит 3D-карту вашего лица по 468 точкам, анализируя симметрию, пропорции, линию челюсти, угол наклона глаз и качество кожи в реальном времени.'
        : 'Our neural network builds a 3D map of your face using 468 landmark points, analyzing symmetry, proportions, jawline definition, canthal tilt, and skin quality in real time.'
    },
    {
      step: '02',
      icon: <Zap className="w-8 h-8" />,
      title: isRu ? 'Битва 1 на 1' : '1v1 Battle',
      desc: isRu
        ? 'Система подбирает вам оппонента по рейтингу ELO. В течение 10 секунд ИИ одновременно оценивает обоих участников и определяет победителя на основе совокупного балла.'
        : 'The matchmaking system pairs you with an opponent based on ELO rating. Over 10 seconds, the AI simultaneously evaluates both participants and determines the winner based on a composite score.'
    },
    {
      step: '03',
      icon: <Trophy className="w-8 h-8" />,
      title: isRu ? 'Рейтинг и Рост' : 'Rank & Grow',
      desc: isRu
        ? 'Побеждайте в батлах, поднимайтесь по глобальной таблице лидеров и отслеживайте свой прогресс. Используйте персональные рекомендации PSL-отчёта для улучшения результатов.'
        : 'Win battles, climb the global leaderboard, and track your progress over time. Use personalized PSL report recommendations to improve your scores between matches.'
    }
  ];

  const features = [
    {
      icon: <Scan className="w-6 h-6" />,
      title: isRu ? '468-точечный 3D анализ' : '468-Point 3D Analysis',
      desc: isRu
        ? 'Самая точная технология Face Mesh на основе TensorFlow. Алгоритм измеряет пропорции по золотому сечению, оценивает симметрию лица и анализирует геометрию каждой зоны.'
        : 'The most accurate Face Mesh technology powered by TensorFlow. The algorithm measures proportions against the golden ratio, evaluates facial symmetry, and analyzes the geometry of every zone.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: isRu ? 'Real-time PvP Арена' : 'Real-time PvP Arena',
      desc: isRu
        ? 'Соревнуйтесь с реальными людьми в режиме реального времени через WebRTC. Видео-чат и мгновенный анализ — всё происходит прямо в браузере без задержек.'
        : 'Compete against real people in real time via WebRTC. Video chat and instant AI analysis — everything happens directly in your browser with zero latency.'
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: isRu ? 'Система рейтинга ELO' : 'ELO Rating System',
      desc: isRu
        ? 'Профессиональная рейтинговая система, аналогичная шахматной. Ваш ELO растёт с победами и падает с поражениями. 8 уровней от Bronze до Ethereal отражают ваш прогресс.'
        : 'A professional rating system similar to chess. Your ELO rises with wins and falls with losses. 8 tiers from Bronze to Ethereal reflect your progress and standing.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: isRu ? 'Полная приватность' : 'Complete Privacy',
      desc: isRu
        ? 'Ваши фотографии никогда не сохраняются на сервере. Весь анализ выполняется локально в браузере через WebGL. Мы не храним и не передаём ваши изображения третьим лицам.'
        : 'Your photos are never stored on our servers. All analysis runs locally in your browser via WebGL. We do not store or share your images with any third parties.'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: isRu ? 'PSL отчёт и рекомендации' : 'PSL Report & Advice',
      desc: isRu
        ? 'Получите детальный отчёт по каждому параметру: симметрия, челюсть, глаза, нос, кожа. Каждый параметр сопровождается персональными рекомендациями по улучшению.'
        : 'Get a detailed breakdown of every parameter: symmetry, jawline, eyes, nose, and skin. Each metric comes with personalized recommendations for improvement.'
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: isRu ? 'Голосование сообщества' : 'Community Voting',
      desc: isRu
        ? 'Помимо ИИ-оценки, пользователи голосуют за лучших. Рейтинг сообщества формирует отдельную таблицу лидеров, отражающую объективное мнение реальных людей.'
        : 'Beyond AI scoring, users vote for the best. Community rating creates a separate leaderboard that reflects the objective opinion of real people.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black z-0 pointer-events-none">
        <LightPillar
          topColor="#00ff9d"
          bottomColor="#ff0055"
          intensity={1.0}
          rotationSpeed={0.3}
          glowAmount={0.005}
          pillarWidth={3.0}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={0}
          interactive={false}
          mixBlendMode="screen"
        />
      </div>

      {/* Animated grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,255,157,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,157,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center pt-16 pb-12 px-4 text-center">
        <div className="animate-reveal">
          <img src="/logo.jpg" alt="Omogle Logo" className="w-28 h-28 mx-auto mb-6 drop-shadow-[0_0_25px_rgba(0,255,157,0.5)] object-cover rounded-[1.8rem]" />
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white via-cyber-neon to-gray-400 mb-4 leading-tight">
            {isRu ? 'ИИ-Анализ Внешности и Mog Battle Арена' : 'AI Face Rating & Mog Battle Arena'}
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            {isRu
              ? 'Omogle — платформа нового поколения для соревновательного анализа внешности. Наша нейросеть анализирует 468 точек вашего лица, рассчитывает эстетический рейтинг и позволяет соревноваться с реальными людьми в режиме реального времени.'
              : 'Omogle is the next-generation platform for competitive face analysis. Our neural network analyzes 468 points of your face, calculates an aesthetic rating, and lets you compete against real people in real-time video battles.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#join" className="px-8 py-4 bg-cyber-neon text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(0,255,157,0.5)] hover:scale-105 transition-all">
              {isRu ? 'Начать бесплатно' : 'Start Free'}
            </a>
            <a href="#how-it-works" className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all">
              {isRu ? 'Как это работает' : 'How It Works'}
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-cyber-neon text-[10px] font-black uppercase tracking-[0.4em] mb-3">
            {isRu ? 'Процесс' : 'The Process'}
          </p>
          <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white">
            {isRu ? 'Как работает Omogle' : 'How Omogle Works'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {howItWorks.map((item, idx) => (
            <div key={idx} className="group bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 hover:border-cyber-neon/30 transition-all duration-500">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-cyber-neon font-mono text-xs font-bold opacity-60">{item.step}</span>
                <div className="text-cyber-neon">{item.icon}</div>
              </div>
              <h3 className="text-xl font-black uppercase italic mb-3 text-white">{item.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FEATURES */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-cyber-neon text-[10px] font-black uppercase tracking-[0.4em] mb-3">
            {isRu ? 'Возможности' : 'Features'}
          </p>
          <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white">
            {isRu ? 'Почему выбирают Omogle' : 'Why Choose Omogle'}
          </h2>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto text-base leading-relaxed">
            {isRu
              ? 'Мы объединили передовой ИИ-анализ с соревновательным геймплеем, чтобы создать единственную в своём роде платформу для объективной оценки эстетики лица.'
              : 'We combined cutting-edge AI analysis with competitive gameplay to build a one-of-a-kind platform for objective facial aesthetics evaluation.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => (
            <div key={idx} className="bg-black/60 border border-white/10 rounded-2xl p-6 hover:border-cyber-neon/20 hover:bg-black/40 transition-all duration-300">
              <div className="text-cyber-neon mb-4">{f.icon}</div>
              <h3 className="text-lg font-black uppercase italic mb-2 text-white">{f.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* WHAT IS MOG BATTLE - SEO Content Block */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10">
          <h2 className="text-2xl md:text-3xl font-black uppercase italic mb-6 text-white">
            {isRu ? 'Что такое Mog Battle?' : 'What is a Mog Battle?'}
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed text-base">
            <p>
              {isRu
                ? 'Mog Battle — это формат соревнования, в котором два человека сравниваются по эстетическим параметрам лица. Термин «mog» (от «mogging») означает превосходство во внешности. В контексте нашей платформы, это объективный и честный способ узнать, как ваше лицо оценивается алгоритмами компьютерного зрения.'
                : 'A Mog Battle is a competition format where two people are compared on facial aesthetic parameters. The term "mog" (from "mogging") refers to surpassing someone in appearance. In the context of our platform, it is an objective and fair way to see how your face is evaluated by computer vision algorithms.'}
            </p>
            <p>
              {isRu
                ? 'Omogle использует технологию TensorFlow Face Mesh для построения 3D-сетки из 468 ключевых точек лица. Алгоритм измеряет расстояния между точками, рассчитывает углы и пропорции, а затем сравнивает результаты с эталонами эстетической гармонии — такими как золотое сечение (1.618) и идеальные пропорции лица.'
                : 'Omogle uses TensorFlow Face Mesh technology to build a 3D mesh of 468 facial keypoints. The algorithm measures distances between points, calculates angles and proportions, then compares results against standards of aesthetic harmony — such as the golden ratio (1.618) and ideal facial proportions.'}
            </p>
            <p>
              {isRu
                ? 'В отличие от простых фильтров красоты, наш анализ основан на антропометрических данных и принципах эстетической медицины. Оценка включает шесть ключевых категорий: симметрия лица, структура челюсти, форма и наклон глаз (canthal tilt), пропорции носа и состояние кожи.'
                : 'Unlike simple beauty filters, our analysis is based on anthropometric data and principles of aesthetic medicine. The assessment covers six key categories: facial symmetry, jawline structure, eye shape and canthal tilt, nose proportions, and skin condition.'}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* WHAT IS LOOKSMAXXING */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10">
          <h2 className="text-2xl md:text-3xl font-black uppercase italic mb-6 text-white">
            {isRu ? 'Что такое Looksmaxxing?' : 'What is Looksmaxxing?'}
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed text-base">
            <p>
              {isRu
                ? 'Looksmaxxing — это систематический подход к улучшению внешности, основанный на научных принципах. Он включает уход за кожей, корректировку осанки, упражнения для лица (мьюинг), правильное питание и физическую форму. Цель — максимально раскрыть свой естественный потенциал.'
                : 'Looksmaxxing is a systematic approach to improving appearance based on scientific principles. It includes skincare routines, posture correction, facial exercises (mewing), proper nutrition, and fitness. The goal is to maximize your natural potential.'}
            </p>
            <p>
              {isRu
                ? 'На Omogle вы можете отслеживать свой прогресс в лукмаксинге с помощью объективных метрик ИИ. Проходите регулярные сканирования, сравнивайте результаты и используйте персональные рекомендации из PSL-отчёта для достижения лучших результатов.'
                : 'On Omogle, you can track your looksmaxxing progress using objective AI metrics. Take regular scans, compare results over time, and use personalized recommendations from PSL reports to achieve better outcomes.'}
            </p>
            <p>
              {isRu
                ? 'Наша платформа поддерживает несколько режимов: Соло-тест для личного анализа, Батл 1 на 1 для соревнования с другими, загрузка фото для офлайн-анализа и голосование сообщества для получения мнения реальных людей.'
                : 'Our platform supports multiple modes: Solo Test for personal analysis, 1v1 Battle for competing with others, Photo Upload for offline analysis, and Community Voting to get opinions from real people.'}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LOGIN / REGISTER FORM */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="join" className="relative z-10 flex flex-col items-center justify-center p-4 py-12 w-full">
        <div className="text-center mb-8">
          <p className="text-cyber-neon text-[10px] font-black uppercase tracking-[0.4em] mb-3">
            {isRu ? 'Присоединяйтесь' : 'Join Now'}
          </p>
          <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white">
            {isRu ? 'Начните прямо сейчас' : 'Get Started Today'}
          </h2>
        </div>

        <div className="w-full max-w-md bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-reveal">
          {/* Tabs */}
          <div className="flex mb-6 border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 font-bold tracking-widest text-sm uppercase transition-all flex items-center justify-center gap-2 ${mode === 'login'
                ? 'bg-cyber-neon text-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <LogIn size={16} />
              {t.login}
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 font-bold tracking-widest text-sm uppercase transition-all flex items-center justify-center gap-2 ${mode === 'register'
                ? 'bg-cyber-neon text-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <UserPlus size={16} />
              {t.register}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={t.username}
                maxLength={20}
                autoComplete="username"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-white font-mono tracking-widest focus:border-cyber-neon focus:outline-none transition-colors placeholder-gray-600 uppercase"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.password}
                maxLength={50}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 pl-10 pr-10 text-white font-mono tracking-widest focus:border-cyber-neon focus:outline-none transition-colors placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl px-4 py-2.5 text-red-400 text-xs font-bold tracking-wide">
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-cyber-neon text-black hover:shadow-[0_0_25px_rgba(0,255,157,0.5)] hover:bg-white active:scale-[0.98]"
            >
              {loading ? (
                <span className="animate-pulse">{t.loading}</span>
              ) : mode === 'login' ? (
                t.loginBtn
              ) : (
                t.registerBtn
              )}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink-0 mx-4 text-gray-600 text-[10px] font-bold tracking-[0.3em] uppercase">{t.or}</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <button
              type="button"
              onClick={handleGuest}
              className="w-full py-2.5 rounded-xl font-bold uppercase tracking-widest border border-white/10 text-gray-400 hover:border-cyber-accent hover:text-white hover:bg-cyber-accent/5 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {t.guestBtn}
            </button>
            <p className="text-[8px] text-center text-gray-600 mt-1 tracking-widest uppercase italic leading-tight">
              {t.guestWarning}
            </p>

            <div className="mt-3 flex flex-col items-center gap-2">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="filled_black"
                shape="pill"
                text="continue_with"
                width="280"
              />
              <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase opacity-60">
                {isRu ? 'Продолжая, вы принимаете' : 'By joining, you agree to our'}{' '}
                <button
                  type="button"
                  onClick={onShowLegal}
                  className="text-cyber-neon/80 hover:text-cyber-neon hover:underline transition-colors"
                >
                  Terms of Use
                </button>
              </p>
            </div>
          </form>

          {/* Guest hint */}
          <p className="text-center text-gray-600 text-[10px] mt-4 tracking-wider opacity-50">
            {isRu ? 'Данные хранятся на сервере · JWT авторизация' : 'Data stored on server · JWT authorization'}
          </p>
        </div>
      </section>
    </div>
  );
}
