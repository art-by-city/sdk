import Arweave from 'arweave'

import { ArtByCityEnvironment } from '../config'
import VerifiedCreators from './verified-creators.json'
import LegacyTransactions from './transactions'
import { ArtworkBundle } from './'

export type LegacyPublicationFeed = {
  bundles: ArtworkBundle[]
  cursor: string
}

export type LegacyPublicationImage = {
  image: string
  preview: string
  preview4k: string
}

export type LegacyPublication = {
  id: string
  category: 'artwork'
  subCategory: 'image' | 'audio' | 'model'
  published: Date
  year: string
  creator: string
  title: string
  slug: string
  description: string
  medium: string
  images: LegacyPublicationImage[]
  audio?: any[] // TODO -> audio
  model?: any // TODO -> model
}

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

  async feed(
    limit: number | 'all' = 10,
    creator?: string | string[],
    cursor?: string
  ): Promise<LegacyPublicationFeed> {
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

  async fetch(manifestId: string): Promise<LegacyPublication> {
    const manifest = await this.transactions.fetchData(manifestId)
    // const manifest = JSON.parse(data)
    const subCategory = manifest.audio
      ? 'audio'
      : manifest.model
        ? 'model'
        : 'image'

    const publication:
      Omit<LegacyPublication, 'audio' | 'model'>
      & { audio?: any, model?: any } =
    {
      id: manifestId,
      category: 'artwork',
      subCategory,
      published: new Date(manifest.published),
      year: manifest.created,
      creator: manifest.creator,
      title: manifest.title,
      slug: manifest.slug,
      description: manifest.description,
      medium: manifest.medium,
      images: manifest.images || [ manifest.image ],
    }

    if (manifest.audio) {
      publication.audio = manifest.audio
    }

    if (manifest.model) {
      publication.model = manifest.model
    }

    return publication
  }
}
