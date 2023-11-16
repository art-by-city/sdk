import ArDB from 'ardb'
import ArdbTransaction from 'ardb/lib/models/transaction'
import Arweave from 'arweave'

import { ArFSClient } from '../arfs'
import TransactionsModule from '../common/transactions'
import { ArtByCityConfig } from '../config'
import { PublicationType, PublicationTypes } from '../publications'

export default class ArtByCityPublications {
  protected readonly ardb!: ArDB
  private readonly transactions!: TransactionsModule

  constructor(
    protected readonly arweave: Arweave,
    protected readonly arfs: ArFSClient,
    protected readonly config: ArtByCityConfig
  ) {
    this.ardb = new ArDB(this.arweave)
    this.transactions = new TransactionsModule(arweave)
  }

  async query(
    limit: number | 'all' = 10,
    creator?: string | string[],
    type: PublicationType | 'all' = 'all',
    cursor?: string
  ) {
    let query = this.ardb.search('transactions').sort('HEIGHT_DESC')

    if (creator) {
      query = query.from(creator)
    }

    if (cursor) {
      query = query.cursor(cursor)
    }

    if (type === 'all') {
      query = query.tag('Type', Object.values(PublicationTypes))
    } else {
      query = query.tag('Type', type)
    }

    const publications = limit === 'all'
      ? await query.findAll() as ArdbTransaction[]
      : await query.limit(limit).find() as ArdbTransaction[]
    const nextCursor = query.getCursor()

    return { publications, cursor: nextCursor }
  }

  async getById(publicationId: string) {
    const tx = await this.transactions.get(publicationId)

    if (tx) {
      const metadataId = tx.tags.find(t => t.name === 'Metadata-Id')?.value

      if (metadataId) {
        const metadata = await this.arfs.getFileMetadata(metadataId)

        return { tx, metadata }
      }
    }

    return null
  }

  async getBySlug(slug: string) {
    const txs = await this.ardb
      .search('transactions')
      .sort('HEIGHT_DESC')
      .limit(1)
      .tag('Slug', slug)
      .find() as ArdbTransaction[]

    const tx = txs.at(0)

    if (tx) {
      return this.getById(tx.id)
    }

    return null
  }

  async getBySlugOrId(slugOrId: string) {
    const bySlug = await this.getBySlug(slugOrId)

    if (bySlug) {
      return bySlug
    }

    return this.getById(slugOrId)
  }
}
