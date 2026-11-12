import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { playlist, startupTrackId, type Track } from './content/music'
import { readPreference, savePreference } from './preferences'
import { loadYoutube, type YoutubePlayer } from './youtube'

const initialTrack = playlist.find(item => item.id === startupTrackId && item.local) ?? playlist.find(item => item.local) ?? playlist[0]

export function useMusic(openPlayer: () => void, windowOpen: boolean, visible: boolean) {
  const [tracks, setTracks] = useState(playlist)
  const [track, setTrack] = useState(initialTrack)
  const [repeatIntro, setRepeatIntro] = useState(initialTrack?.id === startupTrackId)
  const [session, setSession] = useState(0)
  const [online, setOnline] = useState(!initialTrack?.local)
  const [playing, setPlaying] = useState(false)
  const [message, setMessage] = useState('')
  const [volume, setVolume] = useState(() => {
    const value = Number(readPreference('volume', '55'))
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 55
  })
  const [muted, setMuted] = useState(() => readPreference('mute', 'false') === 'true')
  const start = useRef(!!initialTrack?.local)
  const command = useRef<((play: boolean) => void) | null>(null)
  const urls = useRef<string[]>([])
  useEffect(() => () => { urls.current.forEach(url => URL.revokeObjectURL(url)) }, [])
  useEffect(() => { savePreference('volume', String(volume)); savePreference('mute', String(muted)) }, [volume, muted])

  function select(next: Track, auto = true, reveal = true) {
    if (next.id !== startupTrackId) setRepeatIntro(false)
    setMessage(''); setPlaying(false); setTrack(next); setOnline(!next.local)
    start.current = auto
    setSession(s => s + 1)
    if (reveal && (!windowOpen || (!next.local && !visible))) openPlayer()
  }
  function step(direction: number, automatic = false) {
    if (!tracks.length) return
    const index = tracks.indexOf(track)
    const background = automatic && (!visible || document.hidden)
    for (let offset = 1; offset <= tracks.length; offset++) {
      const next = tracks[(index + direction * offset + tracks.length) % tracks.length]
      if (background && !next.local) continue
      select(next, true, !automatic)
      return
    }
    setPlaying(false)
  }
  function toggle() {
    if (!track) return
    if (!windowOpen || message) { select(track); return }
    if (online && !visible) { start.current = true; openPlayer(); return }
    if (command.current) command.current(!playing)
    else start.current = true
  }
  function add(files: File[]) {
    const added: Track[] = files.map(file => {
      const src = URL.createObjectURL(file)
      urls.current.push(src)
      const video = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogv)$/i.test(file.name)
      return { id: src, artist: 'My computer', title: file.name, local: { src, kind: video ? 'video' : 'audio' } }
    })
    if (added.length) { setTracks(list => [...list, ...added]); select(added[0]) }
  }
  function unavailable(code?: number) {
    setPlaying(false)
    if (!online) { setMessage('This file could not be played. Check the file path and media format.'); return }
    const reason = code === 101 || code === 150 ? 'The video owner restricts embedded playback.' :
      code === 153 ? 'YouTube could not verify this site as the embed source.' :
      code === 100 ? 'YouTube reports that the video is unavailable.' : 'YouTube could not play the video here.'
    setMessage(reason + (code ? ' (' + code + ')' : '') + ' Use the official video link or try Play again.')
  }
  function close() { command.current?.(false); start.current = false; setPlaying(false); setMessage('') }
  return { tracks, track, session, repeatIntro, online, playing, message, volume, muted, command, start, visible,
    setVolume, setMuted, setOnline, setPlaying, setMessage, select, step, toggle, add, unavailable, close }
}
type Music = ReturnType<typeof useMusic>

