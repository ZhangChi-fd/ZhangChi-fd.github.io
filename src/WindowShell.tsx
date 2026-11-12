import { useRef, type Dispatch, type PointerEvent, type ReactNode } from 'react'
import type { ManagedWindow, Point, Size, WindowAction } from './windowManager'

interface ShellProps {
  item: ManagedWindow
  active: boolean
  title: string
  application?: string
  icon: string
  children: ReactNode
  dispatch: Dispatch<WindowAction>
  readArea: () => Size
  onDismiss: (id: string, type: 'close' | 'minimize') => void
}

export default function WindowShell({ item, active, title, application, icon, children, dispatch, readArea, onDismiss }: ShellProps) {
  const drag = useRef<{ pointer: number; offset: Point } | null>(null)
  const frame = useRef<HTMLElement>(null)
  const resizing = useRef<{ pointer: number; x: number; y: number; w: number; h: number; origin: Point } | null>(null)
  const maximize = () => dispatch({ type: 'maximize', id: item.id })

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (item.maximized || !event.isPrimary || event.button !== 0 || event.pointerType === 'touch'
      || window.matchMedia('(max-width: 680px)').matches) return
    drag.current = {
      pointer: event.pointerId,
      offset: { x: event.clientX - item.position.x, y: event.clientY - item.position.y },
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (!current || current.pointer !== event.pointerId) return
    dispatch({
      type: 'move', id: item.id, area: readArea(),
      position: { x: event.clientX - current.offset.x, y: event.clientY - current.offset.y },
    })
  }

  function focus() {
    if (!active) dispatch({ type: 'focus', id: item.id })
  }

  function startResize(event: PointerEvent<HTMLSpanElement>) {
    if (!event.isPrimary || event.button !== 0 || !frame.current) return
    const rect = frame.current.getBoundingClientRect()
    resizing.current = { pointer: event.pointerId, ...item.position, w: rect.width, h: rect.height,
      origin: { x: event.clientX, y: event.clientY } }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  function resize(event: PointerEvent<HTMLSpanElement>, edge: string) {
    const from = resizing.current
    if (!from || event.pointerId !== from.pointer) return
    const area = readArea()
    const dx = event.clientX - from.origin.x, dy = event.clientY - from.origin.y
    const right = Math.min(area.width, from.x + from.w), bottom = Math.min(area.height, from.y + from.h)
    const minW = Math.min(360, right), minH = Math.min(220, bottom)
    const x = edge.includes('w') ? Math.max(0, Math.min(right - minW, from.x + dx)) : from.x
    const y = edge.includes('n') ? Math.max(0, Math.min(bottom - minH, from.y + dy)) : from.y
    const width = edge.includes('e') ? Math.min(area.width - x, Math.max(minW, from.w + dx)) : right - x
    const height = edge.includes('s') ? Math.min(area.height - y, Math.max(minH, from.h + dy)) : bottom - y
    dispatch({ type: 'resize', id: item.id, position: { x, y }, size: { width, height } })
  }

  return <section ref={frame} className="xp-window" id={`window-${item.id}`} aria-label={title}
    tabIndex={-1} hidden={item.minimized} data-active={active}
    data-maximized={item.maximized}
    style={item.maximized ? { left: 0, top: 0, width: '100%', height: '100%', zIndex: item.layer } : {
      left: item.position.x, top: item.position.y, zIndex: item.layer,
      width: item.size.width, height: item.size.height,
    }}
    onFocusCapture={focus} onPointerDownCapture={focus}>
    <header className="window-bar">
      <div className="title-grip" onPointerDown={startDrag} onPointerMove={moveDrag}
        onDoubleClick={() => { if (!window.matchMedia('(max-width: 680px)').matches) maximize() }}
        onLostPointerCapture={() => { drag.current = null }}>
        <img src={icon} alt="" draggable={false} />
        <strong>{title}{application && ` - ${application}`}</strong>
      </div>
      <div className="window-controls">
        <button type="button" className="minimize" title="Minimize" aria-label={`Minimize ${title}`}
          onClick={() => onDismiss(item.id, 'minimize')} />
        <button type="button" className="maximize" title={item.maximized ? 'Restore Down' : 'Maximize'}
          aria-label={`${item.maximized ? 'Restore' : 'Maximize'} ${title}`} onClick={maximize} />
        <button type="button" className="close" title="Close" aria-label={`Close ${title}`}
          onClick={() => onDismiss(item.id, 'close')} />
      </div>
    </header>
    <div className="window-body">{children}</div>
    {!item.maximized && ['n','s','e','w','ne','nw','se','sw'].map(edge =>
      <span key={edge} className={`resize-edge edge-${edge}`} aria-hidden="true"
        onPointerDown={startResize} onPointerMove={event => resize(event, edge)}
        onLostPointerCapture={() => { resizing.current = null }} />)}
  </section>
}
