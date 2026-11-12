export interface Track {
  id: string
  title: string
  artist: string
  local?: { src: string; kind: 'audio' | 'video' }
  youtubeId?: string
  credit?: { label: string; url: string }
}

export const startupTrackId = 'bach-air'

export const playlist: Track[] = [
  {
    id: 'beethoven-fifth', title: 'Symphony No. 5 · I. Allegro con brio', artist: 'Ludwig van Beethoven',
    local: { src: '/media/music/beethoven-fifth.ogg', kind: 'audio' },
    credit: { label: 'Skidmore College Orchestra · Musopen',
      url: 'https://commons.wikimedia.org/wiki/File:Ludwig_van_Beethoven_-_symphony_no._5_in_c_minor,_op._67_-_i._allegro_con_brio.ogg' },
  },
  {
    id: 'bach-air', title: 'Air on the G String · BWV 1068', artist: 'Johann Sebastian Bach',
    local: { src: '/media/music/bach-air.mp3', kind: 'audio' },
    credit: { label: 'Air Force Strings · The United States Air Force Band',
      url: 'https://commons.wikimedia.org/wiki/File:Air_-_Air_Force_Strings_-_United_States_Air_Force_Band.mp3' },
  },
  {
    id: 'bad-romance', title: 'Bad Romance', artist: 'Lady Gaga',
    local: { src: '/media/music/bad-romance.mp4', kind: 'video' },
    credit: { label: 'Official music video · Lady Gaga', url: 'https://www.youtube.com/watch?v=qrO4YZeyl0I' },
  },
]
