import { useEffect, useRef, useState } from 'react'

import { AudioPlayer } from './AudioPlayer'
import { loadStoredIdeas, saveStoredIdeas, type StoredIdea } from './ideasStorage'

type Idea = {
  id: string
  text: string
  audioUrl?: string
  createdAt: string
}

function fmtDate(iso: string) {
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

function fmtTimer(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + '…'
}

function toStored(ideas: Idea[]): StoredIdea[] {
  return ideas.map((i) => ({ id: i.id, text: i.text, createdAt: i.createdAt, audioDataUrl: i.audioUrl }))
}

function fromStored(rows: StoredIdea[]): Idea[] {
  return rows.map((r) => ({ id: r.id, text: r.text, createdAt: r.createdAt, audioUrl: r.audioDataUrl }))
}

function readIdeasFromStorage(): Idea[] {
  if (typeof window === 'undefined') return []
  return fromStored(loadStoredIdeas())
}

function TapeReel({ spinning, size = 72 }: { spinning: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`tape-reel${spinning ? ' spinning' : ''}`}>
      <circle cx="50" cy="50" r="46" fill="#1a1714" stroke="#3a3530" strokeWidth="2" />
      <circle cx="50" cy="50" r="36" fill="#241f1a" />
      <circle cx="50" cy="50" r="28" fill="#1a1714" stroke="#2a2520" strokeWidth="1" />
      <g>
        <rect x="48" y="6" width="4" height="18" rx="2" fill="#3a3530" />
        <rect x="48" y="6" width="4" height="18" rx="2" fill="#3a3530" transform="rotate(120,50,50)" />
        <rect x="48" y="6" width="4" height="18" rx="2" fill="#3a3530" transform="rotate(240,50,50)" />
      </g>
      <circle cx="50" cy="50" r="12" fill="#0f0d0a" stroke="#2a2520" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="4" fill="#3a3530" />
    </svg>
  )
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

  useEffect(() => {
    try {
      saveStoredIdeas(toStored(ideas))
      setPersistError(null)
    } catch {
      setPersistError('Could not save — storage may be full. Try deleting older ideas.')
    }
  }, [ideas])

  const editingIdea = editingId ? ideas.find((i) => i.id === editingId) ?? null : null
  const isEditing = editingId !== null

  const clearDraft = () => {
    setText('')
    setEditingId(null)
  }

  const openIdea = (idea: Idea) => {
    setText(idea.text)
    setEditingId(idea.id)
  }

  const saveTextIdea = () => {
    if (!text.trim()) return
    if (editingId) {
      setIdeas((prev) => prev.map((i) => (i.id === editingId ? { ...i, text: text.trim() } : i)))
      setEditingId(null)
    } else {
      setIdeas((prev) => [{ id: crypto.randomUUID(), text: text.trim(), createdAt: new Date().toISOString() }, ...prev])
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
        if (editingId) {
          setIdeas((prev) =>
            prev.map((i) => (i.id === editingId ? { ...i, audioUrl: dataUrl, text: i.text || 'Voice memo' } : i)),
          )
        } else {
          setIdeas((prev) => [
            { id: crypto.randomUUID(), text: text.trim() || 'Voice memo', audioUrl: dataUrl, createdAt: new Date().toISOString() },
            ...prev,
          ])
          setText('')
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

  return (
    <div className="page-card stack ideas-page">
      <h2 className="page-title">Idea Capture</h2>
      <p className="page-subtitle">Record riffs, lyrics, and voice memos on the fly.</p>

      {persistError && (
        <p style={{ color: 'var(--danger)', fontSize: '0.82rem' }} role="alert">{persistError}</p>
      )}

      {/* ===== TAPE DECK ===== */}
      <div className="tape-deck">
        <div className="tape-window">
          <TapeReel spinning={isRecording} size={68} />
          <div className="tape-middle">
            <div className="tape-path">
              <div className={`tape-path-line${isRecording ? ' recording' : ''}`} />
            </div>
            <div className="tape-led-row">
              <span className={`tape-led${isRecording ? ' on' : ''}`} />
              <span className={`tape-led${isRecording ? ' on delay1' : ''}`} />
              <span className={`tape-led${isRecording ? ' on delay2' : ''}`} />
              <span className={`tape-led${isRecording ? ' on delay3' : ''}`} />
              <span className={`tape-led${isRecording ? ' on delay4' : ''}`} />
            </div>
          </div>
          <TapeReel spinning={isRecording} size={68} />
        </div>

        <div className="tape-display">
          <span className={`tape-status${isRecording ? ' rec' : ''}`}>
            {isRecording ? '● REC' : isEditing ? '✎ EDIT' : '■ READY'}
          </span>
          <span className="tape-timer">{isRecording ? fmtTimer(recTime) : '00:00'}</span>
        </div>

        <div className="tape-controls">
          {!isRecording ? (
            <button className="tape-btn tape-rec" onClick={startRecording} title="Record">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8" /></svg>
            </button>
          ) : (
            <button className="tape-btn tape-stop" onClick={stopRecording} title="Stop">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
            </button>
          )}
        </div>

        {isEditing && editingIdea?.audioUrl && !isRecording && (
          <div className="tape-playback">
            <span className="tape-playback-label">Saved recording</span>
            <AudioPlayer src={editingIdea.audioUrl} />
          </div>
        )}
      </div>

      {/* ===== CASSETTE LABEL / NOTE PAD ===== */}
      <div className="cassette-label">
        <div className="cassette-label-header">
          <span className="cassette-label-title">
            {isEditing ? `Editing: ${truncate(editingIdea!.text.split('\n')[0], 30)}` : 'New Idea'}
          </span>
          {isEditing && (
            <span className="cassette-label-date">{fmtDate(editingIdea!.createdAt)}</span>
          )}
        </div>
        <textarea
          rows={3}
          className="cassette-textarea"
          placeholder={isEditing ? 'Edit your idea…' : 'Lyrics, riff ideas, arrangement notes…'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveTextIdea()
          }}
        />
        <div className="cassette-actions">
          <button className="btn-primary btn-icon" onClick={saveTextIdea} disabled={!text.trim()}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
            </svg>
            {isEditing ? 'Update' : 'Save'}
          </button>
          {isEditing && (
            <button type="button" className="btn-ghost btn-icon" onClick={clearDraft}>Cancel</button>
          )}
          <span className="cassette-count">{ideas.length} tape{ideas.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ===== TAPE COLLECTION ===== */}
      {ideas.length > 0 && (
        <div className="tape-collection">
          <h3 className="tape-collection-title">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="3" /><circle cx="8" cy="12" r="3" /><circle cx="16" cy="12" r="3" /><path d="M11 12h2" /></svg>
            Tape Collection
          </h3>
          <div className="tape-list">
            {ideas.map((idea) => {
              const active = editingId === idea.id
              return (
                <div
                  key={idea.id}
                  className={`tape-card${active ? ' active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => openIdea(idea)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIdea(idea) } }}
                >
                  <div className="tape-card-reel">
                    <svg viewBox="0 0 40 40" width={28} height={28}>
                      <circle cx="20" cy="20" r="18" fill="#1a1714" stroke="#3a3530" strokeWidth="1.5" />
                      <circle cx="20" cy="20" r="10" fill="#241f1a" />
                      <circle cx="20" cy="20" r="5" fill="#0f0d0a" />
                      <circle cx="20" cy="20" r="2" fill="#3a3530" />
                    </svg>
                  </div>
                  <div className="tape-card-body">
                    <div className="tape-card-top">
                      <span className="tape-card-title">{truncate(idea.text.split('\n')[0], 50)}</span>
                      <div className="tape-card-badges">
                        {active && <span className="tape-card-badge editing">Editing</span>}
                        {idea.audioUrl && (
                          <span className="tape-card-badge audio" title="Has recording">
                            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="tape-card-date">{fmtDate(idea.createdAt)}</span>
                    {idea.text.includes('\n') && (
                      <p className="tape-card-preview">{truncate(idea.text.split('\n').slice(1).join(' ').trim(), 80)}</p>
                    )}
                    {idea.audioUrl && !active && (
                      <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        <AudioPlayer src={idea.audioUrl} />
                      </div>
                    )}
                  </div>
                  <button
                    className="tape-card-delete"
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteIdea(idea.id) }}
                    title="Delete"
                  >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {ideas.length === 0 && (
        <div className="tape-empty">
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.3}>
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <circle cx="8" cy="12" r="3" /><circle cx="16" cy="12" r="3" />
            <path d="M11 12h2" />
          </svg>
          <p>No tapes yet. Hit the red button to record or type a note below.</p>
        </div>
      )}
    </div>
  )
}
