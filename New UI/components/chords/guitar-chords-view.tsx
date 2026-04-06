"use client"

import * as React from "react"
import { Search, Heart, Volume2, Home } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChordDiagram } from "./chord-diagram"

const chordCategories = ["All", "Major", "Minor", "7th", "Maj7", "Min7", "Sus", "Dim", "Aug", "Jazz", "Moveable", "Inversions"]

const chords = [
  // Major chords
  { name: "C", type: "Major", difficulty: "Easy", frets: [null, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null] },
  { name: "D", type: "Major", difficulty: "Easy", frets: [null, null, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2] },
  { name: "E", type: "Major", difficulty: "Easy", frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null] },
  { name: "F", type: "Major", difficulty: "Medium", frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }] },
  { name: "G", type: "Major", difficulty: "Easy", frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3] },
  { name: "A", type: "Major", difficulty: "Easy", frets: [null, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null] },
  { name: "B", type: "Major", difficulty: "Hard", frets: [null, 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], startFret: 2, barres: [{ fret: 2, fromString: 5, toString: 1 }] },
  // Minor chords
  { name: "Am", type: "Minor", difficulty: "Easy", frets: [null, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null] },
  { name: "Bm", type: "Minor", difficulty: "Medium", frets: [null, 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], startFret: 2, barres: [{ fret: 2, fromString: 5, toString: 1 }] },
  { name: "Cm", type: "Minor", difficulty: "Medium", frets: [null, 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], startFret: 3, barres: [{ fret: 3, fromString: 5, toString: 1 }] },
  { name: "Dm", type: "Minor", difficulty: "Easy", frets: [null, null, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1] },
  { name: "Em", type: "Minor", difficulty: "Easy", frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null] },
  { name: "Fm", type: "Minor", difficulty: "Medium", frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }] },
  { name: "Gm", type: "Minor", difficulty: "Medium", frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], startFret: 3, barres: [{ fret: 3, fromString: 6, toString: 1 }] },
  // 7th chords
  { name: "C7", type: "7th", difficulty: "Easy", frets: [null, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null] },
  { name: "D7", type: "7th", difficulty: "Easy", frets: [null, null, 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3] },
  { name: "E7", type: "7th", difficulty: "Easy", frets: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null] },
  { name: "G7", type: "7th", difficulty: "Easy", frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1] },
  { name: "A7", type: "7th", difficulty: "Easy", frets: [null, 0, 2, 0, 2, 0], fingers: [null, null, 1, null, 2, null] },
  { name: "B7", type: "7th", difficulty: "Medium", frets: [null, 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4] },
  // Maj7 chords
  { name: "Cmaj7", type: "Maj7", difficulty: "Easy", frets: [null, 3, 2, 0, 0, 0], fingers: [null, 2, 1, null, null, null] },
  { name: "Dmaj7", type: "Maj7", difficulty: "Easy", frets: [null, null, 0, 2, 2, 2], fingers: [null, null, null, 1, 1, 1] },
  { name: "Emaj7", type: "Maj7", difficulty: "Easy", frets: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 1, 2, null, null] },
  { name: "Fmaj7", type: "Maj7", difficulty: "Easy", frets: [null, null, 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, null] },
  { name: "Gmaj7", type: "Maj7", difficulty: "Easy", frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, null, null, null, 3] },
  { name: "Amaj7", type: "Maj7", difficulty: "Easy", frets: [null, 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null] },
  // Min7 chords
  { name: "Am7", type: "Min7", difficulty: "Easy", frets: [null, 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null] },
  { name: "Bm7", type: "Min7", difficulty: "Medium", frets: [null, 2, 4, 2, 3, 2], fingers: [null, 1, 3, 1, 2, 1], startFret: 2, barres: [{ fret: 2, fromString: 5, toString: 1 }] },
  { name: "Dm7", type: "Min7", difficulty: "Easy", frets: [null, null, 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1] },
  { name: "Em7", type: "Min7", difficulty: "Easy", frets: [0, 2, 0, 0, 0, 0], fingers: [null, 1, null, null, null, null] },
  { name: "Fm7", type: "Min7", difficulty: "Medium", frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }] },
  { name: "Gm7", type: "Min7", difficulty: "Medium", frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], startFret: 3, barres: [{ fret: 3, fromString: 6, toString: 1 }] },
  // Sus chords
  { name: "Asus2", type: "Sus", difficulty: "Easy", frets: [null, 0, 2, 2, 0, 0], fingers: [null, null, 1, 2, null, null] },
  { name: "Asus4", type: "Sus", difficulty: "Easy", frets: [null, 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null] },
  { name: "Dsus2", type: "Sus", difficulty: "Easy", frets: [null, null, 0, 2, 3, 0], fingers: [null, null, null, 1, 2, null] },
  { name: "Dsus4", type: "Sus", difficulty: "Easy", frets: [null, null, 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 3] },
  { name: "Esus4", type: "Sus", difficulty: "Easy", frets: [0, 2, 2, 2, 0, 0], fingers: [null, 1, 2, 3, null, null] },
  { name: "Gsus4", type: "Sus", difficulty: "Easy", frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, null, null, 1, 4] },
  // Dim chords
  { name: "Cdim", type: "Dim", difficulty: "Medium", frets: [null, 3, 4, 2, 4, null], fingers: [null, 2, 3, 1, 4, null] },
  { name: "Ddim", type: "Dim", difficulty: "Medium", frets: [null, null, 0, 1, 0, 1], fingers: [null, null, null, 1, null, 2] },
  { name: "Edim", type: "Dim", difficulty: "Medium", frets: [null, null, 2, 3, 2, 3], fingers: [null, null, 1, 3, 2, 4] },
  { name: "Fdim", type: "Dim", difficulty: "Medium", frets: [null, null, 3, 4, 3, 4], fingers: [null, null, 1, 3, 2, 4], startFret: 3 },
  { name: "Gdim", type: "Dim", difficulty: "Medium", frets: [null, null, 5, 6, 5, 6], fingers: [null, null, 1, 3, 2, 4], startFret: 5 },
  { name: "Adim", type: "Dim", difficulty: "Medium", frets: [null, 0, 1, 2, 1, null], fingers: [null, null, 1, 3, 2, null] },
  { name: "Bdim", type: "Dim", difficulty: "Medium", frets: [null, 2, 3, 4, 3, null], fingers: [null, 1, 2, 4, 3, null], startFret: 2 },
  // Aug chords
  { name: "Caug", type: "Aug", difficulty: "Medium", frets: [null, 3, 2, 1, 1, 0], fingers: [null, 4, 3, 1, 2, null] },
  { name: "Daug", type: "Aug", difficulty: "Medium", frets: [null, null, 0, 3, 3, 2], fingers: [null, null, null, 2, 3, 1] },
  { name: "Eaug", type: "Aug", difficulty: "Medium", frets: [0, 3, 2, 1, 1, 0], fingers: [null, 4, 3, 1, 2, null] },
  { name: "Faug", type: "Aug", difficulty: "Medium", frets: [null, null, 3, 2, 2, 1], fingers: [null, null, 4, 2, 3, 1] },
  { name: "Gaug", type: "Aug", difficulty: "Medium", frets: [3, 2, 1, 0, 0, 3], fingers: [3, 2, 1, null, null, 4] },
  { name: "Aaug", type: "Aug", difficulty: "Medium", frets: [null, 0, 3, 2, 2, 1], fingers: [null, null, 4, 2, 3, 1] },

  // === Jazz Voicings ===
  { name: "Cmaj9", type: "Jazz", difficulty: "Hard", frets: [null, 3, 2, 4, 3, 0], fingers: [null, 2, 1, 4, 3, null] },
  { name: "Am9", type: "Jazz", difficulty: "Hard", frets: [null, 0, 2, 4, 1, 0], fingers: [null, null, 2, 4, 1, null] },
  { name: "Dm9", type: "Jazz", difficulty: "Hard", frets: [null, null, 0, 2, 1, 0], fingers: [null, null, null, 2, 1, null] },
  { name: "G9", type: "Jazz", difficulty: "Medium", frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1] },
  { name: "G13", type: "Jazz", difficulty: "Hard", frets: [3, 2, 0, 0, 0, 0], fingers: [2, 1, null, null, null, null] },
  { name: "C6/9", type: "Jazz", difficulty: "Hard", frets: [null, 3, 2, 2, 3, 0], fingers: [null, 2, 1, 1, 3, null] },
  { name: "Dm11", type: "Jazz", difficulty: "Hard", frets: [null, null, 0, 0, 1, 1], fingers: [null, null, null, null, 1, 1] },
  { name: "Em9", type: "Jazz", difficulty: "Hard", frets: [0, 2, 0, 0, 0, 2], fingers: [null, 1, null, null, null, 2] },
  { name: "Fmaj9", type: "Jazz", difficulty: "Hard", frets: [null, null, 3, 0, 1, 0], fingers: [null, null, 3, null, 1, null] },
  { name: "Bbmaj7", type: "Jazz", difficulty: "Hard", frets: [null, 1, 3, 2, 3, 1], fingers: [null, 1, 3, 2, 4, 1], barres: [{ fret: 1, fromString: 5, toString: 1 }] },
  { name: "Eb9", type: "Jazz", difficulty: "Hard", frets: [null, null, 1, 0, 2, 1], fingers: [null, null, 1, null, 3, 2] },
  { name: "Ab13", type: "Jazz", difficulty: "Hard", frets: [4, 4, 4, 5, 4, 6], fingers: [1, 1, 1, 2, 1, 4], startFret: 4, barres: [{ fret: 4, fromString: 6, toString: 1 }] },
  { name: "Dbmaj9", type: "Jazz", difficulty: "Hard", frets: [null, 4, 3, 5, 4, null], fingers: [null, 2, 1, 4, 3, null], startFret: 3 },

  // === Moveable Shapes ===
  { name: "E-shape Maj", type: "Moveable", difficulty: "Medium", frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }] },
  { name: "A-shape Maj", type: "Moveable", difficulty: "Medium", frets: [null, 3, 5, 5, 5, 3], fingers: [null, 1, 2, 3, 4, 1], startFret: 3, barres: [{ fret: 3, fromString: 5, toString: 1 }] },
  { name: "E-shape Min", type: "Moveable", difficulty: "Medium", frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }] },
  { name: "A-shape Min", type: "Moveable", difficulty: "Medium", frets: [null, 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], startFret: 3, barres: [{ fret: 3, fromString: 5, toString: 1 }] },
  { name: "E-shape 7th", type: "Moveable", difficulty: "Medium", frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }] },
  { name: "A-shape 7th", type: "Moveable", difficulty: "Medium", frets: [null, 3, 5, 3, 5, 3], fingers: [null, 1, 3, 1, 4, 1], startFret: 3, barres: [{ fret: 3, fromString: 5, toString: 1 }] },
  { name: "E-shape Maj7", type: "Moveable", difficulty: "Medium", frets: [1, 3, 2, 2, 1, 1], fingers: [1, 4, 2, 3, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }] },
  { name: "A-shape Maj7", type: "Moveable", difficulty: "Medium", frets: [null, 3, 5, 4, 5, 3], fingers: [null, 1, 3, 2, 4, 1], startFret: 3, barres: [{ fret: 3, fromString: 5, toString: 1 }] },
  { name: "E-shape Min7", type: "Moveable", difficulty: "Medium", frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 1, fromString: 6, toString: 1 }] },
  { name: "D-shape Maj", type: "Moveable", difficulty: "Medium", frets: [null, null, 3, 5, 6, 5], fingers: [null, null, 1, 2, 4, 3], startFret: 3 },
  { name: "C-shape Maj", type: "Moveable", difficulty: "Hard", frets: [null, 3, 5, 5, 5, 3], fingers: [null, 1, 2, 3, 4, 1], startFret: 3, barres: [{ fret: 3, fromString: 5, toString: 1 }] },
  { name: "Power 5th", type: "Moveable", difficulty: "Easy", frets: [1, 3, 3, null, null, null], fingers: [1, 3, 4, null, null, null] },

  // === Inversions ===
  { name: "C/E (1st inv)", type: "Inversions", difficulty: "Easy", frets: [0, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null] },
  { name: "C/G (2nd inv)", type: "Inversions", difficulty: "Easy", frets: [3, 3, 2, 0, 1, 0], fingers: [3, 4, 2, null, 1, null] },
  { name: "D/F# (1st inv)", type: "Inversions", difficulty: "Medium", frets: [2, null, 0, 2, 3, 2], fingers: [1, null, null, 2, 4, 3] },
  { name: "D/A (2nd inv)", type: "Inversions", difficulty: "Easy", frets: [null, 0, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2] },
  { name: "E/G# (1st inv)", type: "Inversions", difficulty: "Medium", frets: [4, 2, 2, 1, 0, 0], fingers: [4, 2, 3, 1, null, null], startFret: 1 },
  { name: "E/B (2nd inv)", type: "Inversions", difficulty: "Easy", frets: [null, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null] },
  { name: "G/B (1st inv)", type: "Inversions", difficulty: "Easy", frets: [null, 2, 0, 0, 0, 3], fingers: [null, 1, null, null, null, 3] },
  { name: "G/D (2nd inv)", type: "Inversions", difficulty: "Easy", frets: [null, null, 0, 0, 0, 3], fingers: [null, null, null, null, null, 3] },
  { name: "A/C# (1st inv)", type: "Inversions", difficulty: "Medium", frets: [null, 4, 2, 2, 2, 0], fingers: [null, 4, 1, 2, 3, null], startFret: 1 },
  { name: "A/E (2nd inv)", type: "Inversions", difficulty: "Easy", frets: [0, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null] },
  { name: "Am/C (1st inv)", type: "Inversions", difficulty: "Easy", frets: [null, 3, 2, 2, 1, 0], fingers: [null, 3, 2, 4, 1, null] },
  { name: "Am/E (2nd inv)", type: "Inversions", difficulty: "Easy", frets: [0, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null] },
  { name: "Em/G (1st inv)", type: "Inversions", difficulty: "Easy", frets: [3, 2, 2, 0, 0, 0], fingers: [3, 2, 1, null, null, null] },
  { name: "Em/B (2nd inv)", type: "Inversions", difficulty: "Easy", frets: [null, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null] },
  { name: "F/A (1st inv)", type: "Inversions", difficulty: "Easy", frets: [null, 0, 3, 2, 1, 1], fingers: [null, null, 3, 2, 1, 1] },
  { name: "F/C (2nd inv)", type: "Inversions", difficulty: "Medium", frets: [null, 3, 3, 2, 1, 1], fingers: [null, 3, 4, 2, 1, 1] },
  { name: "Dm/F (1st inv)", type: "Inversions", difficulty: "Easy", frets: [1, null, 0, 2, 3, 1], fingers: [1, null, null, 2, 4, 1] },
  { name: "Dm/A (2nd inv)", type: "Inversions", difficulty: "Easy", frets: [null, 0, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1] },
]

