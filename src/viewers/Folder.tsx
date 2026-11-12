import { useLayoutEffect, useRef, useState } from 'react'
import { entries, iconUrl, xpAssets, type DesktopEntry } from '../registry'
import type { FolderContent, FolderItem } from '../content/collections'
import { Glyph, Menubar } from './chrome'
import { PhotoViewer, ProjectDetail } from './Detail'

function describe(item: FolderItem) {
  switch (item.kind) {
    case 'album': return { id: item.record.id, title: item.record.title, type: 'Picture folder', icon: iconUrl('photos') }
    case 'project': return { id: item.record.id, title: item.record.title, type: item.record.category, icon: iconUrl('projects') }
    case 'photo': return { id: item.record.id, title: item.record.title, type: 'Picture', icon: item.record.thumbnail }
    case 'link': return { id: item.id, title: item.title, type: 'Internet shortcut', icon: '/media/toolbar/world_link.png' }
    case 'shortcut': {
      const target = entries.find(entry => entry.id === item.entryId)!
      return { id: item.id, title: target.label, type: 'Shortcut', icon: iconUrl(target.icon) }
    }
  }
}

function Arrow({ direction }: { direction: 'back' | 'forward' | 'up' }) {
  return <img src={`${xpAssets}/nav-${direction}.png`} alt="" />
}

