"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TunerGaugeProps {
  cents: number // -50 to +50
  isActive: boolean
  detectedNote?: string
}

export function TunerGauge({ cents, isActive, detectedNote }: TunerGaugeProps) {
  // Clamp cents to -50 to +50
  const clampedCents = Math.max(-50, Math.min(50, cents))
  // Convert to angle (-45 to +45 degrees)
  const angle = (clampedCents / 50) * 45
  
  // Determine if in tune (within 5 cents)
  const isInTune = Math.abs(cents) < 5
  const isClose = Math.abs(cents) < 15

  return (
    <div className="relative flex flex-col items-center">
      {/* Main gauge container */}
      <div className="relative w-full max-w-[320px] sm:max-w-[400px] aspect-[2/1]">
        {/* Background arc */}
        <svg
          viewBox="0 0 200 100"
          className="w-full h-full"
          preserveAspectRatio="xMidYMax meet"
        >
          {/* Outer glow when in tune */}
          {isActive && isInTune && (
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}

          {/* Background track */}
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-secondary"
          />

          {/* Gradient segments - flat side (left) */}
          <path
            d="M 20 95 A 80 80 0 0 1 60 35"
            fill="none"
            stroke="url(#flatGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            className="opacity-80"
          />

          {/* Gradient segments - sharp side (right) */}
          <path
            d="M 140 35 A 80 80 0 0 1 180 95"
            fill="none"
            stroke="url(#sharpGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            className="opacity-80"
          />

          {/* Center "perfect" zone */}
          <path
            d="M 85 20 A 80 80 0 0 1 115 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className={cn(
              "transition-colors duration-300",
              isActive && isInTune ? "text-primary" : "text-primary/30"
            )}
            filter={isActive && isInTune ? "url(#glow)" : undefined}
          />

          {/* Tick marks */}
          {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((tick) => {
            const tickAngle = (tick / 50) * 45 - 90
            const radians = (tickAngle * Math.PI) / 180
            const innerRadius = tick === 0 ? 60 : 68
            const outerRadius = tick === 0 ? 78 : 75
            const x1 = 100 + innerRadius * Math.cos(radians)
            const y1 = 95 + innerRadius * Math.sin(radians)
            const x2 = 100 + outerRadius * Math.cos(radians)
            const y2 = 95 + outerRadius * Math.sin(radians)
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={tick === 0 ? 2 : 1}
                className={cn(
                  tick === 0 ? "text-primary" : "text-muted-foreground/50"
                )}
              />
            )
          })}

          {/* Gradients */}
          <defs>
            <linearGradient id="flatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.65 0.2 25)" />
              <stop offset="100%" stopColor="oklch(0.75 0.15 60)" />
            </linearGradient>
            <linearGradient id="sharpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.75 0.15 60)" />
              <stop offset="100%" stopColor="oklch(0.65 0.2 25)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-100 ease-out"
          style={{
            transform: `translateX(-50%) rotate(${angle}deg)`,
            width: "4px",
            height: "70%",
          }}
        >
          <div
            className={cn(
              "w-full h-full rounded-full transition-colors duration-300",
              isActive
                ? isInTune
                  ? "bg-primary shadow-[0_0_20px_rgba(74,222,128,0.5)]"
                  : isClose
                  ? "bg-yellow-500"
                  : "bg-muted-foreground"
                : "bg-muted-foreground/50"
            )}
          />
          <div
            className={cn(
              "absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-colors duration-300",
              isActive
                ? isInTune
                  ? "bg-primary shadow-[0_0_20px_rgba(74,222,128,0.5)]"
                  : isClose
                  ? "bg-yellow-500"
                  : "bg-muted-foreground"
                : "bg-muted-foreground/50"
            )}
          />
        </div>

        {/* Labels */}
        <div className="absolute bottom-0 left-4 sm:left-8 text-xs sm:text-sm font-medium text-muted-foreground">
          FLAT
        </div>
        <div className="absolute bottom-0 right-4 sm:right-8 text-xs sm:text-sm font-medium text-muted-foreground">
          SHARP
        </div>
      </div>

      {/* Status display */}
      <div className="mt-4 sm:mt-6 text-center">
        {isActive ? (
          <div className="space-y-1">
            <p
              className={cn(
                "text-2xl sm:text-3xl font-bold tracking-tight transition-colors",
                isInTune ? "text-primary" : "text-foreground"
              )}
            >
              {detectedNote || "Listening..."}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isInTune
                ? "Perfect!"
                : cents > 0
                ? `${Math.abs(Math.round(cents))} cents sharp`
                : `${Math.abs(Math.round(cents))} cents flat`}
            </p>
          </div>
        ) : (
          <p className="text-base sm:text-lg text-muted-foreground">
            Waiting for input...
          </p>
        )}
      </div>
    </div>
  )
}
