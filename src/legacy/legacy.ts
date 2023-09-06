import Arweave from 'arweave'

import { ArtByCityEnvironment } from '../config'
import VerifiedCreators from './verified-creators.json'
import LegacyTransactions from './transactions'
import {
  LegacyProfile,
  LegacyBundlePublicationFeed,
  LegacyPublicationManifest,
  LegacyPublicationManifestLicense,
  LegacyPublicationFeed
} from './'

export default class ArtByCityLegacy {
  private readonly transactions!: LegacyTransactions

  constructor(
    arweave: Arweave,
    private readonly environment: ArtByCityEnvironment
  ) {
    this.transactions = new LegacyTransactions(arweave)
  }

  get verifiedCreators(): string[] {
    return VerifiedCreators[this.environment]
  }

  async queryPublications(
    limit: number | 'all' = 10,
    creator?: string | string[],
    cursor?: string
  ): Promise<LegacyPublicationFeed> {
    const from = creator || this.verifiedCreators

    const {
      transactions,
      cursor: nextCursor
    } = await this.transactions.query('artwork', { from, limit, cursor })

    return {
      cursor: nextCursor,
      publications: transactions.map(tx => {
        const slugTag = tx.tags.find(t => t.name === 'slug')
        const subCategoryTag = tx.tags.find(t => t.name === 'Sub-Category')
        let subCategory: 'image' | 'audio' | 'model' = 'image'
        if (['image', 'audio', 'model'].includes(subCategoryTag?.value || '')) {
          subCategory = subCategoryTag?.value as 'image' | 'audio' | 'model'
        }

        return {
          id: tx.id,
          category: 'artwork',
          subCategory,
          slug: slugTag?.value || tx.id
        }
      })
    }
  }

  async queryPublicationBundles(
    limit: number | 'all' = 10,
    creator?: string | string[],
    cursor?: string
  ): Promise<LegacyBundlePublicationFeed> {
    const from = creator || this.verifiedCreators

    const {
      transactions,
      cursor: nextCursor
    } = await this.transactions.query('artwork:bundle', { from, limit, cursor })

    return {
      cursor: nextCursor,
      bundles: transactions.map(tx => {
        const manifestIdTag = tx.tags.find(tag => tag.name === 'Manifest-ID')
        const slugTag = tx.tags.find(tag => tag.name === 'slug')
        const contractSrcTag = tx.tags.find(tag => tag.name === 'Contract-Src')

        return {
          id: tx.id,
          category: 'artwork:bundle',
          manifestId: manifestIdTag?.value || '',
          slug: slugTag?.value || '',
          contractSrc: contractSrcTag?.value
        }
      })
    }
  }

  async fetchPublicationBySlugOrId(
    slugOrId: string
  ): Promise<LegacyPublicationManifest> {
    try {
      return await this.fetchPublicationBySlug(slugOrId)
    } catch (error) { /* eslint-disable-line no-empty */}

    return this.fetchPublication(slugOrId)
  }

  async fetchPublicationBySlug(
    slug: string
  ): Promise<LegacyPublicationManifest> {
    const { transactions } = await this
      .transactions
      .query('artwork', { tags: [ { name: 'slug', value: slug } ] })
    
    if (transactions.length < 1) {
      throw new Error(`404 Publication Not Found: slug://${slug}`)
    }

    return this.fetchPublication(transactions[0].id)
  }

