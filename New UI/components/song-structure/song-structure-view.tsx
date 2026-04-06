"use client"

import * as React from "react"
import { Plus, GripVertical, Trash2, Copy, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Section {
  id: string
  type: "intro" | "verse" | "chorus" | "bridge" | "outro" | "pre-chorus" | "instrumental"
  bars: number
  key?: string
  notes?: string
}

const sectionColors: Record<Section["type"], string> = {
  intro: "bg-blue-500/20 border-blue-500/50 text-blue-400",
  verse: "bg-green-500/20 border-green-500/50 text-green-400",
  chorus: "bg-primary/20 border-primary/50 text-primary",
  bridge: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
  outro: "bg-purple-500/20 border-purple-500/50 text-purple-400",
  "pre-chorus": "bg-orange-500/20 border-orange-500/50 text-orange-400",
  instrumental: "bg-pink-500/20 border-pink-500/50 text-pink-400",
}

const sectionTypes: Section["type"][] = [
  "intro",
  "verse",
  "pre-chorus",
  "chorus",
  "bridge",
  "instrumental",
  "outro",
]

const defaultStructure: Section[] = [
  { id: "1", type: "intro", bars: 4 },
  { id: "2", type: "verse", bars: 8, key: "Am", notes: "Start soft, build up" },
  { id: "3", type: "chorus", bars: 8, key: "C", notes: "Big and powerful" },
  { id: "4", type: "verse", bars: 8, key: "Am" },
  { id: "5", type: "chorus", bars: 8, key: "C" },
  { id: "6", type: "bridge", bars: 4, key: "F", notes: "Change dynamic" },
  { id: "7", type: "chorus", bars: 8, key: "C", notes: "Final chorus, add harmonies" },
  { id: "8", type: "outro", bars: 4 },
]

export function SongStructureView() {
  const [sections, setSections] = React.useState<Section[]>(defaultStructure)
  const [selectedSection, setSelectedSection] = React.useState<string | null>(null)

  const addSection = (type: Section["type"]) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      bars: 8,
    }
    setSections((prev) => [...prev, newSection])
  }

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id))
    if (selectedSection === id) setSelectedSection(null)
  }

  const duplicateSection = (id: string) => {
    const section = sections.find((s) => s.id === id)
    if (!section) return

    const newSection: Section = {
      ...section,
      id: Date.now().toString(),
    }

    const index = sections.findIndex((s) => s.id === id)
    const newSections = [...sections]
    newSections.splice(index + 1, 0, newSection)
    setSections(newSections)
  }

  const totalBars = sections.reduce((sum, section) => sum + section.bars, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Song Structure</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Plan and visualize your song arrangement
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sections:</span>
              <span className="font-semibold">{sections.length}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total Bars:</span>
              <span className="font-semibold">{totalBars}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Est. Duration:</span>
              <span className="font-semibold">
                {Math.floor((totalBars * 4) / 60)}:{String((totalBars * 4) % 60).padStart(2, "0")}
              </span>
              <span className="text-xs text-muted-foreground">(at 120 BPM)</span>
            </div>
          </div>

          {/* Visual timeline */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Timeline
            </label>
            <div className="flex rounded-xl overflow-hidden border border-border/50">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={cn(
                    "h-12 sm:h-16 flex items-center justify-center text-xs sm:text-sm font-medium transition-all hover:opacity-80",
                    sectionColors[section.type],
                    selectedSection === section.id && "ring-2 ring-foreground ring-inset"
                  )}
                  style={{ flex: section.bars }}
                >
                  <span className="truncate px-1">
                    {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section list */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Sections
            </label>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={cn(
                    "group flex items-center gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all",
                    sectionColors[section.type],
                    selectedSection === section.id
                      ? "ring-2 ring-foreground"
                      : "hover:border-foreground/30"
                  )}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="font-semibold capitalize">{section.type}</span>
                      <span className="text-sm text-muted-foreground">
                        • {section.bars} bars
                      </span>
                      {section.key && (
                        <span className="px-2 py-0.5 text-xs rounded bg-background/50">
                          {section.key}
                        </span>
                      )}
                    </div>
                    {section.notes && (
                      <p className="mt-1 text-sm text-muted-foreground truncate">
                        {section.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateSection(section.id)
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSection(section.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add section */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Add Section
            </label>
            <div className="flex flex-wrap gap-2">
              {sectionTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => addSection(type)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-105",
                    sectionColors[type]
                  )}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border/50">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Common Song Structures</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Pop/Rock</p>
                <p className="text-muted-foreground text-xs">
                  Intro → Verse → Chorus → Verse → Chorus → Bridge → Chorus → Outro
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">AABA (Jazz Standard)</p>
                <p className="text-muted-foreground text-xs">
                  A Section → A Section → B Section (Bridge) → A Section
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
