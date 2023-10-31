import Arweave from 'arweave'
import { JWKInterface } from 'warp-contracts'
import { ArweaveSigner, createData } from 'warp-arbundles'
import {
  InjectedArweaveSigner
} from 'warp-contracts-plugin-deploy'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

import { ArtByCityConfig } from '../config'
import ArFSClient from './arfs'
import { generateArFSDriveTags, generateArFSFolderTags } from './'
import TransactionsModule from '../common/transactions'

export default class AuthenticatedArFSClient extends ArFSClient {
  private readonly transactions!: TransactionsModule

  constructor(
    arweave: Arweave,
    config: ArtByCityConfig,
    private readonly signer: ArweaveSigner | InjectedArweaveSigner
  ) {
    super(arweave, config)
    this.transactions = new TransactionsModule()
  }

  async createDrive(name: string): Promise<{
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
    const driveTags = generateArFSDriveTags({ driveId, drivePrivacy, unixTime })
    
    const folder = { name }
    const folderTags = generateArFSFolderTags({
      driveId,
      folderId: rootFolderId,
      unixTime
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

    await this.transactions.dispatch(driveDataItem.getRaw())
    await this.transactions.dispatch(folderDataItem.getRaw())

    return {
      driveId,
      driveTxId: await driveDataItem.id,
      rootFolderId,
      rootFolderTxId: await folderDataItem.id
    }
  }
}