export default function FolderViewer({ entry, folder, onOpen }: { entry: DesktopEntry; folder: FolderContent; onOpen: (entry: DesktopEntry) => void }) {
  type Location = { albumId?: string; fileId?: string }
  const [history, setHistory] = useState<{ pages: Location[]; index: number }>({ pages: [{}], index: 0 })
  const [selection, select] = useState<string | null>(null)
  const [view, setView] = useState<string>(folder.defaultView)
  const [tree, setTree] = useState(false)
  const pointer = useRef('')
  const files = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef(false)
  const location = history.pages[history.index]
  const albumItems = folder.items.filter(item => item.kind === 'album')
  const album = albumItems.find(item => item.record.id === location.albumId)?.record
  const contents = album ? album.photos.map(record => ({ kind: 'photo' as const, record })) : folder.items
  const items = contents.map(item => ({ item, ...describe(item) }))
  const current = items.find(file => file.id === location.fileId)
  const selected = current ?? items.find(file => file.id === selection)
  const places = entries.filter(candidate => candidate.target.kind === 'folder')
  const count = `${items.length} object${items.length === 1 ? '' : 's'}`

  useLayoutEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    const item = files.current?.querySelector<HTMLElement>('[aria-pressed="true"]')
    const destination = item ?? files.current
    destination?.focus({ preventScroll: true })
  }, [history])

  function visit(page: Location) {
    pendingFocus.current = true
    setHistory(previous => ({ pages: [...previous.pages.slice(0, previous.index + 1), page], index: previous.index + 1 }))
  }
  function up() {
    select(current?.id ?? album?.id ?? null)
    visit(current ? { albumId: album?.id } : {})
  }
  function step(offset: number) {
    pendingFocus.current = true
    setHistory(previous => ({ ...previous, index: previous.index + offset }))
  }
  function open(item: FolderItem) {
    if (item.kind === 'link') { window.open(item.url, '_blank', 'noopener,noreferrer'); return }
    if (item.kind === 'shortcut') { onOpen(entries.find(candidate => candidate.id === item.entryId)!); return }
    if (item.kind === 'album') { select(null); visit({ albumId: item.record.id }); return }
    select(item.record.id)
    visit({ albumId: album?.id, fileId: item.record.id })
  }

  return <div className="app-view explorer">
    <Menubar labels={['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']} />
    <div className="explorer-tools">
      <button aria-label="Back" disabled={history.index === 0} onClick={() => step(-1)}><Arrow direction="back" /><span>Back</span></button>
      <button aria-label="Forward" title="Forward" disabled={history.index + 1 === history.pages.length} onClick={() => step(1)}><Arrow direction="forward" /></button>
      <button aria-label="Up one level" title="Up one level" disabled={!current && !album} onClick={up}><Arrow direction="up" /></button>
      <span className="tool-divider" />
      <button aria-pressed={tree} onClick={() => setTree(!tree)}><Glyph name="folder_explore" />Folders</button>
      <label className="view-selector"><Glyph name={view === 'List' ? 'application_view_list' : 'application_view_icons'} /><select value={view} aria-label="Folder view"
        onChange={event => setView(event.target.value)} disabled={Boolean(current)}>
        <option>Icons</option><option>Thumbnails</option><option>List</option>
      </select></label>
    </div>
    <div className="address-row"><span>Address</span><div><img src={iconUrl(entry.icon)} alt="" />
      <span>{['Desktop', entry.label, album?.title, current?.title].filter(Boolean).join(' \\ ')}</span></div></div>
    <div className="explorer-panes" data-tree={tree}>
      <aside className="tasks-pane" aria-label="Folder navigation">
        {tree ? <div className="folder-tree"><strong>Folders</strong><p>Desktop</p>
          {places.map(place => <button key={place.id} aria-current={place.id === entry.id ? 'location' : undefined}
            onClick={() => { if (place.id !== entry.id) onOpen(place); else if (current || album) visit({}) }}>
            <img src={iconUrl(place.icon)} alt="" />{place.label}</button>)}
          {albumItems.map(({record}) => <button className="album-branch" key={record.id}
            onClick={() => { select(null); visit({ albumId: record.id }) }}><img src={iconUrl('photos')} alt="" />{record.title}</button>)}</div> :
          <>
            <details open><summary>{folder.defaultView === 'Thumbnails' ? 'Picture Tasks' : 'File and Folder Tasks'}</summary>
              <div>{current ? <button onClick={up}><Glyph name="arrow_up" />Return to folder</button> :
                <button disabled={!selected} onClick={() => selected && open(selected.item)}><Glyph name="folder_page" />Open selected item</button>}</div>
            </details>
            <details open><summary>Other Places</summary><div>
              {entries.filter(place => place.id !== entry.id && place.target.kind !== 'pdf').map(place =>
                <button key={place.id} onClick={() => onOpen(place)}><img src={iconUrl(place.icon)} alt="" />{place.label}</button>)}
            </div></details>
            <details open><summary>Details</summary><div><strong>{selected?.title ?? album?.title ?? entry.label}</strong>
              <p>{selected?.type ?? 'File folder'}</p>{!selected && <p>{count}</p>}</div></details>
          </>}
      </aside>
      <div className="file-pane" ref={files} tabIndex={-1} aria-label="Folder contents">
        {current?.item.kind === 'project' ? <ProjectDetail project={current.item.record} /> :
          current?.item.kind === 'photo' ? <PhotoViewer photo={current.item.record}
            collection={contents.flatMap(item => item.kind === 'photo' ? [item.record] : [])}
            onChoose={id => { select(id); visit({ albumId: album?.id, fileId: id }) }} /> :
            <>
              <h2 className="group-title">{album?.title ?? folder.group}</h2>
              {items.length === 0 && <p className="folder-empty">{folder.empty}</p>}
              <div className="file-grid" data-view={view}>
                {items.map(file => <button className="file-item" key={file.id} aria-pressed={selection === file.id}
                  onPointerDown={event => { pointer.current = event.pointerType }}
                  onClick={event => {
                    select(file.id)
                    if (event.detail === 0 || pointer.current === 'touch' || pointer.current === 'pen') open(file.item)
                  }}
                  onDoubleClick={() => { if (pointer.current === 'mouse') open(file.item) }}>
                  <span className="file-image"><img src={file.icon} alt="" loading="lazy" /></span>
                  <span>{file.title}</span>
                </button>)}
              </div>
            </>}
      </div>
    </div>
    <div className="explorer-status"><span>{selected?.type ?? count}</span><span><img src={iconUrl(entry.icon)} alt="" />{entry.label}</span></div>
  </div>
}
