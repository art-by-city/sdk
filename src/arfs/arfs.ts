import Arweave from 'arweave'
import ArDB from 'ardb'
import ArdbTransaction from 'ardb/lib/models/transaction'

export default class ArFSClient {
  private readonly ardb!: ArDB

  constructor(
    arweave: Arweave
  ) {
    this.ardb = new ArDB(arweave)
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
}
