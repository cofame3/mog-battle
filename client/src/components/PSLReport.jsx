import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Scan } from 'lucide-react';

export default function PSLReport({ imageSrc, analysis, onClose, lang }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  const kp = analysis.keypoints;
  const psl = analysis.psl;
  const ru = lang === 'ru';

  useEffect(() => {
    if (!kp || !canvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const W = img.naturalWidth;
      const H = img.naturalHeight;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // ── Draw the photo itself onto the canvas ──
      ctx.drawImage(img, 0, 0, W, H);

      // ── Helpers ──
      const line = (i1, i2, color, w, dash = []) => {
        const a = kp[i1], b = kp[i2];
        if (!a || !b) return;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.moveTo(a.x * W, a.y * H);
        ctx.lineTo(b.x * W, b.y * H);
        ctx.stroke();
        ctx.restore();
      };

      const dot = (i, color, r) => {
        const p = kp[i];
        if (!p) return;
        ctx.save();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      };

      const lineXY = (p1, p2, color, w, dash = []) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.moveTo(p1.x * W, p1.y * H);
        ctx.lineTo(p2.x * W, p2.y * H);
        ctx.stroke();
        ctx.restore();
      };

      // 1. SYMMETRY — green dashed vertical
      const top = kp[10], bot = kp[152];
      if (top && bot) {
        const dx = bot.x - top.x, dy = bot.y - top.y;
        const ext = 0.2;
        lineXY(
          { x: top.x - dx * ext, y: top.y - dy * ext },
          { x: bot.x + dx * ext, y: bot.y + dy * ext },
          'rgba(0,255,157,0.6)', 1.5, [8, 5]
        );
        dot(10, '#00ff9d', 3);
        dot(152, '#00ff9d', 3);
      }

      // 2. CANTHAL TILT — cyan eye lines
      line(33, 133, '#00e5ff', 2);
      dot(33, '#00e5ff', 4);
      dot(133, '#00e5ff', 4);
      line(362, 263, '#00e5ff', 2);
      dot(362, '#00e5ff', 4);
      dot(263, '#00e5ff', 4);

      // 3. CHEEKBONES — pink dashed
      line(234, 454, 'rgba(255,0,85,0.7)', 2, [6, 4]);
      dot(234, '#ff0055', 4);
      dot(454, '#ff0055', 4);

      // 4. JAW WIDTH — blue dashed
      line(132, 361, 'rgba(80,160,255,0.7)', 2, [6, 4]);
      dot(132, '#50a0ff', 4);
      dot(361, '#50a0ff', 4);

      // 5. PHILTRUM — yellow
      line(4, 0, 'rgba(255,200,0,0.7)', 1.5, [4, 3]);
      dot(4, '#ffc800', 3);
      dot(0, '#ffc800', 3);

      // 6. NOSE — purple
      line(102, 331, 'rgba(168,85,247,0.7)', 1.5, [5, 5]);
      dot(102, '#a855f7', 3);
      dot(331, '#a855f7', 3);

      setReady(true);
    };
    img.src = imageSrc;
  }, [kp, imageSrc]);

  // ── Rating helpers ──
  const getCanthalRating = (val) => {
    if (val > 5.0) return {
      text: ru ? 'Положительный (Hunter Eyes)' : 'Positive (Hunter Eyes)',
      desc: ru ? 'Идеальный «хищный» наклон. Создает доминантный и уверенный взгляд.' : 'Ideal predator tilt. Creates a dominant and confident gaze.',
      color: 'text-cyber-neon'
    };
    if (val > 0.5) return {
      text: ru ? 'Нейтральный' : 'Neutral',
      desc: ru ? 'Сбалансированный разрез глаз. Подходит под любой типаж внешности.' : 'Balanced eye shape. Fits well with any facial type.',
      color: 'text-yellow-400'
    };
    return {
      text: ru ? 'Отрицательный (Prey Eyes)' : 'Negative (Prey Eyes)',
      desc: ru ? 'Нисходящий наклон. Придает взгляду более мягкий или уставший вид.' : 'Downward tilt. Gives the gaze a softer or more tired look.',
      color: 'text-red-400'
    };
  };

  const getJawRating = (ratio) => {
    if (ratio >= 0.92) return {
      text: ru ? 'Отлично' : 'Excellent',
      desc: ru ? 'Элитная ширина челюсти. Мощная мужская костная структура.' : 'Elite jaw width. Powerful masculine bone structure.',
      color: 'text-cyber-neon'
    };
    if (ratio >= 0.90) return {
      text: ru ? 'Идеально' : 'Ideal',
      desc: ru ? 'Превосходное соотношение. Челюсть идеально гармонирует со скулами.' : 'Excellent ratio. The jaw harmonizes perfectly with the cheekbones.',
      color: 'text-cyber-neon'
    };
    if (ratio >= 0.85) return {
      text: ru ? 'Выше среднего' : 'Above Average',
      desc: ru ? 'Хорошая база. Челюсть заметная, но не доминирует в структуре.' : 'Good base. The jaw is noticeable but doesn\'t dominate the structure.',
      color: 'text-yellow-400'
    };
    return {
      text: ru ? 'Среднее' : 'Average',
      desc: ru ? 'Узковатая челюсть. Борода или жевательная смола помогут добавить объема.' : 'Narrower jaw. A beard or mastic gum can help add volume.',
      color: 'text-red-400'
    };
  };

  const getSymDesc = (val) => {
    if (val >= 85) return ru ? 'Почти идеальная симметрия. Твои черты лица очень сбалансированы.' : 'Near-perfect symmetry. Your facial features are highly balanced.';
    if (val >= 70) return ru ? 'Хороший баланс. Небольшие асимметрии естественны и незаметны.' : 'Good balance. Minor asymmetries are natural and unnoticeable.';
    if (val >= 50) return ru ? 'Средняя симметрия. Можно улучшить, следя за осанкой и привычками сна.' : 'Average symmetry. Can be improved by watching posture and sleep habits.';
    return ru ? 'Заметная асимметрия. Часто вызвана сном на одном боку или жеванием на одной стороне.' : 'Noticeable asymmetry. Often caused by sleeping or chewing on one side.';
  };

  const getPhiltrumRating = (val) => {
    if (val <= 0.12) return {
      text: ru ? 'Короткий (Идеал)' : 'Short (Ideal)',
      desc: ru ? 'Идеальная компактность средней части лица.' : 'Ideal compactness of the midface.',
      color: 'text-cyber-neon'
    };
    if (val <= 0.15) return {
      text: ru ? 'Средний' : 'Average',
      desc: ru ? 'Стандартная длина. Гармонично смотрится с большинством типов лиц.' : 'Standard length. Looks harmonious with most face types.',
      color: 'text-yellow-400'
    };
    return {
      text: ru ? 'Длинный' : 'Long',
      desc: ru ? 'Увеличенная дистанция. Может визуально удлинять лицо.' : 'Increased distance. Can visually elongate the face.',
      color: 'text-red-400'
    };
  };

  const getNoseRating = (ratio) => {
    if (ratio >= 0.25 && ratio <= 0.31) return {
      text: ru ? 'Идеальный' : 'Ideal',
      desc: ru ? 'Ширина носа идеально гармонирует с шириной лица.' : 'Nose width harmonizes perfectly with face width.',
      color: 'text-cyber-neon'
    };
    if (ratio < 0.25) return {
      text: ru ? 'Узкий' : 'Narrow',
      desc: ru ? 'Утонченные черты. Очень компактный нос.' : 'Refined features. Very compact nose.',
      color: 'text-yellow-400'
    };
    return {
      text: ru ? 'Широкий' : 'Wide',
      desc: ru ? 'Маскулинные черты. Нос занимает значительную часть лица.' : 'Masculine features. The nose occupies a significant part of the face.',
      color: 'text-red-400'
    };
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `omogle-psl-scan-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const canthalR = psl ? getCanthalRating(psl.canthalTiltR) : null;
  const jawR = psl ? getJawRating(psl.jawRatio) : null;
  const philR = psl ? getPhiltrumRating(psl.philtrumRatio) : null;
  const noseR = psl ? getNoseRating(psl.noseRatio) : null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-lg overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div
          className="relative w-full max-w-lg bg-black/95 border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-reveal"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Scan size={18} className="text-cyber-neon" />
              <span className="text-sm font-black tracking-[0.2em] text-white uppercase">PSL SCAN</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleDownload} disabled={!ready} className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-cyber-neon hover:text-white transition-colors uppercase disabled:opacity-30">
                <Download size={14} />
                {ru ? 'СКАЧАТЬ' : 'SAVE'}
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Canvas with image + overlays baked in */}
          <div className="relative bg-black">
            <canvas
              ref={canvasRef}
              className="w-full block"
              style={{ imageRendering: 'auto' }}
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-3">
                  <Scan size={32} className="text-cyber-neon animate-pulse" />
                  <span className="text-sm font-bold tracking-widest text-cyber-neon animate-pulse uppercase">
                    {ru ? 'СКАНИРОВАНИЕ...' : 'SCANNING...'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Score bar */}
          <div className="px-5 py-4 border-t border-white/10 bg-white/[0.02]">
            <div className="grid grid-cols-5 gap-2 text-center">
              <div>
                <div className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">TOTAL</div>
                <div className="text-2xl font-black text-white">{analysis.total}</div>
                <div className={`text-[9px] font-black tracking-widest ${analysis.total >= 80 ? 'text-yellow-400' : analysis.total >= 65 ? 'text-cyber-neon' : analysis.total >= 45 ? 'text-blue-400' : 'text-red-400'
                  }`}>{analysis.verdict}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">{ru ? 'ГЛАЗА' : 'EYES'}</div>
                <div className="text-2xl font-black text-[#00e5ff]">{analysis.eyes}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">{ru ? 'ЧЕЛЮСТЬ' : 'JAW'}</div>
                <div className="text-2xl font-black text-[#50a0ff]">{analysis.jawline}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">{ru ? 'СИММ.' : 'SYM.'}</div>
                <div className="text-2xl font-black text-[#00ff9d]">{analysis.symmetry}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">{ru ? 'НОС' : 'NOSE'}</div>
                <div className="text-2xl font-black text-[#ff00ff]">{analysis.nose}</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="px-5 pb-5 pt-2 space-y-0">
            <LegendRow
              color="#00ff9d" dash
              title={ru ? 'Симметрия' : 'Symmetry'}
              value={`${analysis.symmetry}/100`}
              valueColor={analysis.symmetry >= 70 ? 'text-cyber-neon' : analysis.symmetry >= 50 ? 'text-yellow-400' : 'text-red-400'}
              desc={getSymDesc(analysis.symmetry)}
            />
            <LegendRow
              color="#ff00ff"
              title={ru ? 'Пропорции носа' : 'Nose Proportions'}
              value={`${analysis.nose}/100`}
              valueColor={analysis.nose >= 70 ? 'text-cyber-neon' : analysis.nose >= 40 ? 'text-yellow-400' : 'text-red-400'}
              desc={noseR ? noseR.desc : '—'}
            />
            <LegendRow
              color="#00e5ff"
              title={ru ? 'Кантальный наклон' : 'Canthal Tilt'}
              value={canthalR ? canthalR.text : '—'}
              valueColor={canthalR ? canthalR.color : 'text-gray-500'}
              desc={canthalR ? canthalR.desc : ''}
            />
            <LegendRow
              color="#ff0055" dash
              title={ru ? 'Скулы' : 'Cheekbones'}
              value={analysis.jawline >= 70 ? (ru ? 'Выражены' : 'Prominent') : (ru ? 'Средние' : 'Average')}
              valueColor={analysis.jawline >= 70 ? 'text-cyber-neon' : 'text-yellow-400'}
              desc={analysis.jawline >= 70
                ? (ru ? 'Широкие скулы обеспечивают отличную поддержку лица.' : 'Wide cheekbones provide excellent facial support.')
                : (ru ? 'Средняя ширина. Костная структура в пределах нормы.' : 'Average width. Bone structure is within normal range.')}
            />
            <LegendRow
              color="#50a0ff" dash
              title={ru ? 'Челюсть' : 'Jaw Ratio'}
              value={jawR ? `${analysis.psl.jawRatio} — ${jawR.text}` : '—'}
              valueColor={jawR ? jawR.color : 'text-gray-500'}
              desc={jawR ? jawR.desc : ''}
            />
            <LegendRow
              color="#a855f7" dash
              title={ru ? 'Нос' : 'Nose'}
              value={noseR ? noseR.text : '—'}
              valueColor={noseR ? noseR.color : 'text-gray-500'}
              desc={noseR ? noseR.desc : ''}
            />
            <LegendRow
              color="#ffc800" dash
              title={ru ? 'Фильтрум' : 'Philtrum'}
              value={philR ? philR.text : '—'}
              valueColor={philR ? philR.color : 'text-gray-500'}
              desc={philR ? philR.desc : ''}
              last
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendRow({ color, dash, title, value, valueColor, desc, last }) {
  return (
    <div className={`py-3 ${!last ? 'border-b border-white/5' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="flex-shrink-0 w-4 h-[3px] rounded-full" style={{
          background: dash
            ? `repeating-linear-gradient(90deg, ${color} 0px, ${color} 4px, transparent 4px, transparent 7px)`
            : color,
          boxShadow: `0 0 6px ${color}`,
        }} />
        <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{title}</span>
      </div>
      <div className={`text-sm font-bold pl-6 ${valueColor}`}>{value}</div>
      <p className="text-[10px] text-gray-600 leading-relaxed pl-6 mt-1">{desc}</p>
    </div>
  );
}
