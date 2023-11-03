import ArDB from 'ardb'
import Arweave from 'arweave'
import { Warp } from 'warp-contracts'

import { ArtByCityConfig } from '../config'
import { CurationContractStates } from '.'
import ArdbTransaction from 'ardb/lib/models/transaction'
import Curation from './curation'

export default class ArtByCityCurations {
  protected readonly ardb!: ArDB

  constructor(
    protected readonly arweave: Arweave,
    protected readonly warp: Warp,
    protected readonly config: ArtByCityConfig
  ) {
    this.ardb = new ArDB(this.arweave)
  }

  get<State extends CurationContractStates>(
    curationId: string
  ): Curation<State> {
    return new Curation(this.warp, curationId)
  }

  async createdBy(creator: string, cursor?: string) {
    let query = this.ardb
      .search('transactions')
      .from(creator)
      .tag('Type', 'curation')

    if (cursor) {
      query = query.cursor(cursor)
    }

    const transactions = await query.findAll({
      sort: 'HEIGHT_DESC'
    }) as ArdbTransaction[]
    const nextCursor = query.getCursor()

    return { cursor: nextCursor, curations: transactions }
  }
}
