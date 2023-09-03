export { default } from './legacy'

export interface ArtworkBundle {
  id: string
  manifestId: string
  category: 'artwork:bundle'
  slug: string
  contractSrc?: string
}

export type LegacyPublicationFeed = {
  bundles: ArtworkBundle[]
  cursor: string
}

export type LegacyPublicationManifestImage = {
  image: string
  preview: string
  preview4k: string
  animated?: boolean
}

export type LegacyPublicationManifestLicense = {
  reference?: string
  detailsUrl?: string
  name?: string
  licenseId?: string
  seeAlso?: string[]
}

export type LegacyPublicationManifest = {
  id: string
  category: 'artwork'
  subCategory: 'image' | 'audio' | 'model'
  published: Date
  year: string
  creator: string
  title: string
  slug: string
  description?: string
  medium?: string
  genre?: string
  city?: string
  images: LegacyPublicationManifestImage[]
  audio?: string
  model?: string
  license?: LegacyPublicationManifestLicense
}
