import Arweave from 'arweave'
import { Warp } from 'warp-contracts'

import { ArtByCityConfig } from '../config'
import VerifiedCreators from './verified-creators.json'
import LegacyTransactions from './transactions'
import LegacyUsernames from './usernames'
import LegacyMemcache from './memcache'
import {
  LegacyProfile,
  LegacyBundlePublicationFeed,
  LegacyPublicationManifest,
  LegacyPublicationManifestLicense,
  LegacyPublicationFeed,
  LegacyLikesFeed,
  mapLegacyLikeFromTransaction,
  LegacyTipsFeed,
  LegacyAvatar
} from './'
import { InvalidAddressError, isValidAddress } from '../util/crypto'

export default class ArtByCityLegacy {
  public readonly transactions!: LegacyTransactions
  public readonly usernames!: LegacyUsernames
  private readonly gatewayRoot!: string
  private readonly cacheEnabled!: boolean
  public readonly caches: {
    publications: LegacyMemcache<LegacyPublicationManifest>
    slugs: LegacyMemcache<string>
    profiles: LegacyMemcache<LegacyProfile>
    avatars: LegacyMemcache<LegacyAvatar>
    likes: LegacyMemcache<LegacyLikesFeed>
    tips: LegacyMemcache<LegacyTipsFeed>
  } = { /* eslint-disable indent */
    publications: new LegacyMemcache<LegacyPublicationManifest>(),
    slugs: new LegacyMemcache<string>(),
    profiles: new LegacyMemcache<LegacyProfile>(),
    avatars: new LegacyMemcache<LegacyAvatar>(),
    likes: new LegacyMemcache<LegacyLikesFeed>(),
    tips: new LegacyMemcache<LegacyTipsFeed>()
  } /* eslint-enable indent */

  constructor(
    arweave: Arweave,
    warp: Warp,
    private readonly config: ArtByCityConfig
  ) {
    this.transactions = new LegacyTransactions(arweave, config.environment)
    this.usernames = new LegacyUsernames(
      warp,
      config.contracts.usernames
    )
    this.cacheEnabled = config.cache.type === 'memcache'
    const { protocol, host, port } = arweave.api.getConfig()
    this.gatewayRoot = `${protocol}://${host}:${port}`
  }

  get verifiedCreators(): string[] {
    return VerifiedCreators[this.config.environment]
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
          creator: tx.owner.address,
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
    slugOrId: string,
    useCache: boolean = true
  ): Promise<LegacyPublicationManifest> {
    try {
      return await this.fetchPublicationBySlug(slugOrId, useCache)
    } catch (error) { /* eslint-disable-line no-empty */ }

    return this.fetchPublication(slugOrId, useCache)
  }

  async fetchPublicationBySlug(
    slug: string,
    useCache: boolean = true
  ): Promise<LegacyPublicationManifest> {
    if (this.cacheEnabled && useCache) {
      const cached = this.caches.slugs.get(slug)
      if (cached) { return this.fetchPublication(cached) }
    }

    const { transactions } = await this
      .transactions
      .query('artwork', { tags: [ { name: 'slug', value: slug } ] })
    
    if (transactions.length < 1) {
      throw new Error(`404 Publication Not Found: slug://${slug}`)
    }

    const id = transactions[0].id
    if (this.cacheEnabled && useCache) {
      this.caches.slugs.put(slug, id)
    }

    return this.fetchPublication(id, useCache)
  }

  async fetchPublication(
    manifestId: string,
    useCache: boolean = true
  ): Promise<LegacyPublicationManifest> {
    if (this.cacheEnabled && useCache) {
      const cached = this.caches.publications.get(manifestId)
      if (cached) { return cached }
    }

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
      : data.creator
        && typeof data.creator === 'object'
        && 'address' in data.creator
        && typeof data.creator.address === 'string'
        ? data.creator?.address
        // TODO -> possibly fallback on bundle tx.owner ?
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
        if (typeof di.dataUrl === 'string') {
          return {
            image: di.dataUrl,
            preview: di.dataUrl,
            preview4k: di.dataUrl,
            animated: di.imageType === 'image/gif'
          }
        } else {
          return {
            image: typeof di.image === 'string' ? di.image : '',
            preview: typeof di.preview === 'string' ? di.preview : '',
            preview4k: typeof di.preview4k === 'string' ? di.preview4k : '',
            animated: typeof di.animated === 'boolean' ? di.animated : false
          }
        }
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
      images,
      image: images[0]
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

    if (this.cacheEnabled && useCache) {
      this.caches.publications.put(manifestId, publication)
    }

    return publication
  }

