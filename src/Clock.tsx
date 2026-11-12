import { useEffect, useMemo, useRef, useState } from 'react'
import countryZones from './content/timeZones.json'
import { defaultTimeZone } from './content/clock'
import { readPreference, savePreference } from './preferences'

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const zonesByCountry = new Map(Object.entries(countryZones).map(([country, zones]) => [
  country, zones.filter(zone => {
    try { new Intl.DateTimeFormat('en', { timeZone: zone }); return true } catch { return false }
  }),
] as const).filter(([, zones]) => zones.length))
const countries = [...zonesByCountry.keys()].sort((a, b) => regionNames.of(a)!.localeCompare(regionNames.of(b)!))
const countryOf = (zone: string) => countries.find(country => zonesByCountry.get(country)!.includes(zone)) ?? ''

function Calendar({ year, month, day }: { year: number; month: number; day: number }) {
  const [offset, setOffset] = useState(0)
  const first = new Date(Date.UTC(year, month - 1 + offset, 1))
  const days = new Date(Date.UTC(year, month + offset, 0)).getUTCDate()
  return <fieldset className="xp-calendar"><legend>Date</legend>
    <div className="calendar-nav">
      <button aria-label="Previous month" onClick={() => setOffset(n => n - 1)}>‹</button>
      <strong>{first.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</strong>
      <button aria-label="Next month" onClick={() => setOffset(n => n + 1)}>›</button>
    </div>
    <div className="calendar-grid">
      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <b key={d}>{d}</b>)}
      {Array.from({ length: first.getUTCDay() }, (_, i) => <span key={'space' + i} />)}
      {Array.from({ length: days }, (_, i) => <span key={i} aria-current={offset === 0 && day === i + 1 ? 'date' : undefined}>{i + 1}</span>)}
    </div>
  </fieldset>
}

export default function Clock({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [now, setNow] = useState(() => new Date())
  const [saved, setSaved] = useState(() => {
    const stored = readPreference('timezone', defaultTimeZone)
    return countryOf(stored) ? stored : ''
  })
  const [draft, setDraft] = useState(saved)
  const [tab, setTab] = useState<'clock' | 'zone'>('clock')
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const pointer = useRef('')
  const zone = saved || Intl.DateTimeFormat().resolvedOptions().timeZone
  const format = useMemo(() => ({
    time: new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' }),
    date: new Intl.DateTimeFormat('en-US', { timeZone: zone, dateStyle: 'full' }),
    parts: new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }), [zone])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => { if (open) panel.current?.focus() }, [open])
  const values = Object.fromEntries(format.parts.formatToParts(now).map(part => [part.type, Number(part.value)]))
  const date = format.date.format(now)
  function show() { setDraft(saved); setTab('clock'); setOpen(true) }
  function close() { setOpen(false); button.current?.focus() }
  function apply() { setSaved(draft); savePreference('timezone', draft) }
  const country = countryOf(draft)
  return <>
    <button ref={button} className="clock tray-clock" aria-label="Date and Time Properties" title={date + ' · ' + zone}
      aria-expanded={open} onPointerDown={e => { pointer.current = e.pointerType }}
      onClick={e => { if (!e.detail || pointer.current !== 'mouse') show() }} onDoubleClick={show}>
      <time dateTime={now.toISOString()}>{format.time.format(now)}<small>{now.toLocaleDateString('en-US', { timeZone: zone })}</small></time>
    </button>
    {open && <div className="property-sheet" role="dialog" aria-label="Date and Time Properties" ref={panel} tabIndex={-1}
      onKeyDown={e => { if (e.key === 'Escape') close() }}>
      <header className="window-bar"><strong>Date and Time Properties</strong><div className="window-controls"><button className="close" aria-label="Close date settings" onClick={close} /></div></header>
      <div className="property-inside">
        <div className="property-tabs">
          <button aria-pressed={tab === 'clock'} onClick={() => setTab('clock')}>Date &amp; Time</button>
          <button aria-pressed={tab === 'zone'} onClick={() => setTab('zone')}>Time Zone</button>
        </div>
        <div className="property-page">
          {tab === 'clock' ? <>
            <div className="time-columns"><Calendar key={zone} year={values.year} month={values.month} day={values.day} />
              <fieldset><legend>Time</legend><div className="analog-clock" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ transform: 'rotate(' + i * 30 + 'deg)' }} />)}
                {[values.hour * 30 + values.minute / 2, values.minute * 6 + values.second / 10, values.second * 6].map((angle, i) =>
                  <span key={i} className={'hand hand-' + i} style={{ transform: 'rotate(' + angle + 'deg)' }} />)}
              </div><div className="digital-time">{format.time.format(now)}</div></fieldset>
            </div><p>Current time zone: {zone.replaceAll('_', ' ')}</p>
          </> : <div className="zone-options">
            <label>Country or region<select value={country} onChange={e => setDraft(zonesByCountry.get(e.target.value)?.[0] ?? '')}>
              <option value="">Use device time zone</option>
              {countries.map(code => <option key={code} value={code}>{regionNames.of(code)}</option>)}
            </select></label>
            {country && <label>Time zone / city<select value={draft} onChange={e => setDraft(e.target.value)}>
              {zonesByCountry.get(country)!.map(z => <option key={z} value={z}>{z.replaceAll('_', ' ')}</option>)}
            </select></label>}
            <p>Daylight saving time adjusts automatically.</p>
          </div>}
        </div>
        <div className="property-actions"><button onClick={() => { apply(); close() }}>OK</button><button onClick={close}>Cancel</button>
          <button disabled={draft === saved} onClick={apply}>Apply</button></div>
      </div>
    </div>}
  </>
}
