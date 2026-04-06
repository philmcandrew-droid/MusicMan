"use client"

import * as React from "react"
import {
  ChevronDown,
  Home,
  Activity,
  Guitar,
  Piano,
  Puzzle,
  Music2,
  Lightbulb,
  CircleDot,
  Sparkles,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "How do I use the tuner?",
    answer:
      "Select the string you want to tune, click 'Start Tuner', and play the string on your instrument. The needle will show if you're flat (left), in tune (center/green), or sharp (right). Adjust your tuning peg until the needle stays centered.",
  },
  {
    question: "Why isn't my microphone working?",
    answer:
      "Make sure you've granted microphone permissions to the app in your browser settings. You can also check Settings > Audio to select the correct input device.",
  },
  {
    question: "What is the Circle of Fifths?",
    answer:
      "The Circle of Fifths is a visual representation of the relationships between the 12 tones of the chromatic scale. It helps you understand key signatures, find related chords, and plan chord progressions.",
  },
  {
    question: "How do I save my ideas?",
    answer:
      "Go to the Ideas section and click 'New Idea'. You can add a title, notes, and even record audio snippets. Your ideas are saved automatically to your device.",
  },
  {
    question: "Can I customize the reference pitch for the tuner?",
    answer:
      "Yes! Go to Settings and adjust the 'Reference A Frequency' slider. The standard is A=440Hz, but some orchestras and historical performances use different reference pitches.",
  },
]

const features = [
  {
    icon: Activity,
    title: "Tuner",
    description: "Accurate chromatic tuner with visual feedback and reference tones",
  },
  {
    icon: Guitar,
    title: "Guitar Chords",
    description: "Comprehensive library with jazz, moveable, and standard voicings",
  },
  {
    icon: Piano,
    title: "Piano Chords",
    description: "Visual piano keyboard with chord playback",
  },
  {
    icon: Puzzle,
    title: "Chord Builder",
    description: "Build custom chords by selecting intervals",
  },
  {
    icon: Music2,
    title: "Song Structure",
    description: "Plan and visualize your song arrangements",
  },
  {
    icon: Lightbulb,
    title: "Ideas",
    description: "Capture ideas with text notes and high-quality audio recordings",
  },
  {
    icon: CircleDot,
    title: "Circle of Fifths",
    description: "Explore key relationships visually",
  },
  {
    icon: Sparkles,
    title: "AI Coach",
    description: "Get personalized music learning assistance powered by AI",
  },
]

export function HelpView() {
  const [openFAQ, setOpenFAQ] = React.useState<number | null>(null)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors" aria-label="Home"><Home className="h-5 w-5" /></a>
          <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Help Center</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Everything you need to know about MusicMan
          </p></div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Features overview */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border/50 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-card/80 transition-colors"
                  >
                    <span className="font-medium text-sm pr-4">{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        openFAQ === index && "rotate-180"
                      )}
                    />
                  </button>
                  {openFAQ === index && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact / About */}
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-semibold text-lg mb-2">About MusicMan</h2>
            <p className="text-sm text-muted-foreground mb-2">
              MusicMan is your personal musician assistant, helping you tune your
              instruments, learn chords, build songs, and improve your musical skills.
            </p>
            <p className="text-sm font-medium mb-4">
              Developed by Phil McAndrew
            </p>
            <Button>Contact Support</Button>
          </div>

          {/* Keyboard shortcuts */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Toggle sidebar</span>
                  <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">
                    Ctrl+B
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Start/stop tuner</span>
                  <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">
                    Space
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Play reference tone</span>
                  <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">
                    P
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">New idea</span>
                  <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">
                    Ctrl+N
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}