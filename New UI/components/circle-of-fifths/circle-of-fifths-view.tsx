"use client"

import * as React from "react"
import { Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface KeyInfo {
  major: string
  minor: string
  sharps: number
  flats: number
}

const circleData: KeyInfo[] = [
  { major: "C", minor: "Am", sharps: 0, flats: 0 },
  { major: "G", minor: "Em", sharps: 1, flats: 0 },
  { major: "D", minor: "Bm", sharps: 2, flats: 0 },
  { major: "A", minor: "F#m", sharps: 3, flats: 0 },
  { major: "E", minor: "C#m", sharps: 4, flats: 0 },
  { major: "B", minor: "G#m", sharps: 5, flats: 0 },
  { major: "F#", minor: "D#m", sharps: 6, flats: 0 },
  { major: "Db", minor: "Bbm", sharps: 0, flats: 5 },
  { major: "Ab", minor: "Fm", sharps: 0, flats: 4 },
  { major: "Eb", minor: "Cm", sharps: 0, flats: 3 },
  { major: "Bb", minor: "Gm", sharps: 0, flats: 2 },
  { major: "F", minor: "Dm", sharps: 0, flats: 1 },
]

export function CircleOfFifthsView() {
  const [selectedKey, setSelectedKey] = React.useState<number>(0)
  const [showMinor, setShowMinor] = React.useState(false)

  const selectedKeyInfo = circleData[selectedKey]

  const relatedKeys = [
    circleData[(selectedKey + 11) % 12],
    circleData[(selectedKey + 1) % 12],
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors" aria-label="Home"><Home className="h-5 w-5" /></a>
          <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Circle of Fifths</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Explore key relationships and find harmonic connections
          </p></div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-[320px] sm:max-w-[380px] aspect-square">
                <svg viewBox="-10 -10 420 420" className="w-full h-full">
                  {/* Outer ring background */}
                  <circle
                    cx="200"
                    cy="200"
                    r="180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="60"
                    className="text-secondary/50"
                  />

                  {/* Inner ring background */}
                  <circle
                    cx="200"
                    cy="200"
                    r="120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="40"
                    className="text-secondary/30"
                  />

                  {circleData.map((key, index) => {
                    const angle = (index * 30 - 90) * (Math.PI / 180)
                    const outerX = 200 + 180 * Math.cos(angle)
                    const outerY = 200 + 180 * Math.sin(angle)
                    const innerX = 200 + 120 * Math.cos(angle)
                    const innerY = 200 + 120 * Math.sin(angle)
                    const isSelected = selectedKey === index
                    const isRelated =
                      (selectedKey + 1) % 12 === index ||
                      (selectedKey + 11) % 12 === index

                    return (
                      <g key={key.major}>
                        {isSelected && (
                          <>
                            <circle
                              cx={outerX}
                              cy={outerY}
                              r="28"
                              className="fill-primary/20"
                            />
                            <circle
                              cx={innerX}
                              cy={innerY}
                              r="18"
                              className="fill-primary/20"
                            />
                          </>
                        )}

                        <g
                          onClick={() => setSelectedKey(index)}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={outerX}
                            cy={outerY}
                            r="24"
                            className={cn(
                              "transition-colors",
                              isSelected
                                ? "fill-primary"
                                : isRelated
                                ? "fill-primary/50"
                                : "fill-card hover:fill-card/80"
                            )}
                          />
                          <text
                            x={outerX}
                            y={outerY}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className={cn(
                              "text-sm font-bold pointer-events-none",
                              isSelected
                                ? "fill-primary-foreground"
                                : "fill-foreground"
                            )}
                          >
                            {key.major}
                          </text>
                        </g>

                        <g
                          onClick={() => {
                            setSelectedKey(index)
                            setShowMinor(true)
                          }}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={innerX}
                            cy={innerY}
                            r="16"
                            className={cn(
                              "transition-colors",
                              isSelected && showMinor
                                ? "fill-primary"
                                : isSelected
                                ? "fill-primary/30"
                                : "fill-muted hover:fill-muted/80"
                            )}
                          />
                          <text
                            x={innerX}
                            y={innerY}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className={cn(
                              "text-[10px] font-medium pointer-events-none",
                              isSelected && showMinor
                                ? "fill-primary-foreground"
                                : "fill-muted-foreground"
                            )}
                          >
                            {key.minor}
                          </text>
                        </g>
                      </g>
                    )
                  })}
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-primary">
                      {showMinor ? selectedKeyInfo.minor : selectedKeyInfo.major}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {selectedKeyInfo.sharps > 0
                        ? `${selectedKeyInfo.sharps} sharp${selectedKeyInfo.sharps > 1 ? "s" : ""}`
                        : selectedKeyInfo.flats > 0
                        ? `${selectedKeyInfo.flats} flat${selectedKeyInfo.flats > 1 ? "s" : ""}`
                        : "No sharps or flats"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setShowMinor(false)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    !showMinor
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  Major
                </button>
                <button
                  onClick={() => setShowMinor(true)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    showMinor
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  Minor
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-semibold text-lg mb-4">
                  {showMinor ? selectedKeyInfo.minor : selectedKeyInfo.major} Key
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Relative {showMinor ? "Major" : "Minor"}
                    </p>
                    <button
                      onClick={() => setShowMinor(!showMinor)}
                      className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
                    >
                      {showMinor ? selectedKeyInfo.major : selectedKeyInfo.minor}
                    </button>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Related Keys (Perfect 4th / 5th)
                    </p>
                    <div className="flex gap-2">
                      {relatedKeys.map((key) => (
                        <button
                          key={key.major}
                          onClick={() => {
                            const index = circleData.findIndex(
                              (k) => k.major === key.major
                            )
                            setSelectedKey(index)
                          }}
                          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors"
                        >
                          {showMinor ? key.minor : key.major}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Key Signature
                    </p>
                    <p className="font-medium">
                      {selectedKeyInfo.sharps > 0
                        ? `${selectedKeyInfo.sharps} sharp${selectedKeyInfo.sharps > 1 ? "s" : ""}: ${["F#", "C#", "G#", "D#", "A#", "E#"].slice(0, selectedKeyInfo.sharps).join(", ")}`
                        : selectedKeyInfo.flats > 0
                        ? `${selectedKeyInfo.flats} flat${selectedKeyInfo.flats > 1 ? "s" : ""}: ${["Bb", "Eb", "Ab", "Db", "Gb"].slice(0, selectedKeyInfo.flats).join(", ")}`
                        : "No sharps or flats"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-semibold text-sm mb-3">How to Use</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">&bull;</span>
                    <span>Adjacent keys share most notes and sound good together</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">&bull;</span>
                    <span>Inner circle shows relative minor keys</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">&bull;</span>
                    <span>Use for key changes and chord progressions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}