import { useState } from 'react'
import { Mail, Globe, FileDown, Check, Loader2, AlertCircle, Copy, ExternalLink } from 'lucide-react'
import { downloadComplaintPdf, getPortalData, sendComplaintEmail, getErrorMessage } from '../lib/api'

/**
 * ActionMenu({ caseId, draft, caseStatus })
 * Handles email, portal, and PDF template actions.
 */
export default function ActionMenu({ caseId, draft = {}, caseStatus }) {
  const [activeTab, setActiveTab]     = useState(null)
  const [emailForm, setEmailForm]     = useState({ name: '', phone: '', confirmed: false })
  const [emailState, setEmailState]   = useState({ loading: false, done: false, error: null })
  const [portalData, setPortalData]   = useState(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [copied, setCopied]           = useState({})

  const editedSubject = draft.subject || ''
  const editedBody    = draft.body    || ''

  /* ── Handlers ── */
  const handleSendEmail = async () => {
    if (!emailForm.confirmed) return
    setEmailState({ loading: true, done: false, error: null })
    try {
      await sendComplaintEmail(caseId, {
        confirm:      true,
        subject:      editedSubject,
        body:         editedBody,
        sender_name:  emailForm.name  || undefined,
        sender_phone: emailForm.phone || undefined,
      })
      setEmailState({ loading: false, done: true, error: null })
    } catch (err) {
      setEmailState({ loading: false, done: false, error: getErrorMessage(err) })
    }
  }

  const handleOpenPortal = async () => {
    setPortalLoading(true)
    try {
      const data = await getPortalData(caseId)
      setPortalData(data)
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setPortalLoading(false)
    }
  }

  const copyField = (key, value) => {
    navigator.clipboard.writeText(value || '').then(() => {
      setCopied((c) => ({ ...c, [key]: true }))
      setTimeout(() => setCopied((c) => ({ ...c, [key]: false })), 2000)
    })
  }

  const handleDownloadPdf = async () => {
    try {
      const blob = await downloadComplaintPdf(caseId)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'ClaimKaro_complaint.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  /* ── Tab button ── */
  const TabBtn = ({ id, label, icon: Icon }) => {
    const isActive = activeTab === id
    return (
      <button
        onClick={() => {
          setActiveTab(isActive ? null : id)
          if (id === 'portal' && !portalData) handleOpenPortal()
        }}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #84CC16, #65A300)'
            : 'rgba(28,32,48,0.8)',
          color: isActive ? '#0B0D11' : '#9196B0',
          border: isActive
            ? '1px solid transparent'
            : '1px solid rgba(132,204,22,0.10)',
          boxShadow: isActive ? '0 4px 16px rgba(132,204,22,0.25)' : 'none',
        }}
        onMouseEnter={e => {
          if (!isActive) { e.currentTarget.style.color = '#E8EAF6'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.22)' }
        }}
        onMouseLeave={e => {
          if (!isActive) { e.currentTarget.style.color = '#9196B0'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.10)' }
        }}
      >
        <Icon size={15} />
        {label}
      </button>
    )
  }

  /* ── Input field ── */
  const Field = ({ label, placeholder, value, onChange, type = 'text' }) => (
    <div>
      <label className="mb-1.5 block font-mono-ck text-[10px] uppercase tracking-widest" style={{ color: '#6B7280' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all placeholder:text-[#4a5070]"
        style={{
          background: 'rgba(28,32,48,0.8)',
          border: '1px solid rgba(132,204,22,0.10)',
          color: '#E8EAF6',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(132,204,22,0.35)' }}
        onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(132,204,22,0.10)' }}
      />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Tab row */}
      <div className="flex flex-wrap gap-3">
        <TabBtn id="email"  label="Send Email"    icon={Mail} />
        <TabBtn id="portal" label="Portal Guide"  icon={Globe} />
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
          style={{
            background: 'rgba(28,32,48,0.8)',
            color: '#9196B0',
            border: '1px solid rgba(132,204,22,0.10)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E8EAF6'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.22)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9196B0'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.10)' }}
        >
          <FileDown size={15} />
          Download PDF
        </button>
      </div>

      {/* ── Email panel ── */}
      {activeTab === 'email' && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(22,25,33,0.9)', border: '1px solid rgba(132,204,22,0.10)' }}
        >
          <h3 className="font-jakarta font-bold" style={{ color: '#E8EAF6' }}>
            Send Complaint Email
          </h3>

          {/* Recipient */}
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(28,32,48,0.8)', border: '1px solid rgba(132,204,22,0.08)' }}
          >
            <span className="font-mono-ck text-[10px] uppercase tracking-widest" style={{ color: '#6B7280' }}>
              Recipient:{' '}
            </span>
            <span style={{ color: '#E8EAF6' }}>
              {draft.to_email || <span style={{ color: '#4a5070', fontStyle: 'italic' }}>Company support (from policy)</span>}
            </span>
          </div>

          {emailState.done ? (
            <div
              className="flex items-center gap-3 rounded-xl p-4"
              style={{ background: 'rgba(132,204,22,0.08)', border: '1px solid rgba(132,204,22,0.20)' }}
            >
              <Check size={16} style={{ color: '#84CC16' }} />
              <p className="text-sm font-semibold" style={{ color: '#84CC16' }}>
                Complaint email sent successfully!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {emailState.error && (
                <div
                  className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.20)' }}
                >
                  <AlertCircle size={15} style={{ color: '#F87171', flexShrink: 0, marginTop: '1px' }} />
                  <p className="text-sm" style={{ color: '#FCA5A5' }}>{emailState.error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Your Name"
                  placeholder="Full name"
                  value={emailForm.name}
                  onChange={e => setEmailForm(f => ({ ...f, name: e.target.value }))}
                />
                <Field
                  label="Your Phone"
                  placeholder="Phone number"
                  value={emailForm.phone}
                  onChange={e => setEmailForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>

              {/* Confirm checkbox */}
              <label
                className="flex items-start gap-3 cursor-pointer rounded-xl p-3"
                style={{ background: 'rgba(28,32,48,0.5)' }}
              >
                <input
                  type="checkbox"
                  checked={emailForm.confirmed}
                  onChange={e => setEmailForm(f => ({ ...f, confirmed: e.target.checked }))}
                  className="mt-0.5"
                  style={{ accentColor: '#84CC16' }}
                />
                <span className="text-sm leading-relaxed" style={{ color: '#9196B0' }}>
                  I confirm sending this complaint email on my behalf.
                </span>
              </label>

              <button
                onClick={handleSendEmail}
                disabled={!emailForm.confirmed || emailState.loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #84CC16, #65A300)',
                  color: '#0B0D11',
                  boxShadow: '0 4px 16px rgba(132,204,22,0.25)',
                }}
              >
                {emailState.loading
                  ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                  : <><Mail size={15} /> Send Complaint Email</>
                }
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Portal panel ── */}
      {activeTab === 'portal' && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: 'rgba(22,25,33,0.9)', border: '1px solid rgba(132,204,22,0.10)' }}
        >
          {portalLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 size={16} className="animate-spin" style={{ color: '#84CC16' }} />
              <p className="text-sm" style={{ color: '#6B7280' }}>Loading portal info…</p>
            </div>
          ) : portalData ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-jakarta font-bold" style={{ color: '#E8EAF6' }}>
                    {portalData.label}
                  </h3>
                  <p className="mt-0.5 text-xs" style={{ color: '#6B7280' }}>
                    Copy the fields below, then submit on the portal.
                  </p>
                </div>
                <a
                  href={portalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #84CC16, #65A300)',
                    color: '#0B0D11',
                    boxShadow: '0 4px 16px rgba(132,204,22,0.22)',
                  }}
                >
                  Open Portal <ExternalLink size={13} />
                </a>
              </div>

              <ul className="space-y-2">
                {portalData.fields?.map((field) => (
                  <li
                    key={field.label}
                    className="flex items-center gap-3 rounded-xl p-3"
                    style={{ background: 'rgba(28,32,48,0.8)', border: '1px solid rgba(132,204,22,0.06)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-mono-ck text-[10px] uppercase tracking-widest" style={{ color: '#6B7280' }}>
                        {field.label}
                      </p>
                      <p className="mt-0.5 truncate text-sm" style={{ color: '#E8EAF6' }}>
                        {field.value}
                      </p>
                    </div>
                    <button
                      onClick={() => copyField(field.label, field.value)}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono-ck text-[10px] font-medium transition-colors"
                      style={{
                        background: copied[field.label] ? 'rgba(132,204,22,0.15)' : 'rgba(28,32,48,0.9)',
                        color: copied[field.label] ? '#84CC16' : '#6B7280',
                        border: `1px solid ${copied[field.label] ? 'rgba(132,204,22,0.25)' : 'rgba(132,204,22,0.08)'}`,
                      }}
                    >
                      {copied[field.label] ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Failed to load portal data. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
