import Arweave from 'arweave'
import ArDB from 'ardb'
import ArdbTransaction from 'ardb/lib/models/transaction'

import TransactionsModule from '../common/transactions'
import { ArFSFileMetadata } from './'

export default class ArFSClient {
  private readonly ardb!: ArDB
  protected readonly transactions!: TransactionsModule

  constructor(arweave: Arweave) {
    this.ardb = new ArDB(arweave)
    this.transactions = new TransactionsModule(arweave)
  }

  /**
   * Queries for `Folder-Type`: `publication` root folder used for publications
   * by given address
   * 
   * @param address
   * 
   * @returns ArFS Drive ID & Folder ID of publication root if exists or null
   */
  async getPublicationRoot(address: string): Promise<{
    driveId: string,
    folderId: string
  } | null> {
    const txs = await this.ardb
      .search('transactions')
      .from(address)
      .sort('HEIGHT_DESC')
      .limit(1)
      .tag('Folder-Type', 'publications')
      .find() as ArdbTransaction[]

    const tx = txs[0]

    if (tx) {
      const driveId = tx.tags.find(t => t.name === 'Drive-Id')?.value
      const folderId = tx.tags.find(t => t.name === 'Folder-Id')?.value

      if (driveId && folderId) {
        return { driveId, folderId }
      }
    }

    return null
  }

  async getFileMetadataTransaction(
    fileId: string
  ): Promise<ArdbTransaction | null> {
    const txs = await this.ardb
      .search('transactions')
      .sort('HEIGHT_DESC')
      .limit(1)
      .tag('File-Id', fileId)
      .find() as ArdbTransaction[]

    return txs[0] || null
  }

  async getFileMetadata(fileId: string) {
    const tx = await this.getFileMetadataTransaction(fileId)

    if (!tx) {
      throw new Error(`ArFS file not found: ${fileId}`)
    }

    return this.transactions.getData<ArFSFileMetadata>(tx.id)
  }
}
