import { Route, Routes } from 'react-router-dom'
import { AICoachPage } from '../features/ai/AICoachPage'
import { GuitarChordLibraryPage } from '../features/chords/GuitarChordLibraryPage'
import { PianoChordBuilderPage } from '../features/chords/PianoChordBuilderPage'
import { PianoChordLibraryPage } from '../features/chords/PianoChordLibraryPage'
import { IdeasPage } from '../features/ideas/IdeasPage'
import { SongStructurePage } from '../features/songs/SongStructurePage'
import { CircleOfFifthsPage } from '../features/theory/CircleOfFifthsPage'
import { TunerPage } from '../features/tuner/TunerPage'

const TunerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M2 12a10 10 0 0 1 10-10M22 12a10 10 0 0 0-10-10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const GuitarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3l5 5-2.5 2.5L16 8M2 22l4.5-4.5M8.5 13.5l2-2" />
    <path d="M9.5 9a5 5 0 0 0-1 7.5 5 5 0 0 0 7.5-1l2-2a5 5 0 0 0 0-7 5 5 0 0 0-7 0l-1.5 2.5z" />
  </svg>
)

const PianoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M6 4v10M10 4v10M14 4v10M18 4v10" />
    <path d="M2 14h20" />
  </svg>
)

const BuilderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

const SongIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
)

const IdeaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
  </svg>
)

const CircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const AIIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
  </svg>
)

export const appRoutes = [
  { path: '/', label: 'Tuner', component: TunerPage, icon: TunerIcon },
  { path: '/guitar-chords', label: 'Guitar Chords', component: GuitarChordLibraryPage, icon: GuitarIcon },
  { path: '/piano-chords', label: 'Piano Chords', component: PianoChordLibraryPage, icon: PianoIcon },
  { path: '/piano-builder', label: 'Chord Builder', component: PianoChordBuilderPage, icon: BuilderIcon },
  { path: '/song-structure', label: 'Song Structure', component: SongStructurePage, icon: SongIcon },
  { path: '/ideas', label: 'Ideas', component: IdeasPage, icon: IdeaIcon },
  { path: '/circle-of-fifths', label: 'Circle of 5ths', component: CircleOfFifthsPage, icon: CircleIcon },
  { path: '/ai-coach', label: 'AI Coach', component: AICoachPage, icon: AIIcon },
]

export function AppRoutes() {
  return (
    <Routes>
      {appRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={<route.component />} />
      ))}
    </Routes>
  )
}
