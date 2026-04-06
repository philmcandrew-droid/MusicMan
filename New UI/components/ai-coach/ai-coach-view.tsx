"use client"

import * as React from "react"
import { Send, Sparkles, Music, Guitar, Lightbulb, BookOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const OPENROUTER_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ""

const OPENROUTER_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "qwen/qwen3-coder:free",
]

const SYSTEM_PROMPT = `You are MusicMan Coach, a friendly and knowledgeable AI music teacher. You specialise in guitar, piano, music theory, songwriting, and practice techniques. Keep answers concise but helpful. Use markdown formatting for lists and emphasis. If a question is not about music, politely redirect to music topics.`

const suggestions = [
  { icon: Guitar, title: "Chord Progressions", prompt: "What are some common chord progressions for a sad song?" },
  { icon: Music, title: "Music Theory", prompt: "Explain the circle of fifths in simple terms" },
  { icon: Lightbulb, title: "Practice Tips", prompt: "How can I improve my finger dexterity for guitar?" },
  { icon: BookOpen, title: "Song Analysis", prompt: "Break down the chord structure of a typical pop song" },
]

function buildMessages(history: Message[], prompt: string) {
  const msgs: { role: string; content: string }[] = [{ role: "system", content: SYSTEM_PROMPT }]
  for (const m of history) {
    msgs.push({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })
  }
  msgs.push({ role: "user", content: prompt })
  return msgs
}

async function askOpenRouter(history: Message[], prompt: string, signal: AbortSignal): Promise<string> {
  if (!OPENROUTER_KEY) return getFallbackResponse(prompt)

  let lastErr = ""
  for (const model of OPENROUTER_MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "HTTP-Referer": "https://musicman.app",
          "X-Title": "MusicMan Coach",
        },
        body: JSON.stringify({ model, messages: buildMessages(history, prompt), temperature: 0.7 }),
        signal,
      })

      if (res.status === 429 || res.status === 503) { lastErr = `${model} rate-limited`; continue }
      if (!res.ok) { lastErr = `${model} HTTP ${res.status}`; continue }
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content
      if (text) return text
      lastErr = `${model} empty response`
    } catch (err: unknown) {
      if (signal.aborted) throw err
      lastErr = `${model} network error`
    }
  }
  return getFallbackResponse(prompt)
}

function getFallbackResponse(question: string): string {
  const q = question.toLowerCase()
  if (q.includes("chord progression"))
    return "Great question! For sad songs, some classic progressions:\n\n**i - VI - III - VII** (Am - F - C - G)\n**i - iv - v - i** (Am - Dm - Em - Am)\n**I - V - vi - IV** (C - G - Am - F)\n\nWould you like me to explain any of these?"
  if (q.includes("circle of fifths"))
    return "The Circle of Fifths shows all 12 keys arranged so neighbours share most notes.\n\n**Use it to:**\n1. Find related chords\n2. Understand key signatures\n3. Plan chord progressions"
  if (q.includes("finger") || q.includes("dexterity"))
    return "Top tips:\n1. **Spider walk** 1-2-3-4 across strings\n2. **Trills** between two fingers\n3. Start SLOW with a metronome\n4. 10-15 min daily beats 1 hour weekly"
  return "I can help with:\n- **Music theory**\n- **Chord progressions** & songwriting\n- **Practice techniques**\n- **Instrument guidance**\n\nWhat would you like to explore?"
}

export function AICoachView() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const abortRef = React.useRef<AbortController | null>(null)

  React.useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const handleSubmit = async (prompt?: string) => {
    const messageText = prompt || input
    if (!messageText.trim()) return

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await askOpenRouter(messages, messageText, controller.signal)
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response }])
    } catch { /* aborted */ } finally { setIsLoading(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => { if (typeof window !== "undefined") window.history.back() }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-secondary transition-colors" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Coach</h1>
            <p className="text-sm text-muted-foreground">Your personal music learning assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Welcome to AI Coach</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Ask me anything about music theory, practice techniques, or songwriting.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((s) => (
                  <button key={s.title} onClick={() => handleSubmit(s.prompt)}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:bg-card/80 text-left transition-all duration-200">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <s.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{s.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}>
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  message.role === "assistant" ? "bg-primary/10" : "bg-secondary")}>
                  {message.role === "assistant" ? <Sparkles className="h-4 w-4 text-primary" /> : <span className="text-sm font-medium">U</span>}
                </div>
                <div className={cn("flex-1 rounded-2xl px-4 py-3 text-sm",
                  message.role === "assistant" ? "bg-card border border-border/50" : "bg-primary text-primary-foreground")}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="flex-1 rounded-2xl bg-card border border-border/50 px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border/50 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your music coach..."
              className="min-h-[52px] max-h-[200px] resize-none bg-card"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }} />
            <Button size="icon" onClick={() => handleSubmit()} disabled={!input.trim() || isLoading}
              className="h-[52px] w-[52px] shrink-0">
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}