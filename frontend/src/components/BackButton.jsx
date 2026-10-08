import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * BackButton: goes to the previous page in this app, or to `fallback`
 * when the user landed here directly (refresh, shared link).
 */
export default function BackButton({ fallback = '/cases', label = 'Back' }) {
  const navigate = useNavigate()

  const goBack = () => {
    const idx = window.history.state?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback)
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all"
      style={{
        background: 'rgba(28,32,48,0.7)',
        border: '1px solid rgba(132,204,22,0.10)',
        color: '#9196B0',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = '#E8EAF6'
        e.currentTarget.style.borderColor = 'rgba(132,204,22,0.25)'
        e.currentTarget.style.background = 'rgba(28,32,48,0.95)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = '#9196B0'
        e.currentTarget.style.borderColor = 'rgba(132,204,22,0.10)'
        e.currentTarget.style.background = 'rgba(28,32,48,0.7)'
      }}
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  )
}
