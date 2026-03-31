import { useState } from 'react'

type Message = { role: 'user' | 'coach'; text: string }

export function AICoachPage() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'coach', text: "Hi! I'm your songwriting coach. Ask me about chord progressions, song structure, melody ideas, or music theory — I'll do my best to help." },
  ])
  const [loading, setLoading] = useState(false)

  const askCoach = async () => {
    if (!prompt.trim() || loading) return
    const userMsg: Message = { role: 'user', text: prompt }
    setMessages((prev) => [...prev, userMsg])
    setPrompt('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/v1/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'coach', text: data.response ?? 'No response received.' }])
    } catch {
      setMessages((prev) => [...prev, { role: 'coach', text: 'Backend is offline. Start the FastAPI server on port 8000 to enable the AI coach.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-card stack" style={{ height: 'calc(100vh - 6rem)', display: 'flex', flexDirection: 'column' }}>
      <div>
        <h2 className="page-title">AI Coach</h2>
        <p className="page-subtitle">Free, local-first songwriting and theory advice.</p>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.5rem 0' }}>
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
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '0.6rem 1rem', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="row" style={{ gap: '0.5rem' }}>
        <textarea
          rows={2}
          placeholder="Ask about progressions, structure, melody..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askCoach() } }}
          style={{ flex: 1, resize: 'none' }}
        />
        <button className="btn-primary" disabled={loading || !prompt.trim()} onClick={askCoach} style={{ alignSelf: 'flex-end', padding: '0.6rem 1rem' }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
    </div>
  )
}