let audioCtx: AudioContext | null = null
function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

const STRING_OPEN_FREQ = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63]

function playChordAudio(chord: typeof chords[number]) {
  const ctx = getAudioCtx()
  if (ctx.state === "suspended") ctx.resume()
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.2, ctx.currentTime)
  gain.connect(ctx.destination)

  const startFret = chord.startFret || 1
  chord.frets.forEach((fret, i) => {
    if (fret === null) return
    const freq = fret === 0
      ? STRING_OPEN_FREQ[i]
      : STRING_OPEN_FREQ[i] * Math.pow(2, fret / 12)
    const osc = ctx.createOscillator()
    osc.type = "triangle"
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    osc.connect(gain)
    const offset = i * 0.04
    osc.start(ctx.currentTime + offset)
    osc.stop(ctx.currentTime + offset + 1.2)
  })
  gain.gain.setTargetAtTime(0, ctx.currentTime + 1.0, 0.15)
}

export function GuitarChordsView() {
  const [selectedCategory, setSelectedCategory] = React.useState("All")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [favorites, setFavorites] = React.useState<string[]>([])

  const filteredChords = chords.filter(
    (chord) =>
      (selectedCategory === "All" || chord.type === selectedCategory) &&
      chord.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFavorite = (chordName: string) => {
    setFavorites((prev) =>
      prev.includes(chordName)
        ? prev.filter((n) => n !== chordName)
        : [...prev, chordName]
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <a href="/" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors" aria-label="Home"><Home className="h-5 w-5" /></a>
          <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Guitar Chords</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Browse and learn guitar chord diagrams with fingering positions
          </p></div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {chordCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredChords.length} chord{filteredChords.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredChords.map((chord) => (
              <div
                key={chord.name}
                className="group relative bg-card rounded-xl border border-border/50 p-3 sm:p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
              >
                <button
                  onClick={() => toggleFavorite(chord.name)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-secondary transition-colors z-10"
                  aria-label={favorites.includes(chord.name) ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors",
                      favorites.includes(chord.name)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </button>

                <div className="bg-secondary/30 rounded-lg p-2 mb-3">
                  <ChordDiagram
                    name={chord.name}
                    frets={chord.frets}
                    fingers={chord.fingers}
                    barres={chord.barres}
                    startFret={chord.startFret}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">
                      {chord.type}
                    </h3>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                        chord.difficulty === "Easy"
                          ? "bg-primary/20 text-primary"
                          : chord.difficulty === "Medium"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-destructive/20 text-destructive"
                      )}
                    >
                      {chord.difficulty}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => playChordAudio(chord)}
                >
                  <Volume2 className="h-3 w-3 mr-1.5" />
                  <span className="text-xs">Play</span>
                </Button>
              </div>
            ))}
          </div>

          {filteredChords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No chords found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}