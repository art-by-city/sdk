import { DataItem, bundleAndSignData } from 'arbundles'
import Arweave from 'arweave'
import { ArweaveSigner } from 'warp-arbundles'
import { Tag, Transaction } from 'warp-contracts'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy'

import { AuthenticatedArFSClient, generateArFSFileTags } from '../arfs'
import DataItemFactory from '../common/data-item'
import {
  generateAns110Tags,
  generateArtByCityTags,
  generateAtomicLicenseTags
} from '../common/tags'
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

export interface ArFSOpts {
  address: string
  driveId: string
  folderId: string
  unixTime: string
}

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
        return this.createAudioPublication(opts, arfsOpts)
      case 'model':
        return this.createModelPublication(opts, arfsOpts)
      case 'video':
        return this.createVideoPublication(opts, arfsOpts)
      case 'text':
      default:
        throw new Error(`Publication type ${opts.type} is not yet implemented!`)
    }
  }

  private async createImagePublication(
    opts: ImagePublicationOptions,
    arfsOpts: ArFSOpts
  ) {
    const publicationItems = await this.createImageDataItems(
      opts,
      arfsOpts,
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
    arfsOpts: ArFSOpts,
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
          driveId: arfsOpts.driveId,
          parentFolderId: arfsOpts.folderId,
          unixTime: arfsOpts.unixTime
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
          driveId: arfsOpts.driveId,
          parentFolderId: arfsOpts.folderId,
          unixTime: arfsOpts.unixTime
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
            JSON.stringify({ owner: arfsOpts.address })
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
          driveId: arfsOpts.driveId,
          parentFolderId: arfsOpts.folderId,
          unixTime: arfsOpts.unixTime
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

  private async createAudioPublication(
    opts: AudioPublicationOptions,
    arfsOpts: ArFSOpts
  ) {
    const imageItems = await this.createImageDataItems(opts, arfsOpts)

    const {
      audioDataItem,
      audioMetadataDataItem
    } = await this.createAudioDataItems(
      opts,
      arfsOpts,
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
    arfsOpts: ArFSOpts,
    thumbnailId?: string
  ) {
    const tags: Tag[] = [
      new Tag('Content-Type', opts.audio.type),
      ...generateArtByCityTags(),
      ...generateAns110Tags(opts),
      ...generateAtomicLicenseTags(
        this.config.contracts.atomicLicense,
        JSON.stringify({ owner: arfsOpts.address })
      )
    ]

    if (thumbnailId) {
      tags.push(new Tag('Thumbnail', thumbnailId))
    }

    if (opts.slug) {
      tags.push(new Tag('Slug', opts.slug))
    }

    const audioDataItem = await this.dataItemFactory.createAndSign(
      opts.audio.data,
      tags
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
        driveId: arfsOpts.driveId,
        parentFolderId: arfsOpts.folderId,
        unixTime: arfsOpts.unixTime
      })
    )

    return { audioDataItem, audioMetadataDataItem }
  }

  private async createModelPublication(
    opts: ModelPublicationOptions,
    arfsOpts: ArFSOpts
  ) {
    const imageItems = await this.createImageDataItems(opts, arfsOpts)

    const {
      modelDataItem,
      modelMetadataDataItem
    } = await this.createModelDataItems(
      opts,
      arfsOpts,
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

    dataItems.push(modelDataItem, modelMetadataDataItem)

    const tx = await this.createPublicationBundleTransaction(dataItems)

    return {
      bundleTxId: tx.id,
      primaryAssetTxId: modelDataItem.id,
      primaryMetadataTxId: modelMetadataDataItem.id,
      tx
    }
  }

  private async createModelDataItems(
    opts: ModelPublicationOptions,
    arfsOpts: ArFSOpts,
    thumbnailId?: string
  ) {
    const tags: Tag[] = [
      new Tag('Content-Type', opts.model.type),
      ...generateArtByCityTags(),
      ...generateAns110Tags(opts),
      ...generateAtomicLicenseTags(
        this.config.contracts.atomicLicense,
        JSON.stringify({ owner: arfsOpts.address })
      )
    ]

    if (thumbnailId) {
      tags.push(new Tag('Thumbnail', thumbnailId))
    }

    if (opts.slug) {
      tags.push(new Tag('Slug', opts.slug))
    }

    const modelDataItem = await this.dataItemFactory.createAndSign(
      opts.model.data,
      tags
    )

    const modelMetadataDataItem = await this.dataItemFactory.createAndSign(
      JSON.stringify({
        name: opts.model.name,
        size: opts.model.size,
        lastModifiedDate: opts.model.lastModified,
        dataTxId: modelDataItem.id,
        dataContentType: opts.model.type,
        title: opts.title,
        description: opts.description
      }),
      generateArFSFileTags({
        driveId: arfsOpts.driveId,
        parentFolderId: arfsOpts.folderId,
        unixTime: arfsOpts.unixTime
      })
    )

    return { modelDataItem, modelMetadataDataItem }
  }

  private async createVideoPublication(
    opts: VideoPublicationOptions,
    arfsOpts: ArFSOpts
  ) {
    const imageItems = await this.createImageDataItems(opts, arfsOpts)

    const {
      videoDataItem,
      videoMetadataDataItem
    } = await this.createVideoDataItems(
      opts,
      arfsOpts,
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

    dataItems.push(videoDataItem, videoMetadataDataItem)

    const tx = await this.createPublicationBundleTransaction(dataItems)

    return {
      bundleTxId: tx.id,
      primaryAssetTxId: videoDataItem.id,
      primaryMetadataTxId: videoMetadataDataItem.id,
      tx
    }
  }

  private async createVideoDataItems(
    opts: VideoPublicationOptions,
    arfsOpts: ArFSOpts,
    thumbnailId?: string
  ) {
    const tags: Tag[] = [
      new Tag('Content-Type', opts.video.type),
      ...generateArtByCityTags(),
      ...generateAns110Tags(opts),
      ...generateAtomicLicenseTags(
        this.config.contracts.atomicLicense,
        JSON.stringify({ owner: arfsOpts.address })
      )
    ]

    if (thumbnailId) {
      tags.push(new Tag('Thumbnail', thumbnailId))
    }

    if (opts.slug) {
      tags.push(new Tag('Slug', opts.slug))
    }

    const videoDataItem = await this.dataItemFactory.createAndSign(
      opts.video.data,
      tags
    )

    const videoMetadataDataItem = await this.dataItemFactory.createAndSign(
      JSON.stringify({
        name: opts.video.name,
        size: opts.video.size,
        lastModifiedDate: opts.video.lastModified,
        dataTxId: videoDataItem.id,
        dataContentType: opts.video.type,
        title: opts.title,
        description: opts.description
      }),
      generateArFSFileTags({
        driveId: arfsOpts.driveId,
        parentFolderId: arfsOpts.folderId,
        unixTime: arfsOpts.unixTime
      })
    )

    return { videoDataItem, videoMetadataDataItem }
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
