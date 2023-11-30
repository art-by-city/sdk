import ArDB from 'ardb'
import ArdbTransaction from 'ardb/lib/models/transaction'
import Arweave from 'arweave'

import TransactionsModule from '../common/transactions'
import { ArtByCityConfig } from '../config'
import { ArtByCityUsernames } from '../usernames'
import { ArweaveAccount, ProfileUpdateOptions } from './'

export default class ArtByCityProfiles {
  protected readonly ardb!: ArDB
  protected readonly transactions!: TransactionsModule

  constructor(
    protected readonly arweave: Arweave,
    protected readonly usernames: ArtByCityUsernames,
    protected readonly config: ArtByCityConfig
  ) {
    this.ardb = new ArDB(this.arweave)
    this.transactions = new TransactionsModule(arweave)
  }

  async get(usernameOrAddress: string): Promise<ArweaveAccount | null> {
    const { address } = await this.usernames.resolve(usernameOrAddress)

    if (!address) {
      return null
    }

    return this.getByAddress(address)
  }

  async getByUsername(username: string): Promise<ArweaveAccount | null> {
    const address = await this.usernames.resolveAddressFromUsername(username)

    if (!address) {
      return null
    }

    return this.getByAddress(address)
  }

  async getByAddress(address: string): Promise<ArweaveAccount | null> {
    const txs = await this.ardb
      .search('transactions')
      .from(address)
      .tag('Protocol-Name', 'Account-0.2')
      .sort('HEIGHT_DESC')
      .limit(1)
      .find() as ArdbTransaction[]

    const tx = txs.at(0)

    if (tx) {
      return this.getByTransactionId(tx.id)
    }

    return null
  }

  async getByTransactionId(txid: string): Promise<ArweaveAccount | null> {
    const tx = await this.transactions.get(txid)

    if (!tx) {
      return null
    }

    const data = await this.transactions.getData<ProfileUpdateOptions>(txid)
      
    return new ArweaveAccount(txid, tx.owner.address, data)
  }
}
