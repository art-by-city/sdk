import { DataItem, bundleAndSignData } from 'arbundles'
import Arweave from 'arweave'
import { ArweaveSigner } from 'warp-arbundles'
import { Tag, Transaction } from 'warp-contracts'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy'

import { AuthenticatedArFSClient, generateArFSFileTags } from '../arfs'
import DataItemFactory from '../common/data-item'
import { Topic, generateAns110Tags, generateArtByCityTags, generateAtomicLicenseTags } from '../common/tags'
import { ArtByCityConfig } from '../config'
import { getAddressFromSigner } from '../util/crypto'
import {
  AudioPublicationOptions,
  ImagePublicationOptions,
  ModelPublicationOptions,
  PublicationOptions,
  TextPublicationOptions,
  VideoPublicationOptions
} from './'

export interface PublicationResult {
  bundleTxId: string
  primaryAssetTxId: string
  primaryMetadataTxId: string
  tx: Transaction
}

export default class AuthenticatedArtByCityPublications {
  private readonly dataItemFactory!: DataItemFactory

  constructor(
    private readonly config: ArtByCityConfig,
    private readonly arweave: Arweave,
    private readonly arfs: AuthenticatedArFSClient,
    private readonly signer: ArweaveSigner | InjectedArweaveSigner
  ) {
    this.dataItemFactory = new DataItemFactory(signer)
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
    
    switch (opts.type) {
      case 'image':
        return this.publishImage(address, driveId, folderId, unixTime, opts)
      case 'audio':
        return this.publishAudio(address, driveId, folderId, unixTime, opts)
      case 'model':
      case 'video':
      case 'text':
      default:
        throw new Error(`Publication type ${opts.type} is not yet implemented!`)
    }
  }

  private async publishImage(
    address: string,
    driveId: string,
    folderId: string,
    unixTime: string,
    opts: ImagePublicationOptions
  ) {
    const publicationItems = await this.createImageDataItems(
      opts,
      address,
      driveId,
      folderId,
      unixTime,
      true
    )

    const { primaryDataItem, primaryMetadataDataItem } = publicationItems[0]
    const dataItems = publicationItems.map(({
      primaryDataItem,
      primaryMetadataDataItem,
      smallDataItem,
      smallMetadataDataItem,
      largeDataItem,
      largeMetadataDataItem
    }) => {
      return [
        primaryDataItem,
        primaryMetadataDataItem,
        smallDataItem,
        smallMetadataDataItem,
        largeDataItem,
        largeMetadataDataItem
      ]
    }).flat()

    const tx = await this.createPublicationBundleTransaction(dataItems)

    return {
      bundleTxId: tx.id,
      primaryAssetTxId: primaryDataItem.id,
      primaryMetadataTxId: primaryMetadataDataItem.id,
      tx
    }
  }

