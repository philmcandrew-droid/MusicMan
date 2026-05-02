import { useState } from 'react'

const faqs = [
  { q: 'How do I use the tuner?', a: "Select the string you want to tune, tap 'Start Tuner', and play the string. The needle shows if you're flat (left), in tune (center/green), or sharp (right). Adjust your tuning peg until the needle stays centered." },
  { q: "Why isn't my microphone working?", a: "Make sure you've granted microphone permissions to the app. You can also check Settings > Audio to select the correct input device." },
  { q: 'What is the Circle of Fifths?', a: 'The Circle of Fifths is a visual representation of the relationships between the 12 tones of the chromatic scale. It helps you understand key signatures, find related chords, and plan chord progressions.' },
  { q: 'How do I save my ideas?', a: "Go to the Ideas section and type your note or tap Record. Your ideas are saved automatically to your device's local storage." },
  { q: 'Can I customise the reference pitch?', a: 'Yes! Go to Settings and adjust the Reference A Frequency slider. Standard is A=440 Hz, but some orchestras use 432 or 442 Hz.' },
]

const features = [
  { icon: 'tuner', title: 'Tuner', desc: 'Accurate chromatic tuner with visual feedback and reference tones' },
  { icon: 'guitar', title: 'Guitar Chords', desc: '430+ chords with CAGED positions, inversions, and jazz voicings' },
  { icon: 'piano', title: 'Piano Chords', desc: 'Visual piano keyboard with chord highlighting' },
  { icon: 'builder', title: 'Chord Builder', desc: 'Build custom chords by selecting intervals' },
  { icon: 'song', title: 'Song Structure', desc: 'Plan and visualise your song arrangements' },
  { icon: 'idea', title: 'Ideas', desc: 'Capture ideas with text notes and voice recordings' },
  { icon: 'circle', title: 'Circle of Fifths', desc: 'Explore key relationships visually' },
  { icon: 'ai', title: 'AI Coach', desc: 'Personalised music learning assistance powered by AI' },
]

function FeatureIcon({ type }: { type: string }) {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }
  switch (type) {
    case 'tuner': return <svg {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" /></svg>
    case 'guitar': return <svg {...props}><path d="M16 3l5 5-2.5 2.5L16 8M2 22l4.5-4.5" /><path d="M9.5 9a5 5 0 0 0-1 7.5 5 5 0 0 0 7.5-1l2-2a5 5 0 0 0 0-7 5 5 0 0 0-7 0l-1.5 2.5z" /></svg>
    case 'piano': return <svg {...props}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 4v10M10 4v10M14 4v10M18 4v10M2 14h20" /></svg>
    case 'builder': return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
    case 'song': return <svg {...props}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
    case 'idea': return <svg {...props}><path d="M9 18h6M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></svg>
    case 'circle': return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    case 'ai': return <svg {...props}><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" /></svg>
    default: return null
  }
}

export function AboutPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  return (
    <div className="page-card stack">
      <h2 className="page-title">Help Center</h2>
      <p className="page-subtitle">Everything you need to know about MusicMan.</p>

      {/* Features overview */}
      <div>
        <h3 className="section-label">Features</h3>
        <div className="help-features-grid">
          {features.map((f) => (
            <div key={f.title} className="help-feature-item">
              <div className="help-feature-icon"><FeatureIcon type={f.icon} /></div>
              <div>
                <strong>{f.title}</strong>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h3 className="section-label">Frequently Asked Questions</h3>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item${openFAQ === i ? ' faq-open' : ''}`}>
              <button className="faq-question" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                <span>{faq.q}</span>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="faq-chevron">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFAQ === i && (
                <div className="faq-answer">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* About section */}
      <div className="help-about-card">
        <div className="about-logo">
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <h3>About MusicMan</h3>
        <p className="help-about-desc">
          MusicMan is your personal musician assistant, helping you tune your
          instruments, learn chords, build songs, and improve your musical skills.
        </p>
        <p className="help-about-dev">Developed by Phil McAndrew</p>
        <span className="help-about-version">Version 1.1</span>
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        &copy; 2026 Phil McAndrew. All rights reserved.
      </p>
    </div>
  )
}