  async fetchProfile(
    address: string,
    useCache: boolean = true
  ): Promise<LegacyProfile | null> {
    if (!isValidAddress(address)) {
      throw new InvalidAddressError()
    }

    if (this.cacheEnabled && useCache) {
      const cached = this.caches.profiles.get(address)
      if (cached) { return cached }
    }

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

      if (this.cacheEnabled && useCache) {
        this.caches.profiles.put(address, profile)
      }

      return profile
    }

    return null
  }

  async fetchAvatar(
    address: string,
    useCache: boolean = true
  ): Promise<LegacyAvatar | null> {
    if (this.cacheEnabled && useCache) {
      const cached = this.caches.avatars.get(address)
      if (cached) { return cached }
    }

    const {
      transactions
    } = await this.transactions.query('avatar', { from: address, limit: 1 })

    if (transactions.length > 0) {
      const avatarId = transactions[0].id
      const contentTypeTag = transactions[0]
        .tags
        .find(t => t.name === 'Content-Type')

      const avatar: LegacyAvatar = {
        id: avatarId,
        src: `${this.gatewayRoot}/${avatarId}`,
        contentType: contentTypeTag?.value || 'image/png'
      }

      if (this.cacheEnabled && useCache) {
        this.caches.avatars.put(address, avatar)
      }

      return avatar
    }

    return null
  }

  async queryLikes(
    address: string,
    receivedOrSent: 'received' | 'sent',
    limit: number | 'all' = 'all',
    cursor?: string,
    useCache: boolean = true
  ): Promise<LegacyLikesFeed> {
    const cacheKey = `${receivedOrSent}-by-${address}`
    if (this.cacheEnabled && useCache && limit === 'all') {
      const cached = this.caches.likes.get(cacheKey)
      if (cached) { return cached }
    }

    const receivedOrSentOpts = receivedOrSent === 'received'
      ? { to: address }
      : { from: address }

    const {
      transactions,
      cursor: nextCursor
    } = await this.transactions.query('like', {
      ...receivedOrSentOpts,
      limit,
      cursor
    })

    const feed = {
      cursor: nextCursor,
      likes: transactions.map(mapLegacyLikeFromTransaction)
    }

    if (this.cacheEnabled && useCache && limit === 'all') {
      this.caches.likes.put(cacheKey, feed)
    }

    return feed
  }

  async queryLikesForPublication(
    id: string,
    limit: number | 'all' = 'all',
    cursor?: string,
    useCache: boolean = true
  ): Promise<LegacyLikesFeed> {
    const cacheKey = `likes-for-${id}`
    if (this.cacheEnabled && useCache && limit === 'all') {
      const cached = this.caches.likes.get(cacheKey)
      if (cached) { return cached }
    }

    const {
      transactions,
      cursor: nextCursor
    } = await this.transactions.query('like', {
      limit,
      cursor,
      tags: [ { name: 'liked-entity', value: id } ]
    })

    const feed = {
      cursor: nextCursor,
      likes: transactions.map(mapLegacyLikeFromTransaction)
    }

    if (this.cacheEnabled && useCache && limit === 'all') {
      this.caches.likes.put(cacheKey, feed)
    }

    return feed
  }

  async queryTips(
    address: string,
    receivedOrSent: 'received' | 'sent',
    limit: number | 'all' = 'all',
    cursor?: string,
    useCache: boolean = true
  ): Promise<LegacyTipsFeed> {
    const cacheKey = `${receivedOrSent}-by-${address}`
    if (this.cacheEnabled && useCache && limit === 'all') {
      const cached = this.caches.tips.get(cacheKey)
      if (cached) { return cached }
    }

    const receivedOrSentOpts = receivedOrSent === 'received'
      ? { to: address }
      : { from: address }

    const {
      transactions,
      cursor: nextCursor
    } = await this.transactions.query('tip', {
      ...receivedOrSentOpts,
      limit,
      cursor
    })

    const feed = {
      cursor: nextCursor,
      tips: transactions.map(tx => {
        return {
          id: tx.id,
          amount: tx.quantity.winston,
          from: tx.owner.address,
          to: tx.recipient,
          timestamp: tx.block.timestamp
        }
      })
    }

    if (this.cacheEnabled && useCache && limit === 'all') {
      this.caches.tips.put(cacheKey, feed)
    }

    return feed
  }
}
