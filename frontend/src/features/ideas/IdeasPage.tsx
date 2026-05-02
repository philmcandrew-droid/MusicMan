import { useCallback, useEffect, useRef, useState } from 'react'

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
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

function fmtTimer(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

function truncate(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max).trimEnd() + '…'
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

function createReverbIR(ctx: AudioContext, duration = 2.5, decay = 3): AudioBuffer {
  const length = ctx.sampleRate * duration
  const buf = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  return buf
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
  const [searchQuery, setSearchQuery] = useState('')

  // Deck playback state
  const [deckAudioUrl, setDeckAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playTime, setPlayTime] = useState(0)
  const [reverbOn, setReverbOn] = useState(false)
  const [reverbAmt, setReverbAmt] = useState(40)
  const [delayOn, setDelayOn] = useState(false)
  const [delayAmt, setDelayAmt] = useState(35)
  const [eqBass, setEqBass] = useState(0)
  const [eqMid, setEqMid] = useState(0)
  const [eqTreble, setEqTreble] = useState(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const recTimerRef = useRef(0)
  const deckCtxRef = useRef<AudioContext | null>(null)
  const deckSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const playTimerRef = useRef(0)

  const fxRef = useRef<{
    bass: BiquadFilterNode
    mid: BiquadFilterNode
    treble: BiquadFilterNode
    delayNode: DelayNode
    delayWet: GainNode
    delayDry: GainNode
    delayFeedback: GainNode
    reverbWet: GainNode
    reverbDry: GainNode
  } | null>(null)

  useEffect(() => {
    try {
      saveStoredIdeas(toStored(ideas))
      setPersistError(null)
    } catch {
      setPersistError('Could not save — storage may be full. Try deleting older ideas.')
    }
  }, [ideas])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(0)
      clearInterval(playTimerRef.current)
      deckSourceRef.current?.stop()
      deckCtxRef.current?.close()
    }
  }, [])

  // Live-update EQ during playback
  useEffect(() => {
    const fx = fxRef.current
    if (!fx) return
    fx.bass.gain.value = eqBass
    fx.mid.gain.value = eqMid
    fx.treble.gain.value = eqTreble
  }, [eqBass, eqMid, eqTreble])

  // Live-update delay params during playback
  useEffect(() => {
    const fx = fxRef.current
    if (!fx) return
    const mix = delayOn ? delayAmt / 100 : 0
    fx.delayDry.gain.value = 1 - mix * 0.4
    fx.delayNode.delayTime.value = 0.15 + (delayAmt / 100) * 0.45
    fx.delayWet.gain.value = mix * 0.7
    fx.delayFeedback.gain.value = mix * 0.55
  }, [delayOn, delayAmt])

  // Live-update reverb params during playback
  useEffect(() => {
    const fx = fxRef.current
    if (!fx) return
    const mix = reverbOn ? reverbAmt / 100 : 0
    fx.reverbDry.gain.value = 1 - mix * 0.5
    fx.reverbWet.gain.value = mix * 0.7
  }, [reverbOn, reverbAmt])

  const editingIdea = editingId ? ideas.find((i) => i.id === editingId) ?? null : null
  const isEditing = editingId !== null
  const reelsActive = isRecording || isPlaying

  const stopDeck = useCallback(() => {
    try { deckSourceRef.current?.stop() } catch {}
    deckSourceRef.current = null
    deckCtxRef.current?.close()
    deckCtxRef.current = null
    clearInterval(playTimerRef.current)
    setIsPlaying(false)
    setPlayTime(0)
  }, [])

  const playDeck = useCallback(async () => {
    const url = deckAudioUrl
    if (!url) return
    stopDeck()
    fxRef.current = null

    const ctx = new AudioContext()
    deckCtxRef.current = ctx

    let arrayBuf: ArrayBuffer
    try {
      const resp = await fetch(url)
      arrayBuf = await resp.arrayBuffer()
    } catch {
      ctx.close()
      return
    }

    let audioBuf: AudioBuffer
    try {
      audioBuf = await ctx.decodeAudioData(arrayBuf)
    } catch {
      ctx.close()
      return
    }

    const source = ctx.createBufferSource()
    source.buffer = audioBuf
    deckSourceRef.current = source

    // EQ stage (always active)
    const bass = ctx.createBiquadFilter()
    bass.type = 'lowshelf'
    bass.frequency.value = 200
    bass.gain.value = eqBass

    const mid = ctx.createBiquadFilter()
    mid.type = 'peaking'
    mid.frequency.value = 1000
    mid.Q.value = 0.8
    mid.gain.value = eqMid

    const treble = ctx.createBiquadFilter()
    treble.type = 'highshelf'
    treble.frequency.value = 4000
    treble.gain.value = eqTreble

    source.connect(bass)
    bass.connect(mid)
    mid.connect(treble)

    // Delay stage (always wired, controlled by gain nodes)
    const dMix = delayOn ? delayAmt / 100 : 0
    const delayDry = ctx.createGain()
    delayDry.gain.value = 1 - dMix * 0.4
    const delayNode = ctx.createDelay(1)
    delayNode.delayTime.value = 0.15 + (delayAmt / 100) * 0.45
    const delayWet = ctx.createGain()
    delayWet.gain.value = dMix * 0.7
    const delayFeedback = ctx.createGain()
    delayFeedback.gain.value = dMix * 0.55
    const delayMerge = ctx.createGain()

    treble.connect(delayDry)
    treble.connect(delayNode)
    delayNode.connect(delayWet)
    delayNode.connect(delayFeedback)
    delayFeedback.connect(delayNode)
    delayDry.connect(delayMerge)
    delayWet.connect(delayMerge)

    // Reverb stage (always wired, controlled by gain nodes)
    const rMix = reverbOn ? reverbAmt / 100 : 0
    const reverbDry = ctx.createGain()
    reverbDry.gain.value = 1 - rMix * 0.5
    const convolver = ctx.createConvolver()
    convolver.buffer = createReverbIR(ctx, 3, 3)
    const reverbWet = ctx.createGain()
    reverbWet.gain.value = rMix * 0.7
    const reverbMerge = ctx.createGain()

    delayMerge.connect(reverbDry)
    delayMerge.connect(convolver)
    convolver.connect(reverbWet)
    reverbDry.connect(reverbMerge)
    reverbWet.connect(reverbMerge)

    reverbMerge.connect(ctx.destination)

    fxRef.current = { bass, mid, treble, delayNode, delayWet, delayDry, delayFeedback, reverbWet, reverbDry }

    source.onended = () => {
      clearInterval(playTimerRef.current)
      setIsPlaying(false)
      setPlayTime(0)
      fxRef.current = null
    }

    const startTime = ctx.currentTime
    source.start()
    setIsPlaying(true)
    setPlayTime(0)
    playTimerRef.current = window.setInterval(() => {
      if (deckCtxRef.current) {
        setPlayTime(Math.floor(deckCtxRef.current.currentTime - startTime))
      }
    }, 250)
  }, [deckAudioUrl, stopDeck, eqBass, eqMid, eqTreble, delayOn, delayAmt, reverbOn, reverbAmt])

  const clearDraft = () => {
    setText('')
    setEditingId(null)
    stopDeck()
    setDeckAudioUrl(null)
  }

  const openIdea = (idea: Idea) => {
    stopDeck()
    setText(idea.text)
    setEditingId(idea.id)
    setDeckAudioUrl(idea.audioUrl || null)
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
    stopDeck()
    setDeckAudioUrl(null)
  }

  const startRecording = async () => {
    stopDeck()
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
        setDeckAudioUrl(dataUrl)
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
      clearInterval(recTimerRef.current)
      stream.getTracks().forEach((t) => t.stop())
    }
    recorder.start()
    setIsRecording(true)
    recTimerRef.current = window.setInterval(() => setRecTime((t) => t + 1), 1000)
  }

  const stopRecording = () => {
    recorderRef.current?.stop()
    setIsRecording(false)
  }

  const deleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id))
    if (editingId === id) clearDraft()
  }

  const toggleReverb = () => setReverbOn((v) => !v)
  const toggleDelay = () => setDelayOn((v) => !v)

  const hasDeckAudio = !!deckAudioUrl

  const filteredIdeas = searchQuery.trim()
    ? ideas.filter((i) => i.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : ideas

  // Determine status text
  let statusText = '■ READY'
  let statusClass = ''
  if (isRecording) { statusText = '● REC'; statusClass = ' rec' }
  else if (isPlaying) { statusText = '▶ PLAY'; statusClass = ' play' }
  else if (hasDeckAudio) { statusText = '▮▮ STOP'; statusClass = '' }
  else if (isEditing) { statusText = '✎ EDIT'; statusClass = '' }

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
          <TapeReel spinning={reelsActive} size={68} />
          <div className="tape-middle">
            <div className="tape-path">
              <div className={`tape-path-line${isRecording ? ' recording' : isPlaying ? ' playing' : ''}`} />
            </div>
            <div className="tape-led-row">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={`tape-led${reelsActive ? ` on${i > 0 ? ` delay${i}` : ''}` : ''}`} />
              ))}
            </div>
          </div>
          <TapeReel spinning={reelsActive} size={68} />
        </div>

        <div className="tape-display">
          <span className={`tape-status${statusClass}`}>{statusText}</span>
          <span className="tape-timer">
            {isRecording ? fmtTimer(recTime) : isPlaying ? fmtTimer(playTime) : hasDeckAudio ? '▶ READY' : '00:00'}
          </span>
        </div>

        {/* Transport controls */}
        <div className="tape-controls">
          {!isRecording && !isPlaying && (
            <button className="tape-btn tape-rec" onClick={startRecording} title="Record">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8" /></svg>
            </button>
          )}
          {isRecording && (
            <button className="tape-btn tape-stop" onClick={stopRecording} title="Stop recording">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
            </button>
          )}
          {!isRecording && hasDeckAudio && !isPlaying && (
            <button className="tape-btn tape-play" onClick={playDeck} title="Play">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20" /></svg>
            </button>
          )}
          {isPlaying && (
            <button className="tape-btn tape-stop" onClick={stopDeck} title="Stop playback">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
            </button>
          )}
        </div>

        {/* Effects strip */}
        <div className="tape-fx-strip">
          <span className="tape-fx-label">FX</span>

          <div className={`tape-fx-channel${reverbOn ? ' active' : ''}`}>
            <button className={`tape-fx-btn${reverbOn ? ' active' : ''}`} onClick={toggleReverb} title="Toggle reverb">
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12c0-4 3-8 10-8s10 4 10 8-3 8-10 8S2 16 2 12z" /><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>
              Reverb
            </button>
            {reverbOn && (
              <div className="tape-knob-wrap">
                <input
                  type="range" className="tape-knob" min={5} max={100} value={reverbAmt}
                  onChange={(e) => setReverbAmt(Number(e.target.value))}
                  title={`Reverb: ${reverbAmt}%`}
                />
                <span className="tape-knob-val">{reverbAmt}%</span>
              </div>
            )}
          </div>

          <div className={`tape-fx-channel${delayOn ? ' active' : ''}`}>
            <button className={`tape-fx-btn${delayOn ? ' active' : ''}`} onClick={toggleDelay} title="Toggle delay">
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16" /><path d="M8 8h12" opacity="0.5" /><path d="M12 4h8" opacity="0.25" /></svg>
              Delay
            </button>
            {delayOn && (
              <div className="tape-knob-wrap">
                <input
                  type="range" className="tape-knob" min={5} max={100} value={delayAmt}
                  onChange={(e) => setDelayAmt(Number(e.target.value))}
                  title={`Delay: ${delayAmt}%`}
                />
                <span className="tape-knob-val">{delayAmt}%</span>
              </div>
            )}
          </div>
        </div>

        {/* EQ panel */}
        <div className="tape-eq-panel">
          <span className="tape-eq-title">EQ</span>
          <div className="tape-eq-bands">
            <div className="tape-eq-band">
              <input
                type="range" className="tape-eq-slider" min={-12} max={12} step={1} value={eqBass}
                onChange={(e) => setEqBass(Number(e.target.value))}
                title={`Bass: ${eqBass > 0 ? '+' : ''}${eqBass} dB`}
              />
              <span className="tape-eq-val">{eqBass > 0 ? '+' : ''}{eqBass}</span>
              <span className="tape-eq-label">Bass</span>
            </div>
            <div className="tape-eq-band">
              <input
                type="range" className="tape-eq-slider" min={-12} max={12} step={1} value={eqMid}
                onChange={(e) => setEqMid(Number(e.target.value))}
                title={`Mid: ${eqMid > 0 ? '+' : ''}${eqMid} dB`}
              />
              <span className="tape-eq-val">{eqMid > 0 ? '+' : ''}{eqMid}</span>
              <span className="tape-eq-label">Mid</span>
            </div>
            <div className="tape-eq-band">
              <input
                type="range" className="tape-eq-slider" min={-12} max={12} step={1} value={eqTreble}
                onChange={(e) => setEqTreble(Number(e.target.value))}
                title={`Treble: ${eqTreble > 0 ? '+' : ''}${eqTreble} dB`}
              />
              <span className="tape-eq-val">{eqTreble > 0 ? '+' : ''}{eqTreble}</span>
              <span className="tape-eq-label">Treble</span>
            </div>
          </div>
        </div>

        {/* Inline playback for editing (without effects — use deck play for effects) */}
        {isEditing && editingIdea?.audioUrl && !isRecording && !isPlaying && (
          <div className="tape-playback">
            <span className="tape-playback-label">Saved recording (dry)</span>
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
          {isEditing && <span className="cassette-label-date">{fmtDate(editingIdea!.createdAt)}</span>}
        </div>
        <textarea
          rows={3}
          className="cassette-textarea"
          placeholder={isEditing ? 'Edit your idea…' : 'Lyrics, riff ideas, arrangement notes…'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveTextIdea() }}
        />
        <div className="cassette-actions">
          <button className="btn-primary btn-icon" onClick={saveTextIdea} disabled={!text.trim()}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
            </svg>
            {isEditing ? 'Update' : 'Save'}
          </button>
          {isEditing && <button type="button" className="btn-ghost btn-icon" onClick={clearDraft}>Cancel</button>}
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

          {/* Search */}
          <div className="tape-search">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              className="tape-search-input"
              placeholder="Search tapes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="tape-search-clear" onClick={() => setSearchQuery('')} type="button">&times;</button>
            )}
          </div>

          <div className="tape-list">
            {filteredIdeas.map((idea) => {
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
            {filteredIdeas.length === 0 && searchQuery && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                No tapes match "{searchQuery}"
              </p>
            )}
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
