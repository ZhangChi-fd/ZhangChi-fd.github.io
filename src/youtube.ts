export interface YoutubePlayer {
  playVideo(): void
  pauseVideo(): void
  setVolume(volume: number): void
  mute(): void
  unMute(): void
  getVolume(): number
  isMuted(): boolean
  getCurrentTime(): number
  seekTo(seconds: number, allowSeekAhead: boolean): void
  destroy(): void
}

interface PlayerOptions {
  videoId: string
  playerVars: { origin: string; playsinline: number }
  events: {
    onReady(event: { target: YoutubePlayer }): void
    onStateChange(event: { data: number }): void
    onError(event: { data: number }): void
    onAutoplayBlocked(): void
  }
}
type Provider = { Player: new (node: HTMLElement, options: PlayerOptions) => YoutubePlayer }
const host = window as Window & { YT?: Provider; onYouTubeIframeAPIReady?: () => void }
let loading: Promise<Provider> | undefined

export function loadYoutube() {
  if (host.YT?.Player) return Promise.resolve(host.YT)
  if (!loading) loading = new Promise<Provider>((resolve, reject) => {
    const script = document.createElement('script')
    const fail = () => {
      clearTimeout(timer)
      script.remove()
      loading = undefined
      reject(new Error('YouTube unavailable'))
    }
    const timer = window.setTimeout(fail, 12000)
    host.onYouTubeIframeAPIReady = () => {
      if (!host.YT?.Player) return fail()
      clearTimeout(timer)
      resolve(host.YT)
    }
    script.onerror = fail
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.append(script)
  })
  return loading
}
