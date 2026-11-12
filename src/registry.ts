import type { documents } from './content/documents'
import type { folders } from './content/collections'

export type Target =
  | { kind: 'document'; ref: keyof typeof documents }
  | { kind: 'folder'; ref: keyof typeof folders }
  | { kind: 'bookmarks' }
  | { kind: 'player' }
  | { kind: 'pdf'; url: string | null }

export interface DesktopEntry {
  id: string
  label: string
  icon: string
  description: string
  target: Target
  startColumn: 'documents' | 'places' | null
  initialOpen?: true | 'minimized'
}

// Array order determines the icon order and the order within each Start column.
export const entries: readonly DesktopEntry[] = [
  { id: 'about', label: 'About Me.doc', icon: 'about', description: 'Academic profile', target: { kind: 'document', ref: 'profile' }, startColumn: 'documents', initialOpen: true },
  { id: 'projects', label: 'Projects', icon: 'projects', description: 'Research projects', target: { kind: 'folder', ref: 'projects' }, startColumn: 'places' },
  { id: 'photos', label: 'Photos', icon: 'photos', description: 'Photo collection', target: { kind: 'folder', ref: 'photos' }, startColumn: 'places' },
  { id: 'contact', label: 'Contact.txt', icon: 'contact', description: 'Contact information', target: { kind: 'document', ref: 'contact' }, startColumn: 'documents' },
  { id: 'cv', label: 'CV.pdf', icon: 'cv', description: 'Academic CV', target: { kind: 'pdf', url: '/documents/cv.pdf' }, startColumn: 'documents' },
  { id: 'browser', label: 'Internet', icon: 'browser', description: 'Favorite websites', target: { kind: 'bookmarks' }, startColumn: 'documents' },
  { id: 'player', label: 'Windows Media Player', icon: 'player', description: 'Music and videos', target: { kind: 'player' }, startColumn: 'documents', initialOpen: 'minimized' },
]

export const xpAssets = '/media/xp'

export function iconUrl(name: string) {
  return name === 'player' ? '/media/player.svg' : `${xpAssets}/${name}.png`
}
