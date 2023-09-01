import Arweave from 'arweave'
import ArDB from 'ardb'
import ArdbTransaction from 'ardb/lib/models/transaction'
import { ArtByCityEnvironment } from '../config'

export type DomainEntityCategory =
  | 'artwork'
  | 'artwork:bundle'
  | 'avatar'
  | 'like'
  | 'profile'
  | 'tip'
  | 'username'
  | 'identity'

export interface TransactionSearchResults {
  cursor: string
  transactions: ArdbTransaction[]
}

export interface LegacyTransactionQueryOpts {
  from: string | string[],
  to: string | string[],
  environment: ArtByCityEnvironment,
  type: string
  tags: { name: string, value: string }[]
  minHeight: number
  maxHeight: number
  cursor: string
  limit: number | 'all'
  sort: 'HEIGHT_ASC' | 'HEIGHT_DESC'
}

export default class LegacyTransactions {
  private ardb!: ArDB

  constructor(arweave: Arweave) {
    this.ardb = new ArDB(arweave)
  }

  async query(
    category: DomainEntityCategory,
    opts: Partial<LegacyTransactionQueryOpts>
  ): Promise<TransactionSearchResults> {
    let appName = 'ArtByCity'
    switch (opts.environment) {
      case 'development':
        appName = 'ArtByCity-Development'
        break
      case 'staging':
        appName = 'ArtByCity-Staging'
        break
    }

    let query = this.ardb
      .search('transactions')
      .appName(appName)
      .tag('Category', category)

    if (opts.from) {
      query = query.from(opts.from)
    }

    if (opts.to) {
      query = query.to(opts.to)
    }

    if (opts.type) {
      query = query.type(opts.type)
    } else {
      query = query.type('application/json')
    }

    if (opts.tags) {
      for (const tag of opts.tags) {
        query = query.tag(tag.name, tag.value)
      }
    }

    if (opts.minHeight) {
      query = query.min(opts.minHeight)
    }

    if (opts.maxHeight) {
      query = query.max(opts.maxHeight)
    }

    if (opts.cursor) {
      query = query.cursor(opts.cursor)
    }

    if (opts.limit && opts.limit !== 'all') {
      query = query.limit(opts.limit)
    }

    const sort = opts.sort || 'HEIGHT_DESC'

    const transactions = opts.limit === 'all'
      ? await query.findAll({ sort }) as ArdbTransaction[]
      : await query.find({ sort }) as ArdbTransaction[]
    const cursor = query.getCursor()

    return { cursor, transactions }
  }
}
