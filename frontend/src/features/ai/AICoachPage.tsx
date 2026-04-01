import { useState, useRef, useEffect, useCallback } from 'react'

type Message = { role: 'user' | 'coach'; text: string }

function ThinkingBubble() {
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        maxWidth: '80%',
        padding: '0.75rem 1.1rem',
        background: 'var(--bg-elevated)',
        borderRadius: '16px 16px 16px 4px',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
      }}
    >
      <span style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--accent)',
              opacity: 0.5,
              animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
            }}
          />
        ))}
      </span>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '0.3rem' }}>
        Composing a response…
      </span>
    </div>
  )
}

export function AICoachPage() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'coach',
      text: "Hi! I'm your songwriting coach. Ask me about chord progressions, song structure, melody ideas, or music theory — I'll do my best to help.",
    },
  ])
  const [streaming, setStreaming] = useState(false)
  const [llmActive, setLlmActive] = useState<boolean | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const askCoach = useCallback(async () => {
    if (!prompt.trim() || streaming) return
    const userMsg: Message = { role: 'user', text: prompt }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setPrompt('')
    setStreaming(true)

    const history = updatedMessages
      .filter((_, idx) => idx !== 0)
      .map((m) => ({ role: m.role, text: m.text }))

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/v1/ai/coach/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let coachText = ''
      let gotFirstToken = false

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.token) {
              coachText += data.token
              if (!gotFirstToken) {
                gotFirstToken = true
                setMessages((prev) => [...prev, { role: 'coach', text: coachText }])
              } else {
                setMessages((prev) => {
                  const copy = [...prev]
                  copy[copy.length - 1] = { role: 'coach', text: coachText }
                  return copy
                })
              }
            }
            if (data.done) {
              if (data.llm_active !== undefined) setLlmActive(data.llm_active)
            }
          } catch {
            /* skip malformed lines */
          }
        }
      }

      if (!gotFirstToken) {
        setMessages((prev) => [...prev, { role: 'coach', text: 'No response received.' }])
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setMessages((prev) => [
        ...prev,
        { role: 'coach', text: 'Backend is offline. Start the FastAPI server on port 8000 to enable the AI coach.' },
      ])
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [prompt, messages, streaming])

  return (
    <div
      className="page-card stack"
      style={{ height: 'calc(100vh - 6rem)', display: 'flex', flexDirection: 'column' }}
    >
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">AI Coach</h2>
          <p className="page-subtitle">Songwriting and theory advice powered by AI.</p>
        </div>
        {llmActive !== null && (
          <span
            style={{
              fontSize: '0.7rem',
              padding: '0.25rem 0.6rem',
              borderRadius: 12,
              background: llmActive ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
              color: llmActive ? '#22c55e' : '#eab308',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {llmActive ? 'AI powered' : 'Basic mode'}
          </span>
        )}
      </div>

      {/* Chat area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          padding: '0.5rem 0',
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
              color: msg.role === 'user' ? '#fff' : 'var(--text-secondary)',
              border: msg.role === 'coach' ? '1px solid var(--border)' : 'none',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.text}
          </div>
        ))}
        {streaming && messages[messages.length - 1]?.role !== 'coach' && <ThinkingBubble />}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="row" style={{ gap: '0.5rem' }}>
        <textarea
          rows={2}
          placeholder="Ask about progressions, structure, melody..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              askCoach()
            }
          }}
          style={{ flex: 1, resize: 'none' }}
        />
        <button
          className="btn-primary"
          disabled={streaming || !prompt.trim()}
          onClick={askCoach}
          style={{ alignSelf: 'flex-end', padding: '0.6rem 1rem' }}
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
