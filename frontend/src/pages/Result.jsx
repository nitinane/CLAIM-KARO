import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { openSSE } from '../lib/sse'
import ScoreGauge from '../components/ScoreGauge'
import FlagList from '../components/FlagList'
import ActionMenu from '../components/ActionMenu'
import BackButton from '../components/BackButton'
import {
  CheckCircle2, Target, CalendarDays, RefreshCw, ShieldCheck,
  FileText, Flag, Zap, ArrowLeft, ArrowRight, Loader2, AlertCircle,
} from 'lucide-react'

const ROUTE_LABELS = {
  return:            'Return & Refund',
  replacement:       'Replacement',
  warranty:          'Warranty Claim',
  consumer_helpline: 'Consumer Helpline',
}

/* ── Step pill colours ────────────────────────────────────────────────────── */
function stepStyle(status) {
  if (status === 'done')    return { dot: '#84CC16',  text: '#84CC16',  bg: 'rgba(132,204,22,0.10)' }
  if (status === 'running') return { dot: '#60A5FA',  text: '#60A5FA',  bg: 'rgba(96,165,250,0.10)' }
  if (status === 'error')   return { dot: '#F87171',  text: '#F87171',  bg: 'rgba(248,113,113,0.10)' }
  return                           { dot: '#4a5070',  text: '#6B7280',  bg: 'rgba(28,32,48,0.6)' }
}

/* ── Section card wrapper ─────────────────────────────────────────────────── */
function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: 'rgba(22,25,33,0.80)',
        border: '1px solid rgba(132,204,22,0.09)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      }}
    >
      {children}
    </div>
  )
}

/* ── Section heading ──────────────────────────────────────────────────────── */
function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{ background: 'rgba(132,204,22,0.12)', color: '#84CC16' }}
      >
        <Icon size={14} />
      </div>
      <h2 className="font-jakarta text-sm font-bold uppercase tracking-widest" style={{ color: '#9196B0' }}>
        {children}
      </h2>
    </div>
  )
}

