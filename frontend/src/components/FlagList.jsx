import { AlertTriangle, Info, XCircle, CheckCircle2 } from 'lucide-react'

/* ─── Severity config mapped to ClaimKaro palette ──────────────────────── */
const SEVERITY_CONFIG = {
  blocking: {
    icon:   XCircle,
    tone:   '#F87171',
    bg:     'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.20)',
    badge:  { bg: 'rgba(248,113,113,0.15)', color: '#F87171' },
    label:  'Blocking',
  },
  warning: {
    icon:   AlertTriangle,
    tone:   '#FBBF24',
    bg:     'rgba(251,191,36,0.07)',
    border: 'rgba(251,191,36,0.18)',
    badge:  { bg: 'rgba(251,191,36,0.14)', color: '#FBBF24' },
    label:  'Warning',
  },
  info: {
    icon:   Info,
    tone:   '#60A5FA',
    bg:     'rgba(96,165,250,0.07)',
    border: 'rgba(96,165,250,0.15)',
    badge:  { bg: 'rgba(96,165,250,0.13)', color: '#60A5FA' },
    label:  'Info',
  },
}

/**
 * FlagList({ flags })
 * flags: [{ code, severity, message, fields, source }]
 */
export default function FlagList({ flags = [] }) {
  if (!flags.length) {
    return (
      <div
        className="flex items-center gap-4 rounded-2xl p-5"
        style={{
          background: 'rgba(132,204,22,0.07)',
          border: '1px solid rgba(132,204,22,0.18)',
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(132,204,22,0.14)', color: '#84CC16' }}
        >
          <CheckCircle2 size={20} />
        </div>
        <div>
          <p className="font-jakarta text-sm font-bold" style={{ color: '#84CC16' }}>
            No issues found
          </p>
          <p className="mt-0.5 text-xs" style={{ color: '#6B7280' }}>
            All evidence checks passed cleanly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {flags.map((flag, i) => {
        const cfg  = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.info
        const Icon = cfg.icon
        return (
          <li
            key={flag.code || i}
            className="flex gap-3.5 rounded-2xl p-4"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            {/* Icon */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${cfg.tone}18`, color: cfg.tone }}
            >
              <Icon size={15} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 font-mono-ck text-[10px] font-bold"
                  style={cfg.badge}
                >
                  {cfg.label}
                </span>
                {flag.source && (
                  <span className="font-mono-ck text-[10px]" style={{ color: '#4a5070' }}>
                    {flag.source}
                  </span>
                )}
                {flag.fields?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {flag.fields.map((f) => (
                      <span
                        key={f}
                        className="rounded-md px-1.5 py-0.5 font-mono-ck text-[10px]"
                        style={{ background: 'rgba(28,32,48,0.8)', color: '#9196B0' }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-sm leading-relaxed" style={{ color: '#C4C9E0' }}>
                {flag.message}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