  async fetchPublication(
    manifestId: string
  ): Promise<LegacyPublicationManifest> {
    const { data, ok } = await this.transactions.fetchData(manifestId)

    if (!ok) {
      throw new Error(`404 Publication Not Found: ar://${manifestId}`)
    }

    if (
      typeof data === 'string'
      || data instanceof ArrayBuffer
      || data instanceof ReadableStream
    ) {
      throw new Error(`415 Bad Publication Manifest: ar://${manifestId}`)
    }

    const subCategory = data.audio
      ? 'audio'
      : data.model
        ? 'model'
        : 'image'

    const published = typeof data.published === 'string'
      ? new Date(data.published)
      // TODO -> fallback on timestamp from bundle tx
      : new Date()

    const year = typeof data.created === 'string'
      ? data.created
      // TODO -> fallback on timestamp from bundle tx
      : new Date().getFullYear().toString()

    const creator = typeof data.creator === 'string'
      ? data.creator
      // TODO -> fallback on bundle tx.owner
      : ''

    const title = typeof data.title === 'string'
      ? data.title
      : 'Untitled'

    const slug = typeof data.slug === 'string' ? data.slug : manifestId

    const dataImages = Array.isArray(data.images)
      ? data.images 
      : data.image
        ? [ data.image ]
        : []
    const images = dataImages.map(di => {
      if (di && typeof di === 'object' && !Array.isArray(di)) {
        const image = {
          image: typeof di.image === 'string' ? di.image : '',
          preview: typeof di.preview === 'string' ? di.preview : '',
          preview4k: typeof di.preview4k === 'string' ? di.preview4k : '',
          animated: typeof di.animated === 'boolean' ? di.animated : false
        }

        return image
      }

      return { image: '', preview: '', preview4k: '' }
    }).filter(di => !!di.image)

    const publication: LegacyPublicationManifest = {
      id: manifestId,
      category: 'artwork',
      subCategory,
      published,
      year,
      creator,
      title,
      slug,
      images
    }

    if (typeof data.description === 'string') {
      publication.description = data.description
    }

    if (typeof data.medium === 'string') {
      publication.medium = data.medium
    }

    if (typeof data.genre === 'string') {
      publication.genre = data.genre
    }

    if (typeof data.city === 'string') {
      publication.city = data.city
    }

    if (typeof data.license === 'object' && !Array.isArray(data.license)) {
      const license: Partial<LegacyPublicationManifestLicense> = {}

      if (typeof data.license?.reference === 'string') {
        license.reference = data.license.reference
      }

      if (typeof data.license?.detailsUrl === 'string') {
        license.detailsUrl = data.license.detailsUrl
      }

      if (typeof data.license?.name === 'string') {
        license.name = data.license.name
      }

      if (typeof data.license?.licenseId === 'string') {
        license.licenseId = data.license.licenseId
      }

      if (data.license && Array.isArray(data.license.seeAlso)) {
        const seeAlso: string[] = []
        
        for (const sa of data.license.seeAlso) {
          if (typeof sa === 'string') {
            seeAlso.push(sa)
          }
        }

        if (seeAlso.length > 0) {
          license.seeAlso = seeAlso
        }
      }

      if (
        license.reference
        || license.detailsUrl
        || license.licenseId
        || license.name
      ) {
        publication.license = license
      }
    }

    if (
      typeof data.audio === 'object'
      && !Array.isArray(data.audio)
      && typeof data.audio?.audio === 'string'
    ) {
      publication.audio = data.audio.audio
    }

    if (
      typeof data.model === 'object'
      && !Array.isArray(data.model)
      && typeof data.model?.model === 'string'
    ) {
      publication.model = data.model.model
    }

    return publication
  }

  async fetchProfile(address: string): Promise<LegacyProfile | null> {
    const {
      transactions
    } = await this.transactions.query('profile', { from: address, limit: 1 })

    if (transactions.length > 0) {
      const profileId = transactions[0].id
      const { data, ok } = await this.transactions.fetchData(profileId)

      if (!ok) {
        return null
      }

      if (
        typeof data === 'string'
        || data instanceof ArrayBuffer
        || data instanceof ReadableStream
      ) {
        return null
      }

      const profile: LegacyProfile = data

      if (profile.twitter) {
        profile.x = profile.twitter
      }

      if (profile.x) {
        profile.twitter = profile.x
      }

      return profile
    }

    return null
  }
}
