import { useEffect, useMemo, useState } from 'react'
import {
  ChevronRight, FilePlus2, Plus, Sparkles, ClipboardList,
  TrendingUp, Clock, Zap, Shield, AlertCircle, CheckCircle2,
  Loader2, Search,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { getErrorMessage, listCases } from '../lib/api'

/* ─── Status config ─────────────────────────────────────────────────────── */
const STATUS = {
  uploaded:  { label: 'Evidence received',       tone: '#84CC16', bg: 'rgba(132,204,22,0.12)',  icon: Shield,       next: 'Start AI analysis' },
  analyzing: { label: 'AI analysis in progress', tone: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  icon: Loader2,      next: 'View analysis' },
  review:    { label: 'Ready for review',         tone: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  icon: Clock,        next: 'Review claim' },
  approved:  { label: 'Notice ready',             tone: '#A78BFA', bg: 'rgba(167,139,250,0.12)', icon: CheckCircle2, next: 'Open notice' },
  done:      { label: 'Resolved',                 tone: '#22C55E', bg: 'rgba(34,197,94,0.12)',   icon: CheckCircle2, next: 'View result' },
  error:     { label: 'Needs attention',          tone: '#F87171', bg: 'rgba(248,113,113,0.12)', icon: AlertCircle,  next: 'Review issue' },
}

function caseRoute(item) {
  if (item.status === 'uploaded' || item.status === 'analyzing') return `/cases/${item.id}/analyze`
  if (item.status === 'review') return `/cases/${item.id}/review`
  return `/cases/${item.id}/result`
}

function displayDate(value) {
  return value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recently added'
}

/* ─── Main page ─────────────────────────────────────────────────────────── */
export default function MyCases() {
  const navigate = useNavigate()
  const [cases, setCases]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    listCases()
      .then(setCases)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const activeCount = useMemo(
    () => cases.filter((c) => !['done', 'error'].includes(c.status)).length,
    [cases],
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return cases
    const q = search.toLowerCase()
    return cases.filter(
      (c) =>
        (c.product || '').toLowerCase().includes(q) ||
        (c.defect_type || '').toLowerCase().includes(q) ||
        (c.status || '').toLowerCase().includes(q),
    )
  }, [cases, search])

  return (
    <DashboardLayout
      activeView="cases"
      title="Case dossiers"
      subtitle="Manage every consumer claim from evidence to resolution"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

        {/* ── Header ── */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-float-up">
            <p
              className="mb-2 flex items-center gap-1.5 font-mono-ck text-[10px] uppercase tracking-[0.18em]"
              style={{ color: '#84CC16' }}
            >
              <ClipboardList size={11} />
              Claim Workspace
            </p>
            <h1
              className="font-jakarta font-extrabold leading-tight sm:text-[34px]"
              style={{ color: '#E8EAF6', fontSize: '28px', letterSpacing: '-0.02em' }}
            >
              Your case dossiers
            </h1>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6B7280' }}>
              Track evidence, legal analysis, and merchant action in one place.
            </p>
          </div>

          <button
            onClick={() => navigate('/new')}
            className="flex h-11 items-center justify-center gap-2 self-start rounded-2xl px-6 text-sm font-bold transition-all active:scale-95 sm:self-auto"
            style={{
              background: 'linear-gradient(135deg, #84CC16, #65A300)',
              color: '#0B0D11',
              boxShadow: '0 8px 28px rgba(132,204,22,0.30)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 12px 36px rgba(132,204,22,0.45)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(132,204,22,0.30)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Plus size={17} strokeWidth={3} />
            New claim
          </button>
        </header>

        {/* ── Metric cards ── */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            label="Total dossiers"
            value={cases.length}
            detail="Claims in your workspace"
            icon={ClipboardList}
          />
          <MetricCard
            label="Active claims"
            value={activeCount}
            detail="Evidence or action underway"
            icon={TrendingUp}
          />
          <MetricCard
            label="Next action"
            value={cases.length ? 'Review' : 'Start'}
            detail={cases.length ? 'Continue your strongest case' : 'Add evidence to create your first case'}
            icon={Zap}
            emphasis
          />
        </section>

        {/* ── All Claims table ── */}
        <section
          className="overflow-hidden rounded-3xl"
          style={{
            background: 'rgba(22, 25, 33, 0.80)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(132,204,22,0.10)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          }}
        >
          {/* Table header row */}
          <div
            className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderBottom: '1px solid rgba(132,204,22,0.08)' }}
          >
            <div>
              <h2 className="font-jakarta text-lg font-bold" style={{ color: '#E8EAF6' }}>
                All claims
              </h2>
              <p className="mt-0.5 text-xs" style={{ color: '#6B7280' }}>
                {loading
                  ? 'Loading your dossiers…'
                  : `${cases.length} claim${cases.length === 1 ? '' : 's'} in your workspace`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Live search */}
              {!loading && cases.length > 0 && (
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(28,32,48,0.8)', border: '1px solid rgba(132,204,22,0.10)' }}
                >
                  <Search size={13} style={{ color: '#6B7280' }} />
                  <input
                    type="text"
                    placeholder="Search claims…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent text-xs outline-none placeholder:text-[#4a5070]"
                    style={{ color: '#E8EAF6', width: '130px' }}
                  />
                </div>
              )}

              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono-ck text-[10px]"
                style={{
                  background: 'rgba(132,204,22,0.08)',
                  color: '#84CC16',
                  border: '1px solid rgba(132,204,22,0.15)',
                }}
              >
                <Sparkles size={11} />
                AI-READY DOSSIERS
              </span>
            </div>
          </div>

          {/* Body states */}
          {loading && <LoadingSkeleton />}
          {error && <ErrorState error={error} />}
          {!loading && !error && cases.length === 0 && <EmptyState onCreate={() => navigate('/new')} />}

          {!loading && !error && cases.length > 0 && (
            <div>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-14 text-center">
                  <Search size={22} style={{ color: '#4a5070' }} />
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    No claims match{' '}
                    <span style={{ color: '#84CC16' }}>"{search}"</span>
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'rgba(132,204,22,0.06)' }}>
                  {filtered.map((item, i) => (
                    <CaseRow
                      key={item.id}
                      item={item}
                      index={i}
                      onClick={() => navigate(caseRoute(item))}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

/* ─── Metric card ────────────────────────────────────────────────────────── */
function MetricCard({ label, value, detail, icon: Icon, emphasis = false }) {
  return (
    <article
      className="group relative overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
      style={{
        background: emphasis
          ? 'linear-gradient(145deg, rgba(132,204,22,0.10) 0%, rgba(22,25,33,0.95) 100%)'
          : 'rgba(22,25,33,0.80)',
        border: emphasis
          ? '1px solid rgba(132,204,22,0.22)'
          : '1px solid rgba(132,204,22,0.08)',
        boxShadow: emphasis
          ? '0 8px 32px rgba(132,204,22,0.08)'
          : '0 4px 16px rgba(0,0,0,0.20)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Subtle corner glow for emphasis card */}
      {emphasis && (
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #84CC16, transparent)' }}
        />
      )}

      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono-ck text-[10px] uppercase tracking-widest" style={{ color: '#6B7280' }}>
          {label}
        </p>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            background: emphasis ? 'rgba(132,204,22,0.15)' : 'rgba(28,32,48,0.8)',
            color: emphasis ? '#84CC16' : '#4a5070',
          }}
        >
          <Icon size={14} />
        </div>
      </div>

      <p
        className="font-jakarta font-extrabold leading-none"
        style={{ color: emphasis ? '#84CC16' : '#E8EAF6', fontSize: '36px', letterSpacing: '-0.02em' }}
      >
        {value}
      </p>
      <p className="mt-2.5 text-xs leading-relaxed" style={{ color: emphasis ? '#9196B0' : '#84CC16' }}>
        {detail}
      </p>
    </article>
  )
}

/* ─── Case row ───────────────────────────────────────────────────────────── */
function CaseRow({ item, onClick, index }) {
  const config     = STATUS[item.status] || STATUS.uploaded
  const StatusIcon = config.icon
  const product    = item.product || item.case_file?.product?.value || 'Untitled consumer claim'
  const defect     = item.defect_type || item.case_file?.defect_type?.value || 'Evidence submitted for review'

  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col gap-4 px-6 py-5 text-left transition-all duration-200 sm:flex-row sm:items-center"
      style={{ color: '#E8EAF6' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(132,204,22,0.035)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Product icon */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
        style={{ background: config.bg, color: config.tone }}
      >
        <FilePlus2 size={19} />
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono-ck text-[10px] font-medium"
            style={{ background: config.bg, color: config.tone }}
          >
            <StatusIcon
              size={10}
              className={item.status === 'analyzing' ? 'animate-spin' : ''}
            />
            {config.label}
          </span>
          <span className="font-mono-ck text-[10px]" style={{ color: '#4a5070' }}>
            #{item.id?.slice(0, 8)}
          </span>
          {item.score != null && (
            <span
              className="rounded-full px-2 py-0.5 font-mono-ck text-[10px] font-bold"
              style={{ background: 'rgba(132,204,22,0.10)', color: '#84CC16' }}
            >
              SCORE {item.score}
            </span>
          )}
        </div>

        <h3
          className="mt-2 truncate font-bold sm:text-[15px]"
          style={{ fontSize: '14px', letterSpacing: '-0.01em' }}
        >
          {product}
        </h3>
        <p className="mt-1 truncate text-xs" style={{ color: '#6B7280' }}>
          {defect}
        </p>
      </div>

      {/* Date + CTA */}
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-left sm:text-right">
          <p className="text-xs" style={{ color: '#4a5070' }}>
            {displayDate(item.created_at)}
          </p>
          <p className="mt-1 text-xs font-semibold" style={{ color: '#84CC16' }}>
            {config.next}
          </p>
        </div>

        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 group-hover:translate-x-0.5"
          style={{
            background: 'rgba(28,32,48,0.8)',
            color: '#84CC16',
            border: '1px solid rgba(132,204,22,0.12)',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 12px rgba(132,204,22,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
        >
          <ChevronRight size={15} />
        </span>
      </div>
    </button>
  )
}

/* ─── Loading skeleton ───────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl p-5"
          style={{ background: 'rgba(28,32,48,0.5)' }}
        >
          <div className="h-11 w-11 animate-pulse rounded-2xl" style={{ background: '#1C2030' }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 animate-pulse rounded-full" style={{ background: '#1C2030' }} />
            <div className="h-4 w-56 animate-pulse rounded-full" style={{ background: '#1C2030' }} />
            <div className="h-3 w-40 animate-pulse rounded-full" style={{ background: '#1C2030' }} />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-xl" style={{ background: '#1C2030' }} />
        </div>
      ))}
    </div>
  )
}

/* ─── Error state ────────────────────────────────────────────────────────── */
function ErrorState({ error }) {
  return (
    <div
      className="m-6 flex items-start gap-4 rounded-2xl p-5"
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}
    >
      <AlertCircle size={20} style={{ color: '#F87171', flexShrink: 0, marginTop: '2px' }} />
      <div className="flex-1">
        <p className="font-semibold" style={{ color: '#FCA5A5' }}>
          We couldn't load your dossiers.
        </p>
        <p className="mt-1 text-sm" style={{ color: '#F87171' }}>
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
          style={{ background: '#252A38', color: '#E8EAF6', border: '1px solid rgba(255,255,255,0.06)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2e3447' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#252A38' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-3xl"
        style={{ background: 'rgba(132,204,22,0.10)', border: '1px solid rgba(132,204,22,0.15)' }}
      >
        <div
          className="absolute inset-0 rounded-3xl opacity-30"
          style={{ boxShadow: '0 0 40px rgba(132,204,22,0.3)' }}
        />
        <FilePlus2 size={32} style={{ color: '#84CC16' }} />
      </div>

      <h3
        className="mt-6 font-jakarta text-xl font-bold"
        style={{ color: '#E8EAF6', letterSpacing: '-0.01em' }}
      >
        Your dossier workspace is ready.
      </h3>
      <p className="mt-2 max-w-xs text-sm leading-6" style={{ color: '#6B7280' }}>
        Create a claim to add your evidence, run the AI assessment, and prepare your legal notice.
      </p>

      <button
        onClick={onCreate}
        className="mt-7 flex h-11 items-center gap-2 rounded-2xl px-6 text-sm font-bold transition-all active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #84CC16, #65A300)',
          color: '#0B0D11',
          boxShadow: '0 8px 28px rgba(132,204,22,0.28)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 12px 36px rgba(132,204,22,0.45)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(132,204,22,0.28)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <Plus size={16} strokeWidth={3} />
        Create your first claim
      </button>
    </div>
  )
}
