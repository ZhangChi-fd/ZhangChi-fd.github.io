import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { entries, iconUrl, reviewAssets } from './registry'
import { profile } from './content/documents'
import { ContentViewer, applicationName } from './viewers'
import WindowShell from './WindowShell'
import Clock from './Clock'
import { MediaPlayer, Transport, Volume, useMusic } from './MediaPlayer'
import './multimedia.css'
import { activeWindow, windowReducer } from './windowManager'

type EntryId = typeof entries[number]['id']

const playerEntry = entries.find(entry => entry.target.kind === 'player')!

export default function Desktop() {
  const [selected, setSelected] = useState<EntryId | null>(null)
  const [startOpen, setStartOpen] = useState(false)
  const startButton = useRef<HTMLButtonElement>(null)
  const startArea = useRef<HTMLDivElement>(null)
  const desktopIcons = useRef(new Map<EntryId, HTMLButtonElement>())
  const stage = useRef<HTMLDivElement>(null)
  const [windows, dispatch] = useReducer(windowReducer, [])
  const active = activeWindow(windows)
  const [popup, setPopup] = useState<'volume' | 'date' | null>(null)
  const tray = useRef<HTMLDivElement>(null)
  const speaker = useRef<HTMLButtonElement>(null)
  function showPlayer() { openEntry(playerEntry, speaker.current) }
  const music = useMusic(showPlayer, windows.some(item => item.id === playerEntry.id), active?.id === playerEntry.id)
  const pendingFocus = useRef<{ fallback: HTMLElement | null } | null>(null)
  const launchers = useRef(new Map<string, HTMLElement | null>())
  const pointerType = useRef('')

  function readArea() {
    return { width: stage.current!.clientWidth, height: stage.current!.clientHeight }
  }

  useLayoutEffect(() => {
    for (const entry of entries) {
      if (entry.initialOpen) dispatch({ type: 'open', id: entry.id, area: readArea() })
      if (entry.initialOpen === 'minimized') dispatch({ type: 'minimize', id: entry.id })
    }
    const observer = new ResizeObserver(() => {
      if (!window.matchMedia('(max-width: 680px)').matches) dispatch({ type: 'fit', area: readArea() })
    })
    observer.observe(stage.current!)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!pendingFocus.current) return
    const target = active ? document.getElementById(`window-${active.id}`) : pendingFocus.current.fallback
    const focusTarget = target ?? startButton.current
    focusTarget?.focus({ preventScroll: true })
    pendingFocus.current = null
  }, [windows, active])

  useEffect(() => {
    if (!startOpen) return
    function dismiss(event: Event) {
      if (event.target instanceof Node && !startArea.current?.contains(event.target)) {
        setStartOpen(false)
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('focusin', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('focusin', dismiss)
    }
  }, [startOpen])

  function openEntry(entry: typeof entries[number], launcher: HTMLElement | null) {
    setSelected(entry.id)
    setStartOpen(false)
    setPopup(null)
    if (entry.target.kind === 'pdf') {
      if (entry.target.url) window.open(entry.target.url, '_blank', 'noopener,noreferrer')
      else launcher?.focus()
      return
    }
    launchers.current.set(entry.id, launcher)
    pendingFocus.current = { fallback: launcher }
    dispatch({ type: 'open', id: entry.id, area: readArea() })
  }

  function dismissWindow(id: string, type: 'close' | 'minimize') {
    if (id === playerEntry.id && type === 'close') music.close()
    pendingFocus.current = { fallback: launchers.current.get(id) ?? desktopIcons.current.get(id) ?? null }
    if (type === 'close') launchers.current.delete(id)
    dispatch({ type, id })
  }

  return <main
    aria-label={`${profile.name}’s academic desktop`}
    className="desktop"
    style={reviewAssets ? { backgroundImage: `url("${reviewAssets}/bliss.webp")` } : undefined}
    onPointerDown={event => {
      if (!tray.current?.contains(event.target as Node)) setPopup(null)
      if (event.target === event.currentTarget) setSelected(null)
    }}
    onKeyDown={event => {
      if (event.key !== 'Escape') return
      if (popup) {
        if (popup === 'volume') speaker.current?.focus()
        setPopup(null)
        return
      }
      if (startOpen) {
        setStartOpen(false)
        startButton.current?.focus()
      } else {
        setSelected(null)
      }
    }}
  >
    <nav className="shortcuts" aria-label="Desktop shortcuts" data-window-open={Boolean(active)}>
      {entries.map(entry => <button
        key={entry.id}
        ref={button => {
          if (button) desktopIcons.current.set(entry.id, button)
          else desktopIcons.current.delete(entry.id)
        }}
        type="button"
        className="shortcut"
        title={entry.description}
        aria-pressed={selected === entry.id}
        aria-disabled={entry.target.kind === 'pdf' && !entry.target.url || undefined}
        aria-description={entry.description}
        onPointerDown={event => { pointerType.current = event.pointerType }}
        onClick={event => {
          if (event.detail === 0 || pointerType.current === 'touch' || pointerType.current === 'pen') {
            openEntry(entry, event.currentTarget)
          } else setSelected(entry.id)
        }}
        onDoubleClick={event => {
          if (pointerType.current === 'mouse') openEntry(entry, event.currentTarget)
        }}
      >
        <img src={iconUrl(entry.icon)} alt="" draggable={false} />
        <span>{entry.label}</span>
      </button>)}
    </nav>
    <div className="window-stage" ref={stage}>
      {windows.map(item => {
        const entry = entries.find(candidate => candidate.id === item.id)!
        if (entry.target.kind === 'pdf') return null
        const target = entry.target
        return <WindowShell key={item.id} item={item} active={item.id === active?.id}
          icon={iconUrl(entry.icon)} title={entry.label} application={applicationName(target)}
          dispatch={dispatch} readArea={readArea} onDismiss={dismissWindow}>
          {target.kind === 'player' ? <MediaPlayer music={music} /> :
            <ContentViewer entry={entry} target={target} onOpen={next => openEntry(next, desktopIcons.current.get(next.id) ?? null)} />}
        </WindowShell>
      })}
    </div>
    <footer className="taskbar" aria-label="Taskbar">
      <div className="start-area" ref={startArea}>
        <button
          ref={startButton}
          type="button"
          className="start-button"
          aria-expanded={startOpen}
          aria-controls="start-menu"
          onClick={() => setStartOpen(open => !open)}
        >
          <img src={iconUrl('start')} alt="" />
          start
        </button>
        <nav className="start-menu" id="start-menu" aria-label="Start menu" hidden={!startOpen}>
          <header className="user-strip">
            <span className="user-tile" aria-hidden="true">
              {reviewAssets ? <img src={`${reviewAssets}/avatar.png`} alt="" /> : profile.initials}
            </span>
            {profile.name}
          </header>
          <div className="menu-columns">
            {(['documents', 'places'] as const).map(column => <div className={column} key={column}>
              {entries.filter(entry => entry.startColumn === column).map(entry =>
                <button type="button" key={entry.id} disabled={entry.target.kind === 'pdf' && !entry.target.url}
                  onClick={() => openEntry(entry, startButton.current)}>
                  <img src={iconUrl(entry.icon)} alt="" />
                  <span><strong>{entry.label}</strong>
                    {column === 'documents' && <small>{entry.description}</small>}
                  </span>
                </button>,
              )}
            </div>)}
          </div>
          <div className="menu-foot" aria-hidden="true" />
        </nav>
      </div>
      <nav className="task-list" aria-label="Open windows">
        {windows.map(item => {
          const entry = entries.find(candidate => candidate.id === item.id)!
          return <button key={item.id} type="button" className="task" aria-label={entry.label}
            aria-controls={`window-${item.id}`} aria-pressed={active?.id === item.id}
            title={item.minimized ? `Restore ${entry.label}` : entry.label}
            onClick={() => {
              pendingFocus.current = { fallback: startButton.current }
              dispatch({ type: 'focus', id: item.id })
            }}>
            <img src={iconUrl(entry.icon)} alt="" /><span>{entry.label}</span>
          </button>
        })}
      </nav>
      <div className="system-tray" ref={tray}>
        <button className="tray-speaker" ref={speaker} aria-label="Volume control" title="Volume" aria-expanded={popup === 'volume'}
          onClick={() => { setStartOpen(false); setPopup(popup === 'volume' ? null : 'volume') }}><img src="/media/speaker.svg" alt="" /></button>
        {popup === 'volume' && <section className="volume-popup" aria-label="Volume control">
          <strong>Volume</strong><Volume music={music} vertical /><div className="tray-track">{music.track?.title}</div>
          <Transport music={music} /><button className="launch-player" onClick={showPlayer}>Open Media Player</button>
        </section>}
        <Clock open={popup === 'date'} setOpen={open => { setStartOpen(false); setPopup(open ? 'date' : null) }} />
      </div>
    </footer>
  </main>
}
