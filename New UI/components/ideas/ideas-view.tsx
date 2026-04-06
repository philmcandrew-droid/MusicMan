"use client"

import * as React from "react"
import { Plus, Mic, Trash2, Play, Pause, Square, Clock, Volume2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const META_KEY = "musicman.ideas.v1"
const DB_NAME = "musicman-ideas-db"
const DB_STORE = "audio"
const DB_VERSION = 1

interface IdeaMeta {
  id: string; title: string; notes: string; tags: string[]; createdAt: string; hasAudio: boolean
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(DB_STORE)) req.result.createObjectStore(DB_STORE) }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function saveAudioToDB(id: string, dataUrl: string) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite")
    tx.objectStore(DB_STORE).put(dataUrl, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getAudioFromDB(id: string): Promise<string | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly")
    const req = tx.objectStore(DB_STORE).get(id)
    req.onsuccess = () => resolve(req.result as string | undefined)
    req.onerror = () => reject(req.error)
  })
}

async function deleteAudioFromDB(id: string) {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite")
    tx.objectStore(DB_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function loadMeta(): IdeaMeta[] {
  if (typeof window === "undefined") return []
  try { const raw = localStorage.getItem(META_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}

function saveMeta(ideas: IdeaMeta[]) {
  if (typeof window === "undefined") return
  try { localStorage.setItem(META_KEY, JSON.stringify(ideas)) } catch (e) { console.error("save meta failed", e) }
}

export function IdeasView() {
  const [ideas, setIdeas] = React.useState<IdeaMeta[]>([])
  const [loaded, setLoaded] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const [recordingTime, setRecordingTime] = React.useState(0)
  const [newTitle, setNewTitle] = React.useState("")
  const [newNotes, setNewNotes] = React.useState("")
  const [showForm, setShowForm] = React.useState(false)
  const [playingId, setPlayingId] = React.useState<string | null>(null)
  const [pendingAudio, setPendingAudio] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<Blob[]>([])
  const audioRefs = React.useRef<Record<string, HTMLAudioElement>>({})
  const timerRef = React.useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  React.useEffect(() => {
    const metas = loadMeta()
    setIdeas(metas)
    setLoaded(true)
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 48000, channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm"
      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 })
      chunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const reader = new FileReader()
        reader.onloadend = () => setPendingAudio(reader.result as string)
        reader.readAsDataURL(blob)
      }
      mediaRecorderRef.current = recorder
      recorder.start(250)
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    } catch { alert("Could not access microphone. Please grant permission and try again.") }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    clearInterval(timerRef.current)
    timerRef.current = undefined
  }

  const addIdea = async () => {
    if (!newTitle.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        if (pendingAudio) await saveAudioToDB(editingId, pendingAudio)
        setIdeas((prev) => {
          const updated = prev.map((idea) =>
            idea.id === editingId ? { ...idea, title: newTitle, notes: newNotes, hasAudio: !!(pendingAudio || idea.hasAudio) } : idea)
          saveMeta(updated)
          return updated
        })
        setEditingId(null)
      } else {
        const id = Date.now().toString()
        if (pendingAudio) await saveAudioToDB(id, pendingAudio)
        const newIdea: IdeaMeta = { id, title: newTitle, notes: newNotes, tags: [], createdAt: new Date().toISOString(), hasAudio: !!pendingAudio }
        setIdeas((prev) => { const updated = [newIdea, ...prev]; saveMeta(updated); return updated })
      }
      setNewTitle(""); setNewNotes(""); setPendingAudio(null); setShowForm(false)
    } catch (e) { alert("Failed to save idea. " + (e instanceof Error ? e.message : "")) }
    finally { setSaving(false) }
  }

  const deleteIdea = async (id: string) => {
    if (playingId === id) { audioRefs.current[id]?.pause(); setPlayingId(null) }
    await deleteAudioFromDB(id).catch(() => {})
    delete audioRefs.current[id]
    setIdeas((prev) => { const updated = prev.filter((i) => i.id !== id); saveMeta(updated); return updated })
  }

  const editIdea = async (idea: IdeaMeta) => {
    setEditingId(idea.id); setNewTitle(idea.title); setNewNotes(idea.notes)
    if (idea.hasAudio) {
      const audio = await getAudioFromDB(idea.id).catch(() => undefined)
      setPendingAudio(audio || null)
    } else { setPendingAudio(null) }
    setShowForm(true)
  }

  const cancelEdit = () => {
    setEditingId(null); setNewTitle(""); setNewNotes(""); setPendingAudio(null); setShowForm(false)
  }

  const togglePlayback = async (idea: IdeaMeta) => {
    if (!idea.hasAudio) return
    if (playingId === idea.id) { audioRefs.current[idea.id]?.pause(); setPlayingId(null); return }
    if (playingId && audioRefs.current[playingId]) audioRefs.current[playingId].pause()
    let audio = audioRefs.current[idea.id]
    if (!audio) {
      const dataUrl = await getAudioFromDB(idea.id).catch(() => undefined)
      if (!dataUrl) { alert("Audio recording not found."); return }
      audio = new Audio(dataUrl); audioRefs.current[idea.id] = audio; audio.onended = () => setPlayingId(null)
    }
    audio.currentTime = 0; audio.play(); setPlayingId(idea.id)
  }

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  const fmtRecTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors" aria-label="Home">
              <Home className="h-5 w-5" />
            </a>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ideas</h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">Capture your musical inspiration</p>
            </div>
          </div>
          <Button onClick={() => { setEditingId(null); setNewTitle(""); setNewNotes(""); setPendingAudio(null); setShowForm(true) }} className="h-10 sm:h-11">
            <Plus className="h-5 w-5 mr-2" /><span className="hidden sm:inline">New Idea</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {showForm && (
            <div className="p-4 sm:p-6 rounded-2xl bg-card border border-primary/50 space-y-4">
              <Input placeholder="Idea title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="text-lg font-medium bg-background" />
              <Textarea placeholder="Notes, chord progressions, lyrics..." value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="min-h-[100px] bg-background resize-none" />
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <Button variant="outline" size="sm" onClick={startRecording}>
                    <Mic className="h-4 w-4 mr-2" />{pendingAudio ? "Re-record Audio" : "Record Audio"}
                  </Button>
                ) : (
                  <Button variant="destructive" size="sm" onClick={stopRecording}>
                    <Square className="h-4 w-4 mr-2" />Stop ({fmtRecTime(recordingTime)})
                  </Button>
                )}
                {pendingAudio && !isRecording && <span className="text-xs text-primary font-medium">Audio attached</span>}
              </div>
              {pendingAudio && !isRecording && <audio controls src={pendingAudio} className="w-full h-10" />}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                <Button onClick={addIdea} disabled={saving}>{saving ? "Saving..." : editingId ? "Update Idea" : "Save Idea"}</Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {ideas.map((idea) => (
              <div key={idea.id} className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => editIdea(idea)}>
                    <h3 className="font-semibold text-base sm:text-lg truncate">{idea.title}</h3>
                    {idea.notes && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{idea.notes}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{formatTime(idea.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {idea.hasAudio && (
                      <Button size="sm" variant={playingId === idea.id ? "default" : "outline"} className="h-9 gap-1.5" onClick={() => togglePlayback(idea)}>
                        {playingId === idea.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        <span className="text-xs">{playingId === idea.id ? "Pause" : "Play"}</span>
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteIdea(idea.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {idea.hasAudio && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Volume2 className="h-3.5 w-3.5 text-primary" /><span>Audio recording attached</span>
                    {playingId === idea.id && (
                      <span className="flex items-center gap-0.5 text-primary font-medium"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />Playing...</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {ideas.length === 0 && !showForm && loaded && (
            <div className="text-center py-12">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4"><Mic className="h-8 w-8 text-primary" /></div>
              <h2 className="text-xl font-semibold mb-2">No ideas yet</h2>
              <p className="text-muted-foreground mb-4">Start capturing your musical inspiration</p>
              <Button onClick={() => setShowForm(true)}><Plus className="h-5 w-5 mr-2" />Add Your First Idea</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}