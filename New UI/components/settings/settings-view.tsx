"use client"

import * as React from "react"
import { Volume2, Mic, Music2, Bell, Moon, Sun, Home } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface AudioDevice {
  id: string
  label: string
}

export function SettingsView() {
  const [tunerSensitivity, setTunerSensitivity] = React.useState([50])
  const [referenceA, setReferenceA] = React.useState([440])
  const [notifications, setNotifications] = React.useState(true)
  const [darkMode, setDarkMode] = React.useState(true)
  const [autoDetect, setAutoDetect] = React.useState(true)
  const [inputDevices, setInputDevices] = React.useState<AudioDevice[]>([])
  const [outputDevices, setOutputDevices] = React.useState<AudioDevice[]>([])
  const [selectedInput, setSelectedInput] = React.useState("")
  const [selectedOutput, setSelectedOutput] = React.useState("")

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark")
      setDarkMode(isDark)
    }
  }, [])

  React.useEffect(() => {
    async function loadDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        const devices = await navigator.mediaDevices.enumerateDevices()
        const inputs: AudioDevice[] = []
        const outputs: AudioDevice[] = []
        let inputCount = 0
        let outputCount = 0
        for (const d of devices) {
          if (d.kind === "audioinput") {
            inputCount++
            inputs.push({
              id: d.deviceId,
              label: d.label || `Microphone ${inputCount}`,
            })
          } else if (d.kind === "audiooutput") {
            outputCount++
            outputs.push({
              id: d.deviceId,
              label: d.label || `Speaker ${outputCount}`,
            })
          }
        }
        setInputDevices(inputs)
        setOutputDevices(outputs)
        if (inputs.length > 0 && !selectedInput) setSelectedInput(inputs[0].id)
        if (outputs.length > 0 && !selectedOutput) setSelectedOutput(outputs[0].id)
      } catch {
        // Microphone permission denied - leave lists empty
      }
    }
    loadDevices()
  }, [])

  const toggleTheme = (dark: boolean) => {
    setDarkMode(dark)
    if (typeof window !== "undefined") {
      if (dark) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("musicman-theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("musicman-theme", "light")
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors" aria-label="Home"><Home className="h-5 w-5" /></a>
          <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Customize your MusicMan experience
          </p></div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Tuner Settings */}
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Tuner Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Configure your tuner preferences
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Microphone Sensitivity</label>
                  <span className="text-sm text-muted-foreground">
                    {tunerSensitivity[0]}%
                  </span>
                </div>
                <Slider
                  value={tunerSensitivity}
                  onValueChange={setTunerSensitivity}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Reference A Frequency</label>
                  <span className="text-sm text-muted-foreground">
                    {referenceA[0]} Hz
                  </span>
                </div>
                <Slider
                  value={referenceA}
                  onValueChange={setReferenceA}
                  min={430}
                  max={450}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Auto-detect String</label>
                  <p className="text-xs text-muted-foreground">
                    Automatically detect which string you&apos;re playing
                  </p>
                </div>
                <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Volume2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Audio Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Sound and playback options
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Input Device
                </label>
                <select
                  value={selectedInput}
                  onChange={(e) => setSelectedInput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {inputDevices.length === 0 && (
                    <option value="">No devices found (grant mic permission)</option>
                  )}
                  {inputDevices.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Output Device
                </label>
                <select
                  value={selectedOutput}
                  onChange={(e) => setSelectedOutput(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {outputDevices.length === 0 && (
                    <option value="">No devices found (grant mic permission)</option>
                  )}
                  {outputDevices.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <h2 className="font-semibold text-lg">Appearance</h2>
                <p className="text-sm text-muted-foreground">
                  Customize how MusicMan looks
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Dark Mode</label>
                  <p className="text-xs text-muted-foreground">
                    Toggle between dark and light themes
                  </p>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleTheme} />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your notification preferences
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Practice Reminders</label>
                <p className="text-xs text-muted-foreground">
                  Get reminded to practice daily
                </p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>

          {/* About */}
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Music2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">About MusicMan</h2>
                <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              MusicMan is your personal musician assistant, helping you tune your
              instruments, learn chords, build songs, and improve your musical skills.
            </p>
            <p className="text-sm font-medium">
              Developed by Phil McAndrew
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}