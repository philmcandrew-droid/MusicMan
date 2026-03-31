import { describe, expect, it } from 'vitest'
import { guitarChords, pianoChords } from './chordData'

describe('chordData', () => {
  it('includes guitar chords with frets and notes', () => {
    expect(guitarChords.length).toBeGreaterThan(0)
    const c = guitarChords.find((ch) => ch.name === 'C')
    expect(c?.frets.length).toBe(6)
    expect(c?.notes).toContain('C')
  })

  it('includes piano chords', () => {
    expect(pianoChords.length).toBeGreaterThan(0)
  })
})
