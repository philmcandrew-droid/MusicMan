import { useEffect, useRef, useState } from 'react'

import { AudioPlayer } from './AudioPlayer'
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

function truncate(s: string, max: number) {
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + '…'
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [persistError, setPersistError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recTime, setRecTime] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef(0)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      saveStoredIdeas(toStored(ideas))
      setPersistError(null)
    } catch {
      setPersistError('Could not save (storage may be full). Try deleting older ideas.')
    }
  }, [ideas])

  const editingIdea = editingId ? ideas.find((i) => i.id === editingId) ?? null : null

  const clearDraft = () => {
    setText('')
    setEditingId(null)
  }

  const openIdea = (idea: Idea) => {
    setText(idea.text)
    setEditingId(idea.id)
    setTimeout(() => editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const saveTextIdea = () => {
    if (!text.trim()) return
    if (editingId) {
      setIdeas((prev) =>
        prev.map((i) => (i.id === editingId ? { ...i, text: text.trim(), createdAt: i.createdAt } : i)),
      )
      setEditingId(null)
    } else {
      const now = new Date().toISOString()
      setIdeas((prev) => [{ id: crypto.randomUUID(), text: text.trim(), createdAt: now }, ...prev])
    }
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
        if (editingId) {
          setIdeas((prev) =>
            prev.map((i) =>
              i.id === editingId
                ? { ...i, audioUrl: dataUrl, text: i.text || 'Voice memo', createdAt: i.createdAt }
                : i,
            ),
          )
        } else {
          setIdeas((prev) => [
            { id: crypto.randomUUID(), text: 'Voice memo', audioUrl: dataUrl, createdAt: now },
            ...prev,
          ])
        }
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

  const deleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id))
    if (editingId === id) clearDraft()
  }

  const isEditing = editingId !== null
  const editTitle = editingIdea ? truncate(editingIdea.text.split('\n')[0], 40) : ''

  return (
    <div className="page-card stack">
      <div ref={editorRef}>
        <h2 className="page-title">
          Idea Capture
          {isEditing && editTitle && (
            <span className="idea-editing-label"> — {editTitle}</span>
          )}
        </h2>
        <p className="page-subtitle">
          {isEditing
            ? 'Editing your idea. Update the text or replace the recording below.'
            : 'Jot down lyrics, riff ideas, or record voice memos on the fly.'}
        </p>
      </div>

      {persistError && (
        <p style={{ color: 'var(--danger, #ef4444)', fontSize: '0.85rem' }} role="alert">
          {persistError}
        </p>
      )}

      {isEditing && (
        <div className="idea-edit-banner">
          <div className="idea-edit-banner-header">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Editing: <strong>{editTitle}</strong></span>
            <span className="idea-edit-banner-date">{formatCreatedAt(editingIdea!.createdAt)}</span>
            <button type="button" className="idea-edit-close" onClick={clearDraft} title="Close">
              &times;
            </button>
          </div>
          {editingIdea!.audioUrl && (
            <div className="idea-edit-audio">
              <span className="idea-edit-audio-label">Saved recording</span>
              <AudioPlayer src={editingIdea!.audioUrl} />
            </div>
          )}
        </div>
      )}

      <textarea
        rows={4}
        placeholder={isEditing ? 'Edit your idea text...' : 'Type lyrics, hook ideas, arrangement notes...'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveTextIdea()
        }}
      />

      <div className="row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <button className="btn-primary btn-icon" onClick={saveTextIdea} disabled={!text.trim()}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
          </svg>
          {isEditing ? 'Update' : 'Save'}
        </button>

        {isEditing && (
          <button type="button" className="btn-ghost btn-icon" onClick={clearDraft}>
            Cancel
          </button>
        )}

        {!isRecording ? (
          <button className="btn-ghost btn-icon" onClick={startRecording}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
            {isEditing && editingIdea?.audioUrl ? 'Re-record' : 'Record'}
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

      {ideas.length > 0 && (
        <h3 className="idea-list-heading">Saved Ideas</h3>
      )}

      <div className="stack" style={{ gap: '0.6rem' }}>
        {ideas.map((idea) => {
          const active = editingId === idea.id
          return (
            <div
              key={idea.id}
              className={`idea-card${active ? ' idea-card-active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => openIdea(idea)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openIdea(idea)
                }
              }}
            >
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatCreatedAt(idea.createdAt)}
                </span>
                <div className="row" style={{ gap: '0.35rem' }}>
                  {active ? (
                    <span className="idea-status-badge">Editing</span>
                  ) : (
                    <span className="idea-open-link">Open</span>
                  )}
                  {idea.audioUrl && (
                    <span className="idea-has-audio" title="Has recording">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      </svg>
                    </span>
                  )}
                  <button
                    className="remove"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteIdea(idea.id)
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                    title="Delete"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{idea.text}</p>
              {idea.audioUrl && !active && (
                <AudioPlayer
                  src={idea.audioUrl}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              )}
            </div>
          )
        })}
      </div>

      {ideas.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
          No ideas yet. Type a note or record a voice memo to get started.
        </p>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  )
}
