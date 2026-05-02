import { useState, useRef, useEffect, useCallback } from 'react'

type Message = { role: 'user' | 'coach'; text: string }

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'qwen/qwen3-coder:free',
]

const SYSTEM_PROMPT =
  'You are MusicMan Coach, an expert music and songwriting assistant. ' +
  'You help musicians with chord progressions, song structure, melody writing, ' +
  'harmony, rhythm, music theory, arrangement, lyrics, and production tips. ' +
  'Keep answers practical, encouraging, and concise (1-3 paragraphs). ' +
  'When appropriate, reference common patterns from pop, rock, jazz, R&B, folk, ' +
  'and classical traditions. If a user shares chords, a key, or a genre, ' +
  'tailor your advice specifically. Use plain language, but include music ' +
  'terminology when it clarifies. Format chord symbols like Cmaj7, Dm, G7, etc.'

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
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              opacity: 0.6,
              animation: `bounce 1.4s ${i * 0.15}s ease-in-out infinite`,
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

type ChatMsg = { role: string; text: string }

function buildOpenRouterMessages(history: ChatMsg[], prompt: string) {
  const messages: { role: string; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ]
  for (const msg of history) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })
  }
  messages.push({ role: 'user', content: prompt })
  return messages
}

async function fetchFromOpenRouter(
  prompt: string,
  history: ChatMsg[],
  signal: AbortSignal,
): Promise<string> {
  let lastErr = ''
  for (const model of OPENROUTER_MODELS) {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://musicman.app',
        'X-Title': 'MusicMan Coach',
      },
      body: JSON.stringify({
        model,
        messages: buildOpenRouterMessages(history, prompt),
        temperature: 0.7,
      }),
      signal,
    })

    if (res.status === 429 || res.status === 503) {
      lastErr = `${model} rate-limited (${res.status})`
      continue
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      lastErr = `${model} HTTP ${res.status}: ${body}`
      continue
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content
    if (text) return text
    lastErr = `${model} returned empty response`
  }
  throw new Error(`All models unavailable. Last: ${lastErr}`)
}

async function* streamFromBackend(
  prompt: string,
  history: ChatMsg[],
  signal: AbortSignal,
): AsyncGenerator<{ token?: string; done?: boolean; llm_active?: boolean }> {
  const res = await fetch('/api/v1/ai/coach/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history }),
    signal,
  })

  if (!res.ok || !res.body) throw new Error(`Backend HTTP ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6))
        if (data.token) yield { token: data.token }
        if (data.done) yield { done: true, llm_active: data.llm_active }
      } catch {
        /* skip */
      }
    }
  }
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
      try {
        const stream = streamFromBackend(prompt, history, controller.signal)
        const first = await stream.next()
        if (first.done && !first.value) throw new Error('empty')

        let coachText = ''
        let gotFirstToken = false

        const processChunk = (data: { token?: string; done?: boolean; llm_active?: boolean }) => {
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
          if (data.done && data.llm_active !== undefined) setLlmActive(data.llm_active)
        }

        if (first.value) processChunk(first.value)

        for await (const chunk of stream) {
          processChunk(chunk)
        }
        if (!gotFirstToken) {
          setMessages((prev) => [...prev, { role: 'coach', text: 'No response received.' }])
        }
        return
      } catch (backendErr) {
        if (backendErr instanceof DOMException && backendErr.name === 'AbortError') throw backendErr
        if (!OPENROUTER_KEY) throw backendErr
      }

      const text = await fetchFromOpenRouter(prompt, history, controller.signal)
      setLlmActive(true)
      setMessages((prev) => [...prev, { role: 'coach', text }])
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const errMsg = err instanceof Error ? err.message : String(err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'coach',
          text: OPENROUTER_KEY
            ? `Could not reach the AI service: ${errMsg}`
            : 'Backend is offline and no API key is configured. Start the FastAPI server on port 8000 or set VITE_OPENROUTER_API_KEY.',
        },
      ])
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [prompt, messages, streaming])

  return (
    <div
      className="page-card stack"
      style={{ height: 'calc(100dvh - 6rem)', maxHeight: 'calc(100dvh - 6rem)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="10" y="8" width="28" height="24" rx="6" transform="scale(0.6) translate(3, 2)" />
              <circle cx="9.6" cy="10.8" r="1.2" fill="white" />
              <circle cx="14.4" cy="10.8" r="1.2" fill="white" />
              <path d="M10.5 13.5c0.6 0.8 2.4 0.8 3 0" />
              <path d="M8 18v-2M16 18v-2" />
            </svg>
          </div>
          <div>
            <h2 className="page-title" style={{ marginBottom: 0 }}>AI Coach</h2>
            <p className="page-subtitle" style={{ marginBottom: 0, paddingBottom: 0 }}>Songwriting and theory advice powered by AI.</p>
          </div>
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
              maxWidth: 'min(80%, 600px)',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'var(--bg-elevated)',
              color: msg.role === 'user' ? '#fff' : 'var(--text-secondary)',
              border: msg.role === 'coach' ? '1px solid var(--border)' : 'none',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '0.6rem 0.85rem',
              fontSize: 'clamp(0.82rem, 2.5vw, 0.9rem)',
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
