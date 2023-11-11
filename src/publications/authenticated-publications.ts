import { DataItem, bundleAndSignData } from 'arbundles'
import Arweave from 'arweave'
import { ArweaveSigner } from 'warp-arbundles'
import { Tag } from 'warp-contracts'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy'

import {
  ArFSOpts,
  AuthenticatedArFSClient,
  generateArFSFileTags
} from '../arfs'
import DataItemFactory from '../common/data-item'
import {
  generateAns110Tags,
  generateArtByCityTags,
  generateAtomicLicenseTags,
  generatePrimaryAssetTags
} from '../common/tags'
import { ArtByCityConfig } from '../config'
import { getAddressFromSigner } from '../util/crypto'
import {
  ArtByCityPublications,
  AudioPublicationOptions,
  ImagePublicationOptions,
  ModelPublicationOptions,
  PublicationOptions,
  PublicationResult,
  TextPublicationOptions,
  VideoPublicationOptions
} from './'
import {
  FileDataItemFactory,
  ImageDataItemFactory,
  PublicationItemFactory
} from './publication-item'

export default class AuthenticatedArtByCityPublications
  extends ArtByCityPublications
{
  private readonly publicationItemFactory!: PublicationItemFactory
  private readonly imageItemFactory!: ImageDataItemFactory
  private readonly fileItemFactory!: FileDataItemFactory

  constructor(
    protected readonly arweave: Arweave,
    protected readonly arfs: AuthenticatedArFSClient,
    protected readonly config: ArtByCityConfig,    
    private readonly signer: ArweaveSigner | InjectedArweaveSigner
  ) {
    super(arweave, arfs, config)
    const dataItemFactory = new DataItemFactory(signer)
    this.publicationItemFactory = new PublicationItemFactory(dataItemFactory)
    this.imageItemFactory = new ImageDataItemFactory(dataItemFactory)
  }

  async create(opts: ImagePublicationOptions): Promise<PublicationResult>
  async create(opts: AudioPublicationOptions): Promise<PublicationResult>
  async create(opts: ModelPublicationOptions): Promise<PublicationResult>
  async create(opts: VideoPublicationOptions): Promise<PublicationResult>
  async create(opts: TextPublicationOptions): Promise<PublicationResult>
  async create(opts: PublicationOptions): Promise<PublicationResult> {
    const unixTime = (Date.now() / 1000).toString()
    const address = await getAddressFromSigner(this.signer)
    const { driveId, folderId } = opts.driveId && opts.folderId
      ? { driveId: opts.driveId, folderId: opts.folderId }
      : await this.arfs.getOrCreatePublicationRoot(address)
    const arfsOpts = {
      address,
      driveId,
      folderId,
      unixTime
    }

    switch (opts.type) {
      case 'image':
        return this.createImagePublication(opts, arfsOpts)
      case 'audio':
      case 'model':
      case 'video':
      case 'text':
      default:
        return this.createFilePublication(opts, arfsOpts)
    }
  }

  private async createFilePublication(
    opts: Exclude<PublicationOptions, ImagePublicationOptions>,
    arfs: ArFSOpts
  ) {
    const dataItems: DataItem[] = []

    let thumbnail: {
      original: string,
      small: string,
      large: string
    } | undefined = undefined
    if (opts.thumbnail) {
      const thumbnailDataItems = await this.imageItemFactory.createItems({
        file: opts.thumbnail,
        arfs
      })
      thumbnail = {
        original: thumbnailDataItems.original.id,
        small: thumbnailDataItems.small.id,
        large: thumbnailDataItems.large.id
      }
      dataItems.push(...Object.values(thumbnailDataItems))
    }

    const primaryDataItems = await this.fileItemFactory.createItems({
      file: opts.primary,
      arfs,
      thumbnail,
      atomicAsset: {
        title: opts.title,
        description: opts.description,
        tags: generatePrimaryAssetTags(
          opts,
          this.config.contracts.atomicLicense,
          JSON.stringify({ owner: arfs.address })
        )
      }
    })
    dataItems.push(...Object.values(primaryDataItems))

    const secondaryDataItems: DataItem[] = (await Promise.all(
      (opts.secondary || []).map(async file =>
        this.publicationItemFactory.createItems({
          file,
          arfs,
          relatedTo: primaryDataItems.original.id
        })
      )
    )).flat()
    dataItems.push(...secondaryDataItems)

    const tx = await this.createPublicationBundleTransaction(dataItems)

    return {
      bundleTxId: tx.id,
      primaryAssetTxId: primaryDataItems.original.id,
      primaryMetadataTxId: primaryDataItems.originalMetadata.id,
      tx
    }
  }

  private async createImagePublication(
    opts: ImagePublicationOptions,
    arfs: ArFSOpts
  ) {
    const primaryDataItems = await this.imageItemFactory.createItems({
      file: opts.primary,
      arfs,
      atomicAsset: {
        title: opts.title,
        description: opts.description,
        tags: generatePrimaryAssetTags(
          opts,
          this.config.contracts.atomicLicense,
          JSON.stringify({ owner: arfs.address })
        )
      }
    })

    const secondaryDataItems: DataItem[] = (await Promise.all(
      (opts.secondary || []).map(async file =>
        this.publicationItemFactory.createItems({
          file,
          arfs,
          relatedTo: primaryDataItems.original.id
        })
      )
    )).flat()
    
    const dataItems = Object.values(primaryDataItems).concat(secondaryDataItems)
    const tx = await this.createPublicationBundleTransaction(dataItems)

    return {
      bundleTxId: tx.id,
      primaryAssetTxId: primaryDataItems.original.id,
      primaryMetadataTxId: primaryDataItems.originalMetadata.id,
      tx
    }
  }

  private async createPublicationBundleTransaction(items: DataItem[]) {
    const bundle = await bundleAndSignData(items, this.signer)
    const tx = await this.arweave.createTransaction({ data: bundle.getRaw() })
    tx.addTag('Client', '@artbycity/sdk')
    tx.addTag('Protocol', 'ArtByCity')
    tx.addTag('Bundle-Format', 'binary')
    tx.addTag('Bundle-Version', '2.0.0')
    tx.addTag('Entity-Type', 'publication')

    const signer = this.signer instanceof ArweaveSigner
      /* @ts-expect-error signer types */
      ? this.signer.jwk
      : 'use_wallet'
    await this.arweave.transactions.sign(tx, signer)

    return tx
  }
}
