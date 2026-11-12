export interface Point { x: number; y: number }
export interface Size { width: number; height: number }

export interface ManagedWindow {
  id: string
  position: Point
  size: Size
  maximized: boolean
  minimized: boolean
  layer: number
}

export type WindowAction =
  | { type: 'open'; id: string; area: Size }
  | { type: 'focus' | 'minimize' | 'maximize' | 'close'; id: string }
  | { type: 'move'; id: string; position: Point; area: Size }
  | { type: 'resize'; id: string; position: Point; size: Size }
  | { type: 'fit'; area: Size }

export const windowSize: Size = { width: 732, height: 544 }

function clamp(point: Point, area: Size, size: Size): Point {
  const maxX = Math.max(0, area.width - size.width)
  const maxY = Math.max(0, area.height - size.height)
  return { x: Math.max(0, Math.min(point.x, maxX)), y: Math.max(0, Math.min(point.y, maxY)) }
}

export function activeWindow(windows: ManagedWindow[]) {
  return windows.reduce<ManagedWindow | undefined>((front, item) => {
    if (item.minimized || (front && front.layer > item.layer)) return front
    return item
  }, undefined)
}

// Keep creation order stable for the taskbar and DOM. Only the layer changes on focus.
export function windowReducer(windows: ManagedWindow[], action: WindowAction): ManagedWindow[] {
  if (action.type === 'fit') {
    return windows.map(item => ({ ...item, position: clamp(item.position, action.area, item.size) }))
  }
  if (action.type === 'close') return windows.filter(item => item.id !== action.id)

  const item = windows.find(candidate => candidate.id === action.id)
  const nextLayer = Math.max(0, ...windows.map(candidate => candidate.layer)) + 1
  if (action.type === 'open' && !item) {
    const offset = (windows.length % 6) * 26
    const size = { ...windowSize, width: action.area.width <= 680 ? windowSize.width : Math.min(windowSize.width, action.area.width - 96) }
    const position = clamp({
      x: Math.max(108, Math.round(action.area.width * 0.22)) + offset,
      y: Math.round(action.area.height * 0.10) + offset,
    }, action.area, size)
    return [...windows, { id: action.id, layer: nextLayer, minimized: false, maximized: false, size, position }]
  }
  if (!item) return windows

  let updated: ManagedWindow
  switch (action.type) {
    case 'open':
    case 'focus':
      updated = { ...item, layer: nextLayer, minimized: false }
      break
    case 'minimize':
      updated = { ...item, minimized: true }
      break
    case 'move':
      if (item.maximized) return windows
      updated = { ...item, position: clamp(action.position, action.area, item.size) }
      break
    case 'maximize':
      updated = { ...item, maximized: !item.maximized, layer: nextLayer }
      break
    case 'resize':
      if (item.maximized) return windows
      updated = { ...item, position: action.position, size: action.size }
      break
  }
  return windows.map(candidate => candidate === item ? updated : candidate)
}