export default function Result() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [run, setRun]             = useState(null)
  const [steps, setSteps]         = useState({ verify: 'pending', score: 'pending', draft: 'pending' })
  const [streamError, setStreamError] = useState(null)

  useEffect(() => {
    let closed = false
    const cleanup = openSSE(`/cases/${id}/run`, {
      onEvent(event) {
        if (closed) return
        if (event.type === 'step')     setSteps((s) => ({ ...s, [event.step]: event.status }))
        else if (event.type === 'complete') setRun(event)
        else if (event.type === 'error')    setStreamError(event.message || 'Verification failed')
      },
      onError(err) { if (!closed) setStreamError(err?.message || 'Stream error') },
    })
    return () => { closed = true; cleanup?.() }
  }, [id])

  const loading = !run && !streamError
  const score   = run?.score?.score   ?? 0
  const label   = run?.score?.label   ?? ''
  const reasons = run?.score?.reasons ?? []
  const route   = run?.score?.route
  const flags   = run?.verify?.flags  ?? []
  const verify  = run?.verify         ?? {}
  const draft   = run?.draft          ?? {}

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-8 px-4"
        style={{ background: '#0B0D11' }}
      >
        {/* Spinner */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full opacity-20"
            style={{ boxShadow: '0 0 48px rgba(132,204,22,0.6)' }}
          />
          <Loader2 size={36} className="animate-spin" style={{ color: '#84CC16' }} />
        </div>

        <div className="text-center">
          <p className="font-jakarta text-base font-semibold" style={{ color: '#E8EAF6' }}>
            Running AI verification & drafting…
          </p>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            This takes about 10–20 seconds. Hold tight.
          </p>
        </div>

        {/* Step pills */}
        <div
          className="flex flex-wrap justify-center gap-3 rounded-2xl p-5"
          style={{ background: 'rgba(22,25,33,0.8)', border: '1px solid rgba(132,204,22,0.09)' }}
        >
          {['verify', 'score', 'draft'].map((s) => {
            const st = stepStyle(steps[s])
            return (
              <div
                key={s}
                className="flex items-center gap-2.5 rounded-full px-4 py-2"
                style={{ background: st.bg }}
              >
                <span
                  className={`h-2 w-2 rounded-full ${steps[s] === 'running' ? 'animate-pulse' : ''}`}
                  style={{ background: st.dot }}
                />
                <span className="font-mono-ck text-[11px] capitalize" style={{ color: st.text }}>
                  {s}: {steps[s]}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6" style={{ background: '#0B0D11' }}>
      <div className="mx-auto max-w-3xl space-y-6">

        <BackButton fallback={`/cases/${id}/review`} />

        {/* ── Page header ── */}
        <div className="animate-float-up">
          <span
            className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono-ck text-[11px]"
            style={{
              background: 'rgba(132,204,22,0.10)',
              border: '1px solid rgba(132,204,22,0.20)',
              color: '#84CC16',
            }}
          >
            <CheckCircle2 size={12} />
            Claim Report
          </span>
          <h1
            className="font-jakarta text-3xl font-extrabold leading-tight sm:text-4xl"
            style={{ color: '#E8EAF6', letterSpacing: '-0.02em' }}
          >
            Your Claim Results
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
            AI-verified analysis, strength score, and next steps.
          </p>

          {streamError && (
            <div
              className="mt-4 flex items-start gap-3 rounded-xl p-4"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.20)' }}
            >
              <AlertCircle size={16} style={{ color: '#F87171', flexShrink: 0, marginTop: '1px' }} />
              <p className="text-sm" style={{ color: '#FCA5A5' }}>{streamError}</p>
            </div>
          )}
        </div>

        {/* ── Recommended route ── */}
        {route && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono-ck text-[10px] uppercase tracking-widest" style={{ color: '#6B7280' }}>
                  Recommended Route
                </p>
                <p className="mt-1.5 font-jakarta text-xl font-bold" style={{ color: '#E8EAF6' }}>
                  {ROUTE_LABELS[route] || route}
                </p>
              </div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(132,204,22,0.12)', color: '#84CC16' }}
              >
                <Target size={22} />
              </div>
            </div>
          </Card>
        )}

        {/* ── Verification metrics ── */}
        <Card>
          <SectionTitle icon={CalendarDays}>Verification Metrics</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Days since purchase */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(28,32,48,0.6)', border: '1px solid rgba(132,204,22,0.06)' }}
            >
              <p className="font-mono-ck text-[10px] uppercase tracking-widest" style={{ color: '#6B7280' }}>
                Days Since Purchase
              </p>
              <p className="mt-2 font-jakarta text-2xl font-extrabold" style={{ color: '#E8EAF6' }}>
                {verify.days_since_purchase ?? '—'}
              </p>
            </div>

            {/* Return window */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(28,32,48,0.6)', border: '1px solid rgba(132,204,22,0.06)' }}
            >
              <p className="font-mono-ck text-[10px] uppercase tracking-widest" style={{ color: '#6B7280' }}>
                Return Window
              </p>
              <p className="mt-2 font-jakarta text-lg font-bold">
                {verify.within_return_window == null ? (
                  <span style={{ color: '#4a5070' }}>—</span>
                ) : verify.within_return_window ? (
                  <span style={{ color: '#84CC16' }}>✓ Within window</span>
                ) : (
                  <span style={{ color: '#F87171' }}>✕ Expired</span>
                )}
              </p>
            </div>

            {/* Warranty */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(28,32,48,0.6)', border: '1px solid rgba(132,204,22,0.06)' }}
            >
              <p className="font-mono-ck text-[10px] uppercase tracking-widest" style={{ color: '#6B7280' }}>
                Warranty Coverage
              </p>
              <p className="mt-2 font-jakarta text-lg font-bold">
                {verify.within_warranty == null ? (
                  <span style={{ color: '#4a5070' }}>—</span>
                ) : verify.within_warranty ? (
                  <span style={{ color: '#84CC16' }}>✓ Covered</span>
                ) : (
                  <span style={{ color: '#F87171' }}>✕ Expired</span>
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* ── Score gauge ── */}
        <Card>
          <SectionTitle icon={Zap}>Claim Strength</SectionTitle>
          <ScoreGauge score={score} label={label} reasons={reasons} />
        </Card>

        {/* ── Policy clause ── */}
        {draft.policy_clause && (
          <Card>
            <SectionTitle icon={ShieldCheck}>Applicable Policy Clause</SectionTitle>
            <div
              className="rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background: 'rgba(132,204,22,0.06)',
                border: '1px solid rgba(132,204,22,0.14)',
                color: '#C6D97A',
                fontStyle: 'italic',
              }}
            >
              "{draft.policy_clause}"
              {draft.policy_source && (
                <div className="mt-3 not-italic">
                  <a
                    href={draft.policy_source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono-ck text-[11px] font-medium transition-colors"
                    style={{ color: '#84CC16' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#a3e635' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#84CC16' }}
                  >
                    View Policy Source ↗
                  </a>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* ── Draft preview ── */}
        {draft.body && (
          <Card>
            <SectionTitle icon={FileText}>Complaint Draft</SectionTitle>
            {draft.subject && (
              <div
                className="mb-4 rounded-xl px-4 py-3"
                style={{ background: 'rgba(28,32,48,0.8)', border: '1px solid rgba(132,204,22,0.08)' }}
              >
                <span className="font-mono-ck text-[10px] uppercase tracking-widest" style={{ color: '#6B7280' }}>
                  Subject:{' '}
                </span>
                <span className="text-sm font-medium" style={{ color: '#E8EAF6' }}>
                  {draft.subject}
                </span>
              </div>
            )}
            <div
              className="rounded-xl p-5"
              style={{ background: 'rgba(28,32,48,0.6)', border: '1px solid rgba(132,204,22,0.06)' }}
            >
              <pre
                className="text-sm font-sans leading-relaxed whitespace-pre-wrap"
                style={{ color: '#C4C9E0' }}
              >
                {draft.body}
              </pre>
            </div>
          </Card>
        )}

        {/* ── Flags ── */}
        <Card>
          <SectionTitle icon={Flag}>Verification Flags</SectionTitle>
          <FlagList flags={flags} />
        </Card>

        {/* ── Actions ── */}
        <Card>
          <SectionTitle icon={Zap}>Take Action</SectionTitle>
          <ActionMenu caseId={id} draft={draft} caseStatus={run?.status} />
        </Card>

        {/* ── Bottom nav ── */}
        <div className="flex items-center justify-between gap-4 pb-4">
          <button
            onClick={() => navigate(`/cases/${id}/review`)}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all"
            style={{ background: 'rgba(28,32,48,0.8)', color: '#9196B0', border: '1px solid rgba(132,204,22,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#E8EAF6'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.20)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9196B0'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.08)' }}
          >
            <ArrowLeft size={15} />
            Back to Review
          </button>
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all"
            style={{ background: 'rgba(28,32,48,0.8)', color: '#9196B0', border: '1px solid rgba(132,204,22,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#E8EAF6'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.20)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9196B0'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.08)' }}
          >
            My Cases
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
