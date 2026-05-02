import { useEffect, useState } from 'react'

interface AudioDevice {
  id: string
  label: string
}

export function SettingsPage() {
  const [sensitivity, setSensitivity] = useState(50)
  const [referenceA, setReferenceA] = useState(440)
  const [autoDetect, setAutoDetect] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [leftHanded, setLeftHanded] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([])
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([])
  const [selectedInput, setSelectedInput] = useState('')
  const [selectedOutput, setSelectedOutput] = useState('')

  useEffect(() => {
    async function loadDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        const devices = await navigator.mediaDevices.enumerateDevices()
        const inputs: AudioDevice[] = []
        const outputs: AudioDevice[] = []
        let ic = 0, oc = 0
        for (const d of devices) {
          if (d.kind === 'audioinput') {
            ic++
            inputs.push({ id: d.deviceId, label: d.label || `Microphone ${ic}` })
          } else if (d.kind === 'audiooutput') {
            oc++
            outputs.push({ id: d.deviceId, label: d.label || `Speaker ${oc}` })
          }
        }
        setInputDevices(inputs)
        setOutputDevices(outputs)
        if (inputs.length > 0) setSelectedInput(inputs[0].id)
        if (outputs.length > 0) setSelectedOutput(outputs[0].id)
      } catch { /* mic permission denied */ }
    }
    loadDevices()
  }, [])

  return (
    <div className="page-card stack">
      <h2 className="page-title">Settings</h2>
      <p className="page-subtitle">Customise your MusicMan experience.</p>

      {/* Tuner Settings */}
      <div className="settings-group">
        <div className="settings-group-header">
          <div className="settings-group-icon" style={{ '--sg-color': 'var(--accent)' } as React.CSSProperties}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
          </div>
          <div>
            <h3 className="settings-group-name">Tuner Settings</h3>
            <p className="settings-group-desc">Configure your tuner preferences</p>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <span className="settings-label">Microphone Sensitivity</span>
            <span className="settings-desc">Adjust how sensitive the tuner is to input</span>
          </div>
          <div className="settings-slider-wrap">
            <input type="range" className="settings-slider" min={0} max={100} value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))} />
            <span className="settings-slider-val">{sensitivity}%</span>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <span className="settings-label">Reference A Frequency</span>
            <span className="settings-desc">Standard is 440 Hz. Some ensembles use 432 or 442 Hz</span>
          </div>
          <div className="settings-slider-wrap">
            <input type="range" className="settings-slider" min={430} max={450} value={referenceA} onChange={(e) => setReferenceA(Number(e.target.value))} />
            <span className="settings-slider-val">{referenceA} Hz</span>
          </div>
        </div>

        <label className="settings-row">
          <div>
            <span className="settings-label">Auto-detect String</span>
            <span className="settings-desc">Automatically detect which string you're playing</span>
          </div>
          <input type="checkbox" className="settings-toggle" checked={autoDetect} onChange={(e) => setAutoDetect(e.target.checked)} />
        </label>
      </div>

      {/* Audio Settings */}
      <div className="settings-group">
        <div className="settings-group-header">
          <div className="settings-group-icon" style={{ '--sg-color': '#10b981' } as React.CSSProperties}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
          </div>
          <div>
            <h3 className="settings-group-name">Audio Settings</h3>
            <p className="settings-group-desc">Sound input and output options</p>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <span className="settings-label">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.35rem' }}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
              Input Device
            </span>
            <span className="settings-desc">Microphone used for tuner and voice memos</span>
          </div>
          <select className="settings-select" value={selectedInput} onChange={(e) => setSelectedInput(e.target.value)}>
            {inputDevices.length === 0 && <option value="">No devices found</option>}
            {inputDevices.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>

        <div className="settings-row">
          <div>
            <span className="settings-label">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: '-2px', marginRight: '0.35rem' }}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
              Output Device
            </span>
            <span className="settings-desc">Speaker used for reference tones and playback</span>
          </div>
          <select className="settings-select" value={selectedOutput} onChange={(e) => setSelectedOutput(e.target.value)}>
            {outputDevices.length === 0 && <option value="">No devices found</option>}
            {outputDevices.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>
      </div>

      {/* Guitar Settings */}
      <div className="settings-group">
        <div className="settings-group-header">
          <div className="settings-group-icon" style={{ '--sg-color': '#f59e0b' } as React.CSSProperties}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3l5 5-2.5 2.5L16 8M2 22l4.5-4.5M8.5 13.5l2-2" /><path d="M9.5 9a5 5 0 0 0-1 7.5 5 5 0 0 0 7.5-1l2-2a5 5 0 0 0 0-7 5 5 0 0 0-7 0l-1.5 2.5z" /></svg>
          </div>
          <div>
            <h3 className="settings-group-name">Guitar</h3>
            <p className="settings-group-desc">Guitar display preferences</p>
          </div>
        </div>

        <label className="settings-row">
          <div>
            <span className="settings-label">Left-Handed Mode</span>
            <span className="settings-desc">Mirror chord diagrams for left-handed players</span>
          </div>
          <input type="checkbox" className="settings-toggle" checked={leftHanded} onChange={(e) => setLeftHanded(e.target.checked)} />
        </label>
      </div>

      {/* Appearance */}
      <div className="settings-group">
        <div className="settings-group-header">
          <div className="settings-group-icon" style={{ '--sg-color': '#6366f1' } as React.CSSProperties}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{darkMode ? <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></> : <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>}</svg>
          </div>
          <div>
            <h3 className="settings-group-name">Appearance</h3>
            <p className="settings-group-desc">Customise how MusicMan looks</p>
          </div>
        </div>

        <label className="settings-row">
          <div>
            <span className="settings-label">Dark Mode</span>
            <span className="settings-desc">Toggle between dark and light themes</span>
          </div>
          <input type="checkbox" className="settings-toggle" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
        </label>
      </div>

      {/* Notifications */}
      <div className="settings-group">
        <div className="settings-group-header">
          <div className="settings-group-icon" style={{ '--sg-color': '#ec4899' } as React.CSSProperties}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </div>
          <div>
            <h3 className="settings-group-name">Notifications</h3>
            <p className="settings-group-desc">Manage your notification preferences</p>
          </div>
        </div>

        <label className="settings-row">
          <div>
            <span className="settings-label">Practice Reminders</span>
            <span className="settings-desc">Get reminded to practice daily</span>
          </div>
          <input type="checkbox" className="settings-toggle" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
        </label>
      </div>

      {/* Data */}
      <div className="settings-group">
        <div className="settings-group-header">
          <div className="settings-group-icon" style={{ '--sg-color': '#14b8a6' } as React.CSSProperties}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
          </div>
          <div>
            <h3 className="settings-group-name">Data</h3>
            <p className="settings-group-desc">Storage and data management</p>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <span className="settings-label">Storage Used</span>
            <span className="settings-desc">Local storage for saved ideas and preferences</span>
          </div>
          <span className="settings-value">
            {typeof localStorage !== 'undefined'
              ? `${(new Blob(Object.values(localStorage)).size / 1024).toFixed(1)} KB`
              : '—'}
          </span>
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Settings are saved locally on your device.
      </p>
    </div>
  )
}
