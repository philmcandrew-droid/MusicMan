import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  src: string
  onClick?: (e: React.MouseEvent) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}

function fmt(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * WebM files produced by MediaRecorder lack a duration header, so
 * `audio.duration` reads as Infinity until the browser has seeked past
 * the end at least once.  We force that discovery here.
 */
function resolveDuration(audio: HTMLAudioElement): Promise<number> {
  return new Promise((resolve) => {
    if (isFinite(audio.duration) && audio.duration > 0) {
      resolve(audio.duration)
      return
    }

    const onDurationChange = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        audio.removeEventListener('durationchange', onDurationChange)
        audio.currentTime = 0
        resolve(audio.duration)
      }
    }
    audio.addEventListener('durationchange', onDurationChange)

    // Seek far ahead to force the browser to calculate the real duration
    audio.currentTime = 1e10
  })
}

export function AudioPlayer({ src, onClick, onKeyDown }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const seekingRef = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ready, setReady] = useState(false)

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    let cancelled = false

    // Data URLs cause seek issues in many browsers; convert to blob URL
    let blobUrl: string | undefined
    if (src.startsWith('data:')) {
      try {
        const [header, b64] = src.split(',')
        const mime = header.match(/:(.*?);/)?.[1] ?? 'audio/webm'
        const bin = atob(b64)
        const bytes = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
        const blob = new Blob([bytes], { type: mime })
        blobUrl = URL.createObjectURL(blob)
        objectUrlRef.current = blobUrl
      } catch {
        // Fall back to data URL if conversion fails
      }
    }

    audio.src = blobUrl ?? src
    audio.preload = 'metadata'

    const handleTimeUpdate = () => {
      if (!cancelled && !seekingRef.current) setCurrentTime(audio.currentTime)
    }
    const handleEnded = () => {
      if (!cancelled) {
        setPlaying(false)
        setCurrentTime(0)
        audio.currentTime = 0
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    audio.addEventListener('loadedmetadata', () => {
      if (cancelled) return
      resolveDuration(audio).then((dur) => {
        if (!cancelled) {
          setDuration(dur)
          setCurrentTime(0)
          setReady(true)
        }
      })
    })

    // If loadedmetadata already fired (cached)
    if (audio.readyState >= 1) {
      resolveDuration(audio).then((dur) => {
        if (!cancelled) {
          setDuration(dur)
          setCurrentTime(0)
          setReady(true)
        }
      })
    }

    return () => {
      cancelled = true
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.src = ''
      audioRef.current = null
      cleanupObjectUrl()
    }
  }, [src, cleanupObjectUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !ready) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value)
    setCurrentTime(t)
    if (audioRef.current) {
      audioRef.current.currentTime = t
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="audio-player"
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="group"
      aria-label="Audio player"
    >
      <button
        type="button"
        className="audio-player-play"
        onClick={(e) => {
          e.stopPropagation()
          togglePlay()
        }}
        disabled={!ready}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6,4 20,12 6,20" />
          </svg>
        )}
      </button>

      <span className="audio-player-time">{fmt(currentTime)}</span>

      <input
        type="range"
        className="audio-player-slider"
        min={0}
        max={duration || 0}
        step={0.1}
        value={currentTime}
        onChange={handleSeek}
        onPointerDown={() => { seekingRef.current = true }}
        onPointerUp={() => { seekingRef.current = false }}
        onClick={(e) => e.stopPropagation()}
        disabled={!ready}
        aria-label="Seek"
        style={{
          '--audio-progress': `${progress}%`,
        } as React.CSSProperties}
      />

      <span className="audio-player-time">{fmt(duration)}</span>
    </div>
  )
}