export function Transport({ music }: { music: Music }) {
  return <div className="transport">
    <button aria-label="Previous track" title="Previous track" onClick={() => music.step(-1)}>◀◀</button>
    <button className="play-key" aria-label={music.playing ? 'Pause' : 'Play'} title={music.playing ? 'Pause' : 'Play'}
      onClick={music.toggle}>{music.playing ? 'Ⅱ' : '▶'}</button>
    <button aria-label="Next track" title="Next track" onClick={() => music.step(1)}>▶▶</button>
  </div>
}
export function Volume({ music, vertical = false }: { music: Music; vertical?: boolean }) {
  const slider = <input aria-label="Volume" type="range" min="0" max="100" value={music.volume}
    aria-orientation={vertical ? 'vertical' : 'horizontal'}
    onChange={e => { music.setVolume(Number(e.target.value)); music.setMuted(false) }} />
  if (vertical) return <div className="volume-fader">{slider}
    <label><input aria-label="Mute" type="checkbox" checked={music.muted}
      onChange={e => music.setMuted(e.target.checked)} /> Mute</label></div>
  return <div className="volume-control"><button aria-label={music.muted ? 'Unmute' : 'Mute'} aria-pressed={music.muted}
    title={music.muted ? 'Unmute' : 'Mute'} onClick={() => music.setMuted(!music.muted)}><img src="/media/speaker.svg" alt="" /></button>
    {slider}
  </div>
}

