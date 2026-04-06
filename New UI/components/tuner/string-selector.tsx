"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GuitarString {
  note: string
  frequency: number
  octave: number
}

const guitarStrings: GuitarString[] = [
  { note: "E", frequency: 82, octave: 2 },
  { note: "A", frequency: 110, octave: 2 },
  { note: "D", frequency: 147, octave: 3 },
  { note: "G", frequency: 196, octave: 3 },
  { note: "B", frequency: 247, octave: 3 },
  { note: "E", frequency: 330, octave: 4 },
]

interface StringSelectorProps {
  selectedString: number
  onSelectString: (index: number) => void
  detectedString?: number
}

export function StringSelector({
  selectedString,
  onSelectString,
  detectedString,
}: StringSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {guitarStrings.map((string, index) => {
        const isSelected = selectedString === index
        const isDetected = detectedString === index
        
        return (
          <button
            key={`${string.note}-${string.frequency}`}
            onClick={() => onSelectString(index)}
            className={cn(
              "group relative flex flex-col items-center justify-center",
              "w-12 h-16 sm:w-14 sm:h-20 md:w-16 md:h-24",
              "rounded-xl sm:rounded-2xl",
              "border-2 transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isSelected
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
            )}
          >
            {/* Glow effect when detected */}
            {isDetected && (
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-primary/20 animate-pulse" />
            )}
            
            {/* String indicator dot */}
            <div
              className={cn(
                "absolute -top-1 left-1/2 -translate-x-1/2",
                "w-2 h-2 rounded-full transition-colors",
                isSelected ? "bg-primary" : "bg-transparent"
              )}
            />

            {/* Note name */}
            <span
              className={cn(
                "text-lg sm:text-xl md:text-2xl font-bold transition-colors",
                isSelected ? "text-primary" : "text-foreground"
              )}
            >
              {string.note}
            </span>

            {/* Frequency */}
            <span
              className={cn(
                "text-[10px] sm:text-xs text-muted-foreground",
                isSelected && "text-primary/70"
              )}
            >
              {string.frequency}
              <span className="ml-0.5">Hz</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
