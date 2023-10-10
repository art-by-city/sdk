import ArDB from 'ardb'
import Arweave from 'arweave'
import { Contract, Warp } from 'warp-contracts'

import { ArtByCityConfig } from '../config'
import { CurationContractStates } from './'
import ArdbTransaction from 'ardb/lib/models/transaction'

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
  ): Contract<State> {
    return this.warp.contract<State>(curationId)
  }

  async createdBy(creator: string, cursor?: string) {
    const query = this.ardb
      .search('transactions')
      .from(creator)
      .tag('Type', 'curation')
    const transactions = await query.findAll({
      sort: 'HEIGHT_DESC'
    }) as ArdbTransaction[]
    const nextCursor = query.getCursor()

    return { cursor: nextCursor, curations: transactions }
  }
}
