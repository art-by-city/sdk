import ArDB from 'ardb'
import ArdbTransaction from 'ardb/lib/models/transaction'
import Arweave from 'arweave'
import { Warp } from 'warp-contracts'

import TransactionsModule from '../common/transactions'
import { ArtByCityConfig } from '../config'
import { FollowingContractState } from './'

export default class ArtByCityFollowing {
  protected readonly ardb!: ArDB
  protected readonly transactions!: TransactionsModule

  constructor(
    protected readonly arweave: Arweave,
    protected readonly warp: Warp,
    protected readonly config: ArtByCityConfig
  ) {
    this.ardb = new ArDB(this.arweave)
    this.transactions = new TransactionsModule(arweave)
  }

  async getContract(owner: string) {
    const txs = await this.ardb
      .search('transactions')
      .from(owner)
      .tag('Contract-Name', 'Following')
      .sort('HEIGHT_DESC')
      .limit(1)      
      .find() as ArdbTransaction[]

    const tx = txs.at(0)

    if (tx) {
      return this.warp.contract<FollowingContractState>(tx.id)
    }

    return null
  }

  async following(owner: string) {
    const contract = await this.getContract(owner)

    if (contract) {
      const { cachedValue: { state } } = await contract.readState()

      return state.following
    }

    return []
  }
}
