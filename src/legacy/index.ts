export { default } from './legacy'

export interface BundlePublication {
  id: string
  manifestId: string
  category: 'artwork:bundle'
  slug: string
  contractSrc?: string
}

export type LegacyBundlePublicationFeed = {
  bundles: BundlePublication[]
  cursor: string
}

export type LegacyPublicationFeed = {
  publications: LegacyPublicationManifestBase[]
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

export type LegacyPublicationManifestBase = {
  id: string
  category: 'artwork'
  subCategory: 'image' | 'audio' | 'model'
  slug: string
}

export interface LegacyPublicationManifest
  extends LegacyPublicationManifestBase
{
  published: Date
  year: string
  creator: string
  title: string
  description?: string
  medium?: string
  genre?: string
  city?: string
  images: LegacyPublicationManifestImage[]
  audio?: string
  model?: string
  license?: LegacyPublicationManifestLicense
}

export type LegacyProfile = {
  displayName?: string
  bio?: string,
  twitter?: string
  x?: string
  instagram?: string
  twitch?: string
  soundcloud?: string
  linkedin?: string
}
