import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { apiClient, type Offer } from '../services/api'

// ── Types ─────────────────────────────────────────────────────
interface Message {
  id: number
  role: 'bot' | 'user'
  text: string
  offers?: Offer[]
}

const STORAGE_KEY = 'jobryx_chat_v1'
const MAX_PERSISTED = 20

const WELCOME: Message = {
  id: 1,
  role: 'bot',
  text:
    "Salut 👋 Je suis l'assistant Jobryx. Décris ce que tu cherches en français — " +
    "techno, ville, type de contrat — et je te ramène les offres qui collent.\n\n" +
    "Exemples :\n• stage React Paris\n• alternance Python\n• CDI fullstack",
}

const SUGGESTIONS = [
  'stage React Paris',
  'alternance Python',
  'CDI Go',
  'freelance frontend',
]

const CONTRACT_LABEL: Record<Offer['contract'], string> = {
  CDI:        'CDI',
  STAGE:      'Stage',
  ALTERNANCE: 'Alternance',
  FREELANCE:  'Freelance',
}

// ── Inline SVG icons ──────────────────────────────────────────
const ChatIcon = (props: { size?: number }) => (
  <svg width={props.size ?? 22} height={props.size ?? 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const CloseIcon = (props: { size?: number }) => (
  <svg width={props.size ?? 18} height={props.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
const SendIcon = (props: { size?: number }) => (
  <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
  </svg>
)
const PinIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

// ── Component ─────────────────────────────────────────────────
export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Message[]
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch { /* ignore */ }
    return [WELCOME]
  })

  const scrollerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Seed the counter past any persisted message id so new ids never collide.
  const idCounterRef = useRef(messages.reduce((max, m) => Math.max(max, m.id), 0) + 1)

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_PERSISTED)))
    } catch { /* quota */ }
  }, [messages])

  // Auto-scroll on new messages / open
  useEffect(() => {
    if (open) {
      scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, loading, open])

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // ESC closes
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userId = idCounterRef.current++
    setMessages(m => [...m, { id: userId, role: 'user', text: trimmed }])
    setInput('')
    setLoading(true)

    try {
      const r = await apiClient.chat(trimmed)
      const botId = idCounterRef.current++
      setMessages(m => [
        ...m,
        { id: botId, role: 'bot', text: r.reply, offers: r.offers },
      ])
    } catch {
      const botId = idCounterRef.current++
      setMessages(m => [
        ...m,
        { id: botId, role: 'bot', text: "Le service n'est pas joignable. Réessaie dans un instant." },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  function reset() {
    setMessages([{ ...WELCOME }])
    idCounterRef.current = 2
    localStorage.removeItem(STORAGE_KEY)
  }

  const showSuggestions = messages.length <= 1 && !loading

  return (
    <>
      {/* Floating toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant Jobryx"}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-fg)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.4)',
        }}
      >
        {open ? <CloseIcon size={22} /> : <ChatIcon size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Assistant Jobryx"
          className="fixed z-[59] anim-fade-up bottom-24 right-6 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: 'min(380px, calc(100vw - 3rem))',
            height: 'min(560px, calc(100vh - 8rem))',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 28px 60px rgba(0,0,0,0.55)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm"
                style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
              >J</div>
              <div className="min-w-0">
                <div className="font-display font-bold text-sm leading-tight" style={{ color: 'var(--text)' }}>
                  Assistant Jobryx
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.15em] flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                  En ligne · Beta
                </div>
              </div>
            </div>
            <button
              onClick={reset}
              aria-label="Recommencer la conversation"
              title="Recommencer"
              className="text-base font-mono px-2 py-1 rounded transition-colors"
              style={{ color: 'var(--text-3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
            >↻</button>
          </div>

          {/* Messages */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ background: 'var(--bg)' }}>
            {messages.map(m => (
              <div key={m.id} className={`max-w-[85%] flex flex-col gap-2 ${m.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                <div
                  className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                  style={
                    m.role === 'user'
                      ? { background: 'var(--accent)', color: 'var(--accent-fg)', borderBottomRightRadius: 4 }
                      : { background: 'var(--bg-surface)', color: 'var(--text)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }
                  }
                >{m.text}</div>

                {m.offers && m.offers.length > 0 && (
                  <div className="w-full flex flex-col gap-2">
                    {m.offers.map(offer => (
                      <Link
                        key={offer.id}
                        to={`/dashboard?contract=${offer.contract}&q=${encodeURIComponent(offer.title)}`}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-2.5 transition-colors"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <div className="font-display font-semibold text-[13px] leading-snug" style={{ color: 'var(--text)' }}>
                          {offer.title}
                        </div>
                        <div className="mt-1 text-[11px] truncate" style={{ color: 'var(--text-2)' }}>
                          {offer.company}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span
                            className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
                            style={{
                              background: 'rgba(200,255,62,0.1)',
                              color: 'var(--accent)',
                              border: '1px solid rgba(200,255,62,0.25)',
                            }}
                          >
                            {CONTRACT_LABEL[offer.contract]}
                          </span>
                          {offer.location && (
                            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                              <PinIcon />
                              {offer.location}
                            </span>
                          )}
                          {offer.tags.slice(0, 2).map(t => (
                            <span key={t} className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ color: 'var(--text-3)', background: 'var(--bg-raised)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="self-start max-w-[85%]">
                <div
                  className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-3)', animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-3)', animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-3)', animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {showSuggestions && (
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="px-3 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-[0.1em] transition-colors"
                    style={{ background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-raised)' }}
          >
            <label htmlFor="chatbot-input" className="sr-only">Message</label>
            <input
              id="chatbot-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ex : stage React Paris…"
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Envoyer"
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              <SendIcon size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
