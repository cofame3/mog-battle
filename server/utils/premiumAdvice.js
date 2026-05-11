function generatePremiumAdvice(analysis, lang) {
  if (!analysis) return null;
  
  const isRu = lang === 'ru';
  const sections = [];

  // ═══════════════════════════════════════════════
  // SECTION 1: OVERVIEW & RATING
  // ═══════════════════════════════════════════════
  const overallTier = analysis.total >= 90 ? (isRu ? 'CHAD — Топ 1%' : 'CHAD — Top 1%')
    : analysis.total >= 80 ? (isRu ? 'CHADLITE — Топ 5%' : 'CHADLITE — Top 5%')
    : analysis.total >= 72 ? (isRu ? 'HTN — Выше среднего' : 'HTN — Above Average')
    : analysis.total >= 65 ? (isRu ? 'MTN — Средний' : 'MTN — Average')
    : analysis.total >= 55 ? (isRu ? 'LTN — Ниже среднего' : 'LTN — Below Average')
    : isRu ? 'Нужна работа' : 'Needs Work';

  sections.push({
    icon: '🏆',
    title: isRu ? 'ОБЩАЯ ОЦЕНКА' : 'OVERALL RATING',
    content: isRu
      ? `Твой рейтинг: ${analysis.total}/100 (${overallTier}). Ниже — персональный план улучшений на основе AI-анализа твоей структуры лица.`
      : `Your rating: ${analysis.total}/100 (${overallTier}). Below is a personalized improvement plan based on AI analysis of your facial structure.`
  });

  // ═══════════════════════════════════════════════
  // SECTION 2: SYMMETRY
  // ═══════════════════════════════════════════════
  let symAdvice, symExercises;
  if (analysis.symmetry < 50) {
    symAdvice = isRu
      ? 'Заметная асимметрия лица. Это может быть вызвано привычкой спать на одном боку, жеванием на одной стороне или неправильной осанкой шеи.'
      : 'Noticeable facial asymmetry. This can be caused by sleeping on one side, chewing on one side, or poor neck posture.';
    symExercises = isRu ? [
      '🛏️ Спи на спине (используй ортопедическую подушку)',
      '🦷 Жуй равномерно на обеих сторонах минимум 2 недели',
      '💆 Массаж Гуа-ша: 5 минут в день, от центра лица к вискам',
      '🧘 Упражнение «Ротация шеи»: медленные круговые движения 10 раз в каждую сторону',
    ] : [
      '🛏️ Sleep on your back (use an orthopedic pillow)',
      '🦷 Chew evenly on both sides for at least 2 weeks',
      '💆 Gua Sha massage: 5 min daily, from center of face outward',
      '🧘 Neck rotation exercise: slow circles, 10 reps each direction',
    ];
  } else if (analysis.symmetry < 75) {
    symAdvice = isRu
      ? 'Хорошая симметрия с незначительными отклонениями. Мелкие асимметрии можно скорректировать упражнениями и привычками.'
      : 'Good symmetry with minor deviations. Small asymmetries can be corrected with exercises and habits.';
    symExercises = isRu ? [
      '💆 Массаж Гуа-ша через день по 3-5 минут',
      '🧊 Утренний лёд: прикладывай кубики льда к лицу 30 сек для тонуса',
      '🪥 Следи за осанкой: подбородок параллелен полу',
    ] : [
      '💆 Gua Sha massage every other day, 3-5 minutes',
      '🧊 Morning ice: apply ice cubes to face for 30 sec for muscle tone',
      '🪥 Watch your posture: chin parallel to the ground',
    ];
  } else {
    symAdvice = isRu
      ? 'Отличная симметрия! Это один из ключевых факторов привлекательности. Продолжай поддерживать.'
      : 'Excellent symmetry! This is a key attractiveness factor. Keep maintaining it.';
    symExercises = isRu ? [
      '✅ Поддерживай текущие привычки',
      '💤 Не менее 7-8 часов сна для предотвращения отеков',
    ] : [
      '✅ Maintain your current habits',
      '💤 Get 7-8 hours of sleep to prevent puffiness',
    ];
  }

  sections.push({
    icon: '⚖️',
    title: isRu ? 'СИММЕТРИЯ' : 'SYMMETRY',
    score: `${analysis.symmetry}/100`,
    content: symAdvice,
    exercises: symExercises,
  });

  // ═══════════════════════════════════════════════
  // SECTION 3: JAWLINE
  // ═══════════════════════════════════════════════
  let jawAdvice, jawExercises;
  if (analysis.jawline < 50) {
    jawAdvice = isRu
      ? 'Слабо выраженная линия челюсти. Это главная зона для улучшения — даже небольшие изменения дадут заметный результат.'
      : 'Weak jawline definition. This is your main area for improvement — even small changes will give noticeable results.';
    jawExercises = isRu ? [
      '👅 Mewing: Прижми ВЕСЬ язык к нёбу (не только кончик). Держи 24/7. Результат через 3-6 месяцев.',
      '🏋️ Жевательный тренажёр (Jawzrsize или мастичная смола): 15 мин/день, через день',
      '🍽️ Снизь % жира до 12-15% — челюсть становится видна при низком BF%',
      '💧 Пей 2-3 литра воды, избегай соли перед сном (отёки скрывают челюсть)',
      '🧊 Cold exposure: Ледяные умывания утром для подтяжки кожи',
    ] : [
      '👅 Mewing: Press your ENTIRE tongue against the palate (not just the tip). Hold 24/7. Results in 3-6 months.',
      '🏋️ Jaw trainer (Jawzrsize or mastic gum): 15 min/day, every other day',
      '🍽️ Lower body fat to 12-15% — jawline becomes visible at low BF%',
      '💧 Drink 2-3L of water, avoid salt before bed (bloating hides jawline)',
      '🧊 Cold exposure: Ice-cold face wash in the morning for skin tightening',
    ];
  } else if (analysis.jawline < 75) {
    jawAdvice = isRu
      ? 'Челюсть заметна, но ей не хватает чёткости и угловатости. Ты в хорошей стартовой позиции для быстрого прогресса.'
      : 'Jawline is visible but lacks sharpness and angularity. You are in a great starting position for fast progress.';
    jawExercises = isRu ? [
      '👅 Mewing: Убедись, что задняя часть языка прижата к нёбу',
      '🏋️ Мастичная смола: жуй 10-15 мин через день для массетеров',
      '🍽️ Целевой BF%: 12-14% для максимальной видимости челюсти',
      '💇 Стрижка: Короткие виски визуально подчёркивают челюсть',
    ] : [
      '👅 Mewing: Make sure the BACK of your tongue is pressed to the palate',
      '🏋️ Mastic gum: chew 10-15 min every other day for masseter growth',
      '🍽️ Target BF%: 12-14% for maximum jawline visibility',
      '💇 Haircut: Short sides visually emphasize the jawline',
    ];
  } else {
    jawAdvice = isRu
      ? 'Мощная челюсть с хорошими углами. Генетика + низкий процент жира — идеальная комбинация.'
      : 'Powerful jawline with great angles. Genetics + low body fat — perfect combo.';
    jawExercises = isRu ? [
      '✅ Поддерживай низкий процент жира',
      '🏋️ Лёгкая поддержка: мастичная смола 2-3 раза в неделю',
    ] : [
      '✅ Maintain low body fat percentage',
      '🏋️ Light maintenance: mastic gum 2-3 times per week',
    ];
  }

  sections.push({
    icon: '🦴',
    title: isRu ? 'ЧЕЛЮСТЬ И ПОДБОРОДОК' : 'JAWLINE & CHIN',
    score: `${analysis.jawline}/100`,
    content: jawAdvice,
    exercises: jawExercises,
  });

  // ═══════════════════════════════════════════════
  // SECTION 4: EYES & CANTHAL TILT
  // ═══════════════════════════════════════════════
  let eyeAdvice, eyeExercises;
  if (analysis.eyes < 55) {
    eyeAdvice = isRu
      ? 'Уставший или «жертвенный» взгляд. Зона вокруг глаз — первое, на что обращают внимание. Это можно значительно улучшить.'
      : 'Tired or "prey" gaze. The eye area is the first thing people notice. This can be significantly improved.';
    eyeExercises = isRu ? [
      '💤 Сон 8+ часов — главный фактор для свежего взгляда',
      '🧊 Ice roller по утрам: убирает отёки за 2 минуты',
      '☕ Кофеиновая сыворотка под глаза (The Ordinary Caffeine Solution)',
      '👁️ Упражнение «Squint»: сощурь нижние веки без бровей, 3x15 повторений',
      '🧴 Ретинол 0.3% на зону вокруг глаз (на ночь) для подтяжки кожи',
      '🌞 Солнцезащитные очки обязательно — UV ускоряет старение век',
    ] : [
      '💤 Sleep 8+ hours — the #1 factor for fresh-looking eyes',
      '🧊 Ice roller in the morning: removes puffiness in 2 minutes',
      '☕ Caffeine serum under eyes (The Ordinary Caffeine Solution)',
      '👁️ Squint exercise: squint lower lids without using eyebrows, 3x15 reps',
      '🧴 Retinol 0.3% around eye area (at night) for skin tightening',
      '🌞 Sunglasses are mandatory — UV accelerates eyelid aging',
    ];
  } else if (analysis.eyes < 80) {
    eyeAdvice = isRu
      ? 'Хороший разрез глаз с потенциалом для улучшения. Фокус на зону вокруг глаз и брови даст быстрый прогресс.'
      : 'Good eye shape with improvement potential. Focus on the under-eye area and brows for fast progress.';
    eyeExercises = isRu ? [
      '🧊 Утренний лёд: 30 секунд холодной ложки под глаза',
      '✏️ Брови: Сделай их чуть гуще (миноксидил для бровей или тинт)',
      '👁️ Для «Hunter eyes»: Тренируй прищур нижних век 3x10',
      '💧 Отбеливающие капли (Lumify) для яркости белков',
    ] : [
      '🧊 Morning ice: 30-second cold spoon under eyes',
      '✏️ Brows: Make them slightly thicker (minoxidil for brows or tint)',
      '👁️ For "Hunter Eyes": Train lower lid squint 3x10',
      '💧 Whitening drops (Lumify) for brighter sclera',
    ];
  } else {
    eyeAdvice = isRu
      ? 'Хищный взгляд с идеальным кантальным наклоном. Hunter Eyes confirmed.'
      : 'Predator gaze with perfect canthal tilt. Hunter Eyes confirmed.';
    eyeExercises = isRu ? [
      '✅ Поддерживай режим сна',
      '🌞 Защищай зону вокруг глаз от солнца (SPF + очки)',
    ] : [
      '✅ Maintain sleep schedule',
      '🌞 Protect eye area from sun (SPF + sunglasses)',
    ];
  }

  sections.push({
    icon: '👁️',
    title: isRu ? 'ГЛАЗА И ВЗГЛЯД' : 'EYES & GAZE',
    score: `${analysis.eyes}/100`,
    content: eyeAdvice,
    exercises: eyeExercises,
  });

  // ═══════════════════════════════════════════════
  // SECTION 5: GROOMING & STYLE RECOMMENDATIONS
  // ═══════════════════════════════════════════════
  let groomingTips;
  if (analysis.jawline >= 70) {
    groomingTips = isRu ? [
      '💇 Стрижка: Фэйд с короткими висками — подчеркнёт челюсть',
      '🧔 Борода: Чисто выбрит или лёгкая щетина 3-5 дней — лучший вариант для сильной челюсти',
    ] : [
      '💇 Haircut: Fade with short sides — will emphasize your jawline',
      '🧔 Beard: Clean shaven or light 3-5 day stubble — best for a strong jawline',
    ];
  } else {
    groomingTips = isRu ? [
      '💇 Стрижка: Средняя длина по бокам скроет узкую челюсть',
      '🧔 Борода: Отрасти бороду, заострённую к подбородку — визуально удлиняет челюсть',
      '🧴 Контуринг: Бронзер под скулами для визуальной проекции',
    ] : [
      '💇 Haircut: Medium length on sides to balance a narrow jaw',
      '🧔 Beard: Grow a beard pointed at the chin — visually lengthens the jaw',
      '🧴 Contouring: Bronzer under cheekbones for visual projection',
    ];
  }

  sections.push({
    icon: '💈',
    title: isRu ? 'СТИЛЬ И ГРУМИНГ' : 'STYLE & GROOMING',
    content: isRu
      ? 'Персональные рекомендации по стилю на основе твоей структуры лица:'
      : 'Personal style recommendations based on your facial structure:',
    exercises: groomingTips,
  });

  // ═══════════════════════════════════════════════
  // SECTION 6: 30-DAY PLAN
  // ═══════════════════════════════════════════════
  const weakest = Math.min(analysis.symmetry, analysis.jawline, analysis.eyes);
  const focusArea = weakest === analysis.symmetry
    ? (isRu ? 'симметрию' : 'symmetry')
    : weakest === analysis.jawline
    ? (isRu ? 'челюсть' : 'jawline')
    : (isRu ? 'зону глаз' : 'eye area');

  sections.push({
    icon: '📅',
    title: isRu ? '30-ДНЕВНЫЙ ПЛАН' : '30-DAY PLAN',
    content: isRu
      ? `Твоя главная зона роста — ${focusArea}. Вот план на 30 дней:`
      : `Your main growth area is ${focusArea}. Here's your 30-day plan:`,
    exercises: isRu ? [
      `📌 Неделя 1-2: Выработай привычки (mewing, сон на спине, питьевой режим)`,
      `📌 Неделя 2-3: Добавь упражнения (массаж, тренажёр челюсти, squint)`,
      `📌 Неделя 3-4: Оптимизируй стиль (стрижка, уход за кожей)`,
      `📸 День 30: Сделай новый скан и сравни результаты!`,
    ] : [
      `📌 Week 1-2: Build habits (mewing, sleeping on back, hydration)`,
      `📌 Week 2-3: Add exercises (massage, jaw trainer, squint drill)`,
      `📌 Week 3-4: Optimize style (haircut, skincare)`,
      `📸 Day 30: Take a new scan and compare your results!`,
    ],
  });

  return {
    title: isRu ? "💎 ПРЕМИУМ АНАЛИЗ" : "💎 PREMIUM ANALYSIS",
    sections
  };
}

module.exports = { generatePremiumAdvice };