function LocalMedia({ music }: { music: Music }) {
  const element = useRef<HTMLMediaElement>(null)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  useLayoutEffect(() => {
    const media = element.current!
    let alive = true
    media.volume = music.volume / 100; media.muted = music.muted
    function stopWaiting() {
      window.removeEventListener('click', resumeOnGesture)
      window.removeEventListener('keydown', resumeOnGesture)
    }
    function resumeOnGesture(event: Event) {
      if (!event.isTrusted || (event instanceof KeyboardEvent &&
        (event.repeat || event.ctrlKey || event.altKey || event.metaKey || ['Escape', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key)))) return
      // Transport and playlist actions already issue their own playback commands.
      if (event.target instanceof Element && event.target.closest('.transport, .playlist, #window-player .close')) return
      command(true)
    }
    const command = (play: boolean) => {
      stopWaiting()
      if (!play) { media.pause(); return }
      void media.play().catch((error: Error) => {
        if (alive && error.name !== 'AbortError' && error.name !== 'NotSupportedError') {
          music.setPlaying(false); music.setMessage('Press Play to start this recording.')
          if (music.session === 0 && error.name === 'NotAllowedError') {
            window.addEventListener('click', resumeOnGesture)
            window.addEventListener('keydown', resumeOnGesture)
          }
        }
      })
    }
    music.command.current = command
    if (music.start.current) command(true)
    return () => { alive = false; stopWaiting(); media.pause(); music.command.current = null }
  }, []) // The session key creates a new media element for each selection.
  useEffect(() => {
    if (element.current) { element.current.volume = music.volume / 100; element.current.muted = music.muted }
  }, [music.volume, music.muted])
  const audio = music.track.local!.kind === 'audio'
  const Media = audio ? 'audio' : 'video'
  const time = (value: number) => Math.floor(value / 60) + ':' + String(Math.floor(value % 60)).padStart(2, '0')
  return <>
    <Media ref={node => { element.current = node }} src={music.track.local!.src} loop={music.repeatIntro} playsInline preload="metadata" hidden={audio}
      onPlaying={() => { music.setPlaying(true); music.setMessage('') }} onPause={() => music.setPlaying(false)}
      onEnded={() => music.step(1, true)} onTimeUpdate={e => setPosition(e.currentTarget.currentTime)}
      onLoadedMetadata={e => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
      onError={() => { if (music.track.youtubeId) { music.start.current = music.visible; music.setOnline(true) } else music.unavailable() }} />
    {audio && <div className="record-display"><img src="/media/player.svg" alt="" /><strong>{music.track.title}</strong><span>{music.track.artist}</span></div>}
    <div className="seek"><span>{time(position)}</span><input type="range" aria-label="Playback position" min="0" max={duration || 1}
      disabled={!duration} step="0.1" value={position} onChange={e => { if (element.current) element.current.currentTime = Number(e.target.value) }} /><span>{time(duration)}</span></div>
  </>
}

function OnlineMedia({ music, position }: { music: Music; position: RefObject<number> }) {
  const host = useRef<HTMLDivElement>(null)
  const player = useRef<YoutubePlayer | null>(null)
  const latest = useRef(music)
  latest.current = music
  useEffect(() => {
    let alive = true
    let instance: YoutubePlayer | undefined
    let poll: number | undefined
    const timer = window.setTimeout(() => { if (alive && !player.current) latest.current.unavailable() }, 18000)
    void loadYoutube().then(api => {
      if (!alive || !host.current) return
      const mount = document.createElement('div')
      host.current.replaceChildren(mount)
      instance = new api.Player(mount, {
        videoId: music.track.youtubeId!, playerVars: { origin: location.origin, playsinline: 1 },
        events: {
          onReady({ target }) {
            if (!alive) return
            clearTimeout(timer)
            player.current = target
            const m = latest.current
            m.setMessage('')
            target.setVolume(m.volume)
            if (m.muted) target.mute(); else target.unMute()
            if (position.current > 0) { target.seekTo(position.current, true); target.pauseVideo() }
            m.command.current = play => play ? target.playVideo() : target.pauseVideo()
            if (m.start.current) target.playVideo()
            poll = window.setInterval(() => {
              const v = target.getVolume()
              if (typeof v === 'number') latest.current.setVolume(v)
              latest.current.setMuted(target.isMuted())
            }, 600)
          },
          onStateChange({ data }) {
            if (!alive) return
            latest.current.setPlaying(data === 1)
            if (data === 0) latest.current.step(1, true)
          },
          onError({ data }) { if (alive) latest.current.unavailable(data) },
          onAutoplayBlocked() { if (alive) latest.current.setPlaying(false) },
        },
      })
    }).catch(() => { if (alive) latest.current.unavailable() })
    return () => {
      alive = false; clearTimeout(timer); clearInterval(poll)
      if (player.current) position.current = player.current.getCurrentTime() || 0
      player.current = null
      latest.current.command.current = null
      instance?.destroy()
    }
  }, [])
  useEffect(() => {
    const api = player.current
    if (!api) return
    api.setVolume(music.volume)
    if (music.muted) api.mute(); else api.unMute()
  }, [music.volume, music.muted])
  return <div className="youtube-screen" ref={host} />
}

function VideoScreen({ music, visible }: { music: Music; visible: boolean }) {
  const position = useRef(0)
  return visible ? <OnlineMedia music={music} position={position} /> : null
}

export function MediaPlayer({ music }: { music: Music }) {
  const input = useRef<HTMLInputElement>(null)
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  useEffect(() => {
    const handle = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', handle)
    return () => document.removeEventListener('visibilitychange', handle)
  }, [])
  const canEmbed = music.visible && pageVisible
  useLayoutEffect(() => {
    if (music.online && !canEmbed) { music.start.current = false; music.setPlaying(false) }
  }, [canEmbed, music.online])
  const track = music.track
  return <div className="media-player">
    <div className="player-top"><strong>Now Playing</strong><button onClick={() => input.current?.click()}>Open file…</button>
      <input ref={input} hidden type="file" multiple accept="audio/*,video/*,.ogg,.mp3,.mp4,.webm"
        onChange={e => { music.add(Array.from(e.target.files ?? [])); e.target.value = '' }} /></div>
    <div className="player-main"><section className="play-screen" aria-label="Playback">
      {!track ? <p>Open a media file to play.</p> : music.online ? <VideoScreen key={music.session} music={music} visible={canEmbed} /> :
        <LocalMedia key={music.session} music={music} />}
    </section><aside className="playlist"><h3>Now Playing List</h3>
      {music.tracks.map((item, index) => <button key={item.id} aria-pressed={item === track} onClick={() => music.select(item)}>
        <small>{String(index + 1).padStart(2, '0')}</small><span>{item.title}<em>{item.artist}</em></span></button>)}
    </aside></div>
    <div className="player-caption"><strong>{track?.title}</strong>
      {track?.credit && <a href={track.credit.url} target="_blank" rel="noreferrer">{track.credit.label} ↗</a>}
      {music.online && track?.youtubeId && track.credit?.url !== 'https://www.youtube.com/watch?v=' + track.youtubeId &&
        <a href={'https://www.youtube.com/watch?v=' + track.youtubeId} target="_blank" rel="noreferrer">Watch on YouTube ↗</a>}
      {music.message && <span role="status">{music.message}</span>}</div>
    <div className="player-console"><Transport music={music} /><Volume music={music} /></div>
  </div>
}
