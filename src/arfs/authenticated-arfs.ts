import Arweave from 'arweave'
import { ArweaveSigner, createData } from 'warp-arbundles'
import {
  InjectedArweaveSigner
} from 'warp-contracts-plugin-deploy'
import { v4 as uuidv4 } from 'uuid'

import ArFSClient from './arfs'
import { generateArFSDriveTags, generateArFSFolderTags } from './'
import TransactionsModule from '../common/transactions'

export default class AuthenticatedArFSClient extends ArFSClient {
  declare protected readonly transactions: TransactionsModule

  constructor(
    arweave: Arweave,
    private readonly signer: ArweaveSigner | InjectedArweaveSigner
  ) {
    super(arweave)
    this.transactions = new TransactionsModule(arweave)
  }

  async getOrCreatePublicationRoot(address: string): Promise<{
    driveId: string,
    folderId: string
  }> {
    const publicationRoot = await this.getPublicationRoot(address)

    if (publicationRoot) {
      return publicationRoot
    }

    const newPublicationRoot = await this.createDrive(
      'Publications',
      true
    )

    return {
      driveId: newPublicationRoot.driveId,
      folderId: newPublicationRoot.rootFolderId
    }
  }

  async createDrive(name: string, setAsPublicationRoot?: boolean): Promise<{
    driveId: string
    driveTxId: string
    rootFolderId: string
    rootFolderTxId: string
  }> {
    const driveId = uuidv4()
    const rootFolderId = uuidv4()
    const unixTime = (Date.now() / 1000).toString()
    const drivePrivacy = 'public'

    const drive = { name, rootFolderId }
    const driveTags = generateArFSDriveTags({
      driveId,
      drivePrivacy,
      unixTime
    })
    
    const folder = { name }
    const folderTags = generateArFSFolderTags({
      driveId,
      folderId: rootFolderId,
      unixTime,
      setAsPublicationRoot
    })

    const driveDataItem = createData(
      JSON.stringify(drive),
      /* @ts-expect-error warp types */
      this.signer,
      { tags: driveTags }
    )
    /* @ts-expect-error warp types */
    await driveDataItem.sign(this.signer)
    const folderDataItem = createData(
      JSON.stringify(folder),
      /* @ts-expect-error warp types */
      this.signer,
      { tags: folderTags }
    )
    /* @ts-expect-error warp types */
    await folderDataItem.sign(this.signer)

    await this.transactions.dispatch(driveDataItem)
    await this.transactions.dispatch(folderDataItem)

    return {
      driveId,
      driveTxId: await driveDataItem.id,
      rootFolderId,
      rootFolderTxId: await folderDataItem.id
    }
  }
}
