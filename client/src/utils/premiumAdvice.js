export function generatePremiumAdvice(analysis, lang) {
  if (!analysis) return null;
  
  const advice = [];
  const isRu = lang === 'ru';

  // Symmetry advice
  if (analysis.symmetry < 60) {
    advice.push(isRu ? 
      "Твоя симметрия лица ниже среднего. Обрати внимание на привычку спать на одном боку или жевать на одной стороне. Попробуй массаж гуаша и спи на спине." : 
      "Your facial symmetry is below average. Pay attention to sleeping on one side or chewing on one side. Try gua sha massage and sleep on your back.");
  } else if (analysis.symmetry < 80) {
    advice.push(isRu ? 
      "Неплохая симметрия, но есть небольшие асимметрии в области скул или глаз. Исправление осанки шеи может помочь." : 
      "Good symmetry, but slight asymmetries exist around the cheekbones or eyes. Fixing neck posture (nerd neck) can help.");
  } else {
    advice.push(isRu ? 
      "Идеальная симметрия. Генетический джекпот, продолжай в том же духе!" : 
      "Perfect symmetry. Genetic jackpot, keep it up!");
  }

  // Jawline advice
  if (analysis.jawline < 60) {
    advice.push(isRu ? 
      "Слабо выраженная челюсть. Тебе срочно нужно начать практиковать mewing (правильное положение языка) и снизить процент жира в организме до 12-15%." : 
      "Weak jawline definition. You urgently need to start mewing (proper tongue posture) and reduce your body fat percentage to 12-15%.");
  } else if (analysis.jawline < 80) {
    advice.push(isRu ? 
      "Челюсть выделяется, но ей не хватает резкости. Тренируй жевательные мышцы (например, с помощью жестких эспандеров или смолы) и следи за водно-солевым балансом, чтобы избежать отеков." : 
      "Jawline is visible but lacks sharpness. Train your masseter muscles (using hard gum or mastic) and watch your sodium intake to prevent bloating.");
  } else {
    advice.push(isRu ? 
      "Мощный подбородок и углы челюсти. Hunter eyes и chad jawline detected." : 
      "Powerful chin and jawline angles. Hunter eyes and chad jawline detected.");
  }

  // Eyes advice
  if (analysis.eyes < 65) {
    advice.push(isRu ? 
      "Уставший взгляд или нависшее веко. Спи минимум 8 часов, используй лед по утрам (ice over) и сыворотки с кофеином от мешков под глазами." : 
      "Tired look or hooded/prey eyes. Sleep at least 8 hours, use morning ice dips (icing) and caffeine serums for eye bags.");
  } else if (analysis.eyes < 85) {
    advice.push(isRu ? 
      "Хороший разрез глаз. Чтобы сделать взгляд более пронзительным, обрати внимание на форму бровей (сделай их более густыми) и используй капли для отбеливания белков." : 
      "Good eye shape. To make your gaze more piercing, focus on your eyebrow shape (make them thicker) and use whitening eye drops.");
  } else {
    advice.push(isRu ? 
      "Хищный взгляд. Идеальный наклон кантуса." : 
      "Predator gaze. Perfect canthal tilt.");
  }

  return {
    title: isRu ? "💎 ПРЕМИУМ АНАЛИЗ" : "💎 PREMIUM ANALYSIS",
    points: advice
  };
}
