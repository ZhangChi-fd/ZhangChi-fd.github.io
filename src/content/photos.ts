export interface Photo {
  id: string
  title: string
  thumbnail: string
  src: string
  alt: string
  caption?: string
}
export const photos: Photo[] = []

export interface Album {
  id: string
  title: string
  photos: Photo[]
}

export const albums: Album[] = []
