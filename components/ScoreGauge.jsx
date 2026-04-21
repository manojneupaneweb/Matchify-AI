'use client';

export default function ScoreGauge({ score }) {
  // Safety: normalize to integer 0-100
  const safeScore = typeof score === 'number'
    ? Math.min(100, Math.max(0, score <= 1 ? Math.round(score * 100) : Math.round(score)))
    : 0;

  const radius = 72;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference - (safeScore / 100) * circumference;

  const color =
    safeScore >= 80 ? '#10b981' :
    safeScore >= 50 ? '#f59e0b' :
    '#ef4444';

  const glowId = `gauge-glow-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className="relative w-48 h-48 mx-auto select-none">
      <svg
        width="192"
        height="192"
        viewBox="0 0 192 192"
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="60%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx="96"
          cy="96"
          r={normalizedRadius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />

        {/* Progress arc */}
        <circle
          cx="96"
          cy="96"
          r={normalizedRadius}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-extrabold text-white tabular-nums leading-none">
          {safeScore}
          <span className="text-2xl text-slate-400">%</span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mt-1.5">
          Match Score
        </span>
      </div>
    </div>
  );
}
