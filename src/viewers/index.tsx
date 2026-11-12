import { lazy, Suspense } from 'react'
import { documents } from '../content/documents'
import { folders } from '../content/collections'
import type { DesktopEntry, Target } from '../registry'
import DocumentViewer from './Document'
import FolderViewer from './Folder'
import Favorites from './Favorites'
import './viewers.css'

type WindowTarget = Exclude<Target, { kind: 'pdf' }>
const LocalAbout = import.meta.env.DEV ? lazy(() => import('./LocalAbout')) : null
export function applicationName(target: WindowTarget) {
  if (target.kind === 'document') return documents[target.ref].appearance === 'word' ? 'Microsoft Word (Read-Only)' : 'Notepad'
}

export function ContentViewer({ entry, target, onOpen }: { entry: DesktopEntry; target: WindowTarget; onOpen: (entry: DesktopEntry) => void }) {
  switch (target.kind) {
    case 'bookmarks': return <Favorites />
    case 'document': {
      const reader = <DocumentViewer content={documents[target.ref]} onOpen={onOpen} />
      if (LocalAbout && target.ref === 'profile' && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname))
        return <Suspense fallback={reader}><LocalAbout onOpen={onOpen} /></Suspense>
      return reader
    }
    case 'folder': return <FolderViewer entry={entry} folder={folders[target.ref]} onOpen={onOpen} />
  }
}
