import type { ComponentType } from 'react'
import { AboutPage } from '../features/about/AboutPage'
import { AICoachPage } from '../features/ai/AICoachPage'
import { GuitarChordLibraryPage } from '../features/chords/GuitarChordLibraryPage'
import { OpenTuningChordPage } from '../features/chords/OpenTuningChordPage'
import { PianoChordBuilderPage } from '../features/chords/PianoChordBuilderPage'
import { PianoChordLibraryPage } from '../features/chords/PianoChordLibraryPage'
import { HomePage } from '../features/home/HomePage'
import { IdeasPage } from '../features/ideas/IdeasPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { SongStructurePage } from '../features/songs/SongStructurePage'
import { CircleOfFifthsPage } from '../features/theory/CircleOfFifthsPage'
import { TunerPage } from '../features/tuner/TunerPage'
import { AboutIcon, AIIcon, BuilderIcon, CircleIcon, GuitarIcon, HomeIcon, IdeaIcon, OpenTuningIcon, PianoIcon, SettingsIcon, SongIcon, TunerIcon } from './navIcons'

export type AppRoute = {
  path: string
  label: string
  component: ComponentType
  icon: ComponentType
}

export const appRoutes: AppRoute[] = [
  { path: '/', label: 'Home', component: HomePage, icon: HomeIcon },
  { path: '/tuner', label: 'Tuner', component: TunerPage, icon: TunerIcon },
  { path: '/guitar-chords', label: 'Guitar', component: GuitarChordLibraryPage, icon: GuitarIcon },
  { path: '/open-tunings', label: 'Tunings', component: OpenTuningChordPage, icon: OpenTuningIcon },
  { path: '/piano-chords', label: 'Piano', component: PianoChordLibraryPage, icon: PianoIcon },
  { path: '/piano-builder', label: 'Builder', component: PianoChordBuilderPage, icon: BuilderIcon },
  { path: '/song-structure', label: 'Songs', component: SongStructurePage, icon: SongIcon },
  { path: '/ideas', label: 'Ideas', component: IdeasPage, icon: IdeaIcon },
  { path: '/circle-of-fifths', label: 'Circle', component: CircleOfFifthsPage, icon: CircleIcon },
  { path: '/ai-coach', label: 'Coach', component: AICoachPage, icon: AIIcon },
  { path: '/settings', label: 'Settings', component: SettingsPage, icon: SettingsIcon },
  { path: '/about', label: 'About', component: AboutPage, icon: AboutIcon },
]
