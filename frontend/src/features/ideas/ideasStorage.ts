const STORAGE_KEY = 'musicman.songIdeas.v1'

export type StoredIdea = {
  id: string
  text: string
  createdAt: string
  audioDataUrl?: string
}

export function loadStoredIdeas(): StoredIdea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is StoredIdea =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as StoredIdea).id === 'string' &&
        typeof (item as StoredIdea).text === 'string' &&
        typeof (item as StoredIdea).createdAt === 'string',
    )
  } catch {
    return []
  }
}

export function saveStoredIdeas(ideas: StoredIdea[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas))
  } catch (e) {
    console.error('Failed to persist song ideas', e)
    throw e
  }
}
