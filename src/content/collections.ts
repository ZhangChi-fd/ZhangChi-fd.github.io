import { projects, type Project } from './projects'
import { albums, photos, type Photo, type Album } from './photos'

export type FolderItem =
  | { kind: 'album'; record: Album }
  | { kind: 'project'; record: Project }
  | { kind: 'photo'; record: Photo }
  | { kind: 'shortcut'; id: string; entryId: string }
  | { kind: 'link'; id: string; title: string; url: string }

export interface FolderContent {
  group: string
  empty: string
  defaultView: 'Icons' | 'Thumbnails'
  items: FolderItem[]
}

export const folders = {
  projects: {
    group: 'Research topics', empty: 'No projects have been added yet.', defaultView: 'Icons',
    items: projects.map(record => ({ kind: 'project' as const, record })),
  },
  photos: {
    group: 'Pictures', empty: 'No photos have been added yet.', defaultView: 'Thumbnails',
    items: [
      ...albums.map(record => ({ kind: 'album' as const, record })),
      ...photos.map(record => ({ kind: 'photo' as const, record })),
    ],
  },
} satisfies Record<string, FolderContent>