  private async createImageDataItems(
    opts: PublicationOptions,
    address: string,
    driveId: string,
    folderId: string,
    unixTime: string,
    isPrimaryPublicationAsset?: boolean
  ) {
    const images = 'images' in opts
      ? opts.images
      : 'image' in opts && opts.image
        ? [ opts.image ]
        : []

    return Promise.all(images.map(async ({ primary, small, large }) => {
      const smallDataItem = await this.dataItemFactory.createAndSign(
        small.data,
        [
          new Tag('Content-Type', small.type),
          ...generateArtByCityTags()
        ]
      )
      const smallMetadataDataItem = await this.dataItemFactory.createAndSign(
        JSON.stringify({
          name: small.name,
          size: small.size,
          lastModifiedDate: small.lastModified,
          dataTxId: smallDataItem.id,
          dataContentType: small.type
        }),
        generateArFSFileTags({
          driveId,
          parentFolderId: folderId,
          unixTime
        })
      )
      
      const largeDataItem = await this.dataItemFactory.createAndSign(
        large.data,
        [
          new Tag('Content-Type', large.type),
          ...generateArtByCityTags()
        ]
      )
      const largeMetadataDataItem = await this.dataItemFactory.createAndSign(
        JSON.stringify({
          name: large.name,
          size: large.size,
          lastModifiedDate: large.lastModified,
          dataTxId: largeDataItem.id,
          dataContentType: large.type
        }),
        generateArFSFileTags({
          driveId,
          parentFolderId: folderId,
          unixTime
        })
      )

      const primaryTags: Tag[] = [
        new Tag('Content-Type', primary.type),
        new Tag('Thumbnail-Small', smallDataItem.id),
        new Tag('Thumbnail-Large', largeDataItem.id),
        ...generateArtByCityTags()
      ]
      if (isPrimaryPublicationAsset) {
        primaryTags.push(
          ...generateAns110Tags(opts),
          ...generateAtomicLicenseTags(
            this.config.contracts.atomicLicense,
            JSON.stringify({ owner: address })
          )
        )

        if (opts.slug) {
          primaryTags.push(new Tag('Slug', opts.slug))
        }
      }      

      const primaryDataItem = await this.dataItemFactory.createAndSign(
        primary.data,
        primaryTags
      )
      const primaryMetadataDataItem = await this.dataItemFactory.createAndSign(
        JSON.stringify({
          name: primary.name,
          size: primary.size,
          lastModifiedDate: primary.lastModified,
          dataTxId: primaryDataItem.id,
          dataContentType: primary.type,
          title: opts.title,
          description: opts.description
        }),
        generateArFSFileTags({
          driveId,
          parentFolderId: folderId,
          unixTime
        })
      )

      return {
        primaryDataItem,
        primaryMetadataDataItem,
        smallDataItem,
        smallMetadataDataItem,
        largeDataItem,
        largeMetadataDataItem
      }
    }))
  }

  private async publishAudio(
    address: string,
    driveId: string,
    folderId: string,
    unixTime: string,
    opts: AudioPublicationOptions
  ) {
    const imageItems = await this.createImageDataItems(
      opts,
      address,
      driveId,
      folderId,
      unixTime
    )

    const {
      audioDataItem,
      audioMetadataDataItem
    } = await this.createAudioDataItems(
      opts,
      address,
      driveId,
      folderId,
      unixTime,
      imageItems[0]?.primaryDataItem.id
    )

    const dataItems = imageItems.map(({
      primaryDataItem,
      primaryMetadataDataItem,
      smallDataItem,
      smallMetadataDataItem,
      largeDataItem,
      largeMetadataDataItem
    }) => {
      return [
        primaryDataItem,
        primaryMetadataDataItem,
        smallDataItem,
        smallMetadataDataItem,
        largeDataItem,
        largeMetadataDataItem
      ]
    }).flat()

    dataItems.push(audioDataItem, audioMetadataDataItem)

    const tx = await this.createPublicationBundleTransaction(dataItems)

    return {
      bundleTxId: tx.id,
      primaryAssetTxId: audioDataItem.id,
      primaryMetadataTxId: audioMetadataDataItem.id,
      tx
    }
  }

  private async createAudioDataItems(
    opts: AudioPublicationOptions,
    address: string,
    driveId: string,
    folderId: string,
    unixTime: string,
    thumbnailId?: string
  ) {
    const audioTags: Tag[] = [
      new Tag('Content-Type', opts.audio.type),
      ...generateArtByCityTags(),
      ...generateAns110Tags(opts),
      ...generateAtomicLicenseTags(
        this.config.contracts.atomicLicense,
        JSON.stringify({ owner: address })
      )
    ]

    if (thumbnailId) {
      audioTags.push(new Tag('Thumbnail', thumbnailId))
    }

    if (opts.slug) {
      audioTags.push(new Tag('Slug', opts.slug))
    }

    const audioDataItem = await this.dataItemFactory.createAndSign(
      opts.audio.data,
      audioTags
    )

    const audioMetadataDataItem = await this.dataItemFactory.createAndSign(
      JSON.stringify({
        name: opts.audio.name,
        size: opts.audio.size,
        lastModifiedDate: opts.audio.lastModified,
        dataTxId: audioDataItem.id,
        dataContentType: opts.audio.type,
        title: opts.title,
        description: opts.description
      }),
      generateArFSFileTags({
        driveId,
        parentFolderId: folderId,
        unixTime
      })
    )

    return {
      audioDataItem,
      audioMetadataDataItem
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
