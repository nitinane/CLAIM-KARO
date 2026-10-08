function getArc(score) {
  const radius       = 70
  const circumference = Math.PI * radius // semicircle (180°)
  const filled        = (score / 100) * circumference
  return { radius, circumference, filled }
}

function getColor(score) {
  if (score >= 70) return '#84CC16'  // lime  – ClaimKaro primary
  if (score >= 40) return '#FBBF24'  // amber – warning
  return '#F87171'                   // rose  – weak
}

/**
 * ScoreGauge({ score, label, reasons })
 * score: 0-100 | label: "Strong" | "Fair" | "Weak"
 */
export default function ScoreGauge({ score = 0, label = '', reasons = [] }) {
  const { radius, circumference, filled } = getArc(score)
  const color = getColor(score)

  const cx     = 100
  const cy     = 100
  const startX = cx - radius
  const startY = cy
  const endX   = cx + radius
  const endY   = cy

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="120" viewBox="0 0 200 115" className="overflow-visible">
        {/* Glow filter */}
        <defs>
          <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
          fill="none"
          stroke="rgba(28,32,48,1)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Filled arc */}
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          filter="url(#arc-glow)"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />

        {/* Score number */}
        <text
          x="100" y="88"
          textAnchor="middle"
          fill="#E8EAF6"
          fontSize="32"
          fontWeight="800"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          letterSpacing="-1"
        >
          {score}
        </text>

        {/* Label */}
        <text
          x="100" y="110"
          textAnchor="middle"
          fill={color}
          fontSize="11"
          fontWeight="700"
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="2"
        >
          {label?.toUpperCase()}
        </text>
      </svg>

      {/* Reasons */}
      {reasons.length > 0 && (
        <ul className="mt-5 w-full max-w-sm space-y-2">
          {reasons.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-xs leading-relaxed"
              style={{ background: 'rgba(28,32,48,0.6)', color: '#C4C9E0' }}
            >
              <span className="mt-0.5 shrink-0 font-bold" style={{ color: '#84CC16' }}>›</span>
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
