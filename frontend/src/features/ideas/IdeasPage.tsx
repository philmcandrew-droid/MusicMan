import { useEffect, useRef, useState } from 'react'

import { loadStoredIdeas, saveStoredIdeas, type StoredIdea } from './ideasStorage'

type Idea = {
  id: string
  text: string
  audioUrl?: string
  createdAt: string
}

function formatCreatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function toStored(ideas: Idea[]): StoredIdea[] {
  return ideas.map((i) => ({
    id: i.id,
    text: i.text,
    createdAt: i.createdAt,
    audioDataUrl: i.audioUrl,
  }))
}

function fromStored(rows: StoredIdea[]): Idea[] {
  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    createdAt: r.createdAt,
    audioUrl: r.audioDataUrl,
  }))
}

function readIdeasFromStorage(): Idea[] {
  if (typeof window === 'undefined') return []
  return fromStored(loadStoredIdeas())
}

export function IdeasPage() {
  const [text, setText] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>(readIdeasFromStorage)
  const [persistError, setPersistError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recTime, setRecTime] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef(0)

  useEffect(() => {
    try {
      saveStoredIdeas(toStored(ideas))
      setPersistError(null)
    } catch {
      setPersistError('Could not save (storage may be full). Try deleting older ideas.')
    }
  }, [ideas])

  const saveTextIdea = () => {
    if (!text.trim()) return
    const now = new Date().toISOString()
    setIdeas((prev) => [{ id: crypto.randomUUID(), text: text.trim(), createdAt: now }, ...prev])
    setText('')
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    recorderRef.current = recorder
    chunksRef.current = []
    setRecTime(0)

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result
        if (typeof dataUrl !== 'string') return
        const now = new Date().toISOString()
        setIdeas((prev) => [
          { id: crypto.randomUUID(), text: 'Voice memo', audioUrl: dataUrl, createdAt: now },
          ...prev,
        ])
      }
      reader.readAsDataURL(blob)
      clearInterval(timerRef.current)
      stream.getTracks().forEach((t) => t.stop())
    }
    recorder.start()
    setIsRecording(true)
    timerRef.current = window.setInterval(() => setRecTime((t) => t + 1), 1000)
  }

  const stopRecording = () => {
    recorderRef.current?.stop()
    setIsRecording(false)
  }

  const deleteIdea = (id: string) => setIdeas((prev) => prev.filter((i) => i.id !== id))

  return (
    <div className="page-card stack">
      <h2 className="page-title">Idea Capture</h2>
      <p className="page-subtitle">Jot down lyrics, riff ideas, or record voice memos on the fly.</p>

      {persistError && (
        <p style={{ color: 'var(--danger, #ef4444)', fontSize: '0.85rem' }} role="alert">
          {persistError}
        </p>
      )}

      <textarea
        rows={4}
        placeholder="Type lyrics, hook ideas, arrangement notes..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveTextIdea()
        }}
      />

      <div className="row">
        <button className="btn-primary btn-icon" onClick={saveTextIdea} disabled={!text.trim()}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
          </svg>
          Save Note
        </button>

        {!isRecording ? (
          <button className="btn-ghost btn-icon" onClick={startRecording}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
            Record Voice
          </button>
        ) : (
          <button
            className="btn-icon"
            onClick={stopRecording}
            style={{ background: '#ef4444', color: '#fff', border: 'none', animation: 'pulse 1.5s infinite' }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop ({recTime}s)
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {ideas.length} idea{ideas.length !== 1 ? 's' : ''} saved
        </span>
      </div>

      <div className="stack" style={{ gap: '0.6rem' }}>
        {ideas.map((idea) => (
          <div key={idea.id} className="idea-card">
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formatCreatedAt(idea.createdAt)}
              </span>
              <button
                className="remove"
                type="button"
                onClick={() => deleteIdea(idea.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                title="Delete"
              >
                &times;
              </button>
            </div>
            <p style={{ fontSize: '0.9rem' }}>{idea.text}</p>
            {idea.audioUrl && <audio controls src={idea.audioUrl} style={{ marginTop: '0.5rem', width: '100%', maxWidth: '100%' }} />}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  )
}
