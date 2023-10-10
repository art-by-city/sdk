import ArdbTransaction from 'ardb/lib/models/transaction'

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
  creator: string
  category: 'artwork'
  subCategory: 'image' | 'audio' | 'model'
  slug: string
}

export interface LegacyPublicationManifest
  extends LegacyPublicationManifestBase
{
  published: Date
  year: string
  
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

export type LegacyAvatar = {
  id: string
  src: string
  contentType: string
}

export interface LegacyTip {
  id: string
  amount: string
  from: string
  to: string
  timestamp: number
}

export interface LegacyLike extends LegacyTip {
  liked: string
}

export interface LegacyLikesFeed {
  likes: LegacyLike[]
  cursor: string
}

export const mapLegacyLikeFromTransaction = (
  tx: ArdbTransaction
): LegacyLike => {
  const likedEntityTag = tx.tags.find(t => t.name === 'liked-entity')

  return {
    id: tx.id,
    amount: tx.quantity.winston,
    from: tx.owner.address,
    to: tx.recipient,
    timestamp: tx.block.timestamp,
    liked: likedEntityTag?.value || ''
  }
}

export interface LegacyTipsFeed {
  tips: LegacyTip[]
  cursor: string
}
