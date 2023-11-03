import { bundleAndSignData } from 'arbundles'
import Arweave from 'arweave'
import { ArweaveSigner } from 'warp-arbundles'
import { Tag } from 'warp-contracts'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy'

import { AuthenticatedArFSClient, generateArFSFileTags } from '../arfs'
import DataItemFactory from '../common/data-item'
import { generateAns110Tags, generateArtByCityTags } from '../common/tags'
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
}

export default class AuthenticatedArtByCityPublications {
  constructor(
    private readonly config: ArtByCityConfig,
    private readonly arweave: Arweave,
    private readonly arfs: AuthenticatedArFSClient,
    private readonly signer: ArweaveSigner | InjectedArweaveSigner
  ) {}

  async publish(opts: ImagePublicationOptions): Promise<PublicationResult>
  async publish(opts: AudioPublicationOptions): Promise<PublicationResult>
  async publish(opts: ModelPublicationOptions): Promise<PublicationResult>
  async publish(opts: VideoPublicationOptions): Promise<PublicationResult>
  async publish(opts: TextPublicationOptions): Promise<PublicationResult>
  async publish(opts: PublicationOptions): Promise<PublicationResult> {
    switch (opts.type) {
      case 'image':
        return this.publishImage(opts)
      case 'audio':
      case 'model':
      case 'video':
      case 'text':
      default:
        throw new Error(`Publication type ${opts.type} is not yet implemented!`)
    }
  }

  private async publishImage(opts: ImagePublicationOptions) {
    const dataItemFactory = new DataItemFactory(this.signer)
    const unixTime = (Date.now() / 1000).toString()
    const address = await getAddressFromSigner(this.signer)
    const { driveId, folderId } = opts.driveId && opts.folderId
      ? { driveId: opts.driveId, folderId: opts.folderId }
      : await this.arfs.getOrCreatePublicationRoot(address)

    const publicationItems = await Promise.all(
      opts.images.map(async ({ original, small, large }) => {        
        const smallTags: Tag[] = [
          new Tag('Content-Type', small.type),
          ...generateArtByCityTags()
        ]
        const smallDataItem = await dataItemFactory.createAndSign(
          small.data,
          smallTags
        )
        const smallMetadata = {
          name: small.name,
          size: small.size,
          lastModifiedDate: small.lastModified,
          dataTxId: smallDataItem.id,
          dataContentType: small.type
        }
        const smallMetadataTags = generateArFSFileTags({
          driveId,
          parentFolderId: folderId,
          unixTime
        })
        const smallMetadataDataItem = await dataItemFactory.createAndSign(
          JSON.stringify(smallMetadata),
          smallMetadataTags
        )
        
        const largeTags: Tag[] = [
          new Tag('Content-Type', large.type),
          ...generateArtByCityTags()
        ]
        const largeDataItem = await dataItemFactory.createAndSign(
          large.data,
          largeTags
        )
        const largeMetadata = {
          name: large.name,
          size: large.size,
          lastModifiedDate: large.lastModified,
          dataTxId: largeDataItem.id,
          dataContentType: large.type
        }
        const largeMetadataTags = generateArFSFileTags({
          driveId,
          parentFolderId: folderId,
          unixTime
        })
        const largeMetadataDataItem = await dataItemFactory.createAndSign(
          JSON.stringify(largeMetadata),
          largeMetadataTags
        )

        const topics: (string | { name: string, value: string })[] = []
        if (opts.topics) {
          topics.push(...opts.topics)
        }
        if (opts.city) {
          topics.push({ name: 'city', value: opts.city })
        }
        if (opts.medium) {
          topics.push({ name: 'medium', value: opts.medium })
        }

        const originalTags: Tag[] = [
          new Tag('Content-Type', original.type),
          ...generateAns110Tags({
            title: opts.title,
            type: 'image',
            description: opts.description,
            topics
          }),
          ...generateArtByCityTags(),
          new Tag('Thumbnail-Small', smallDataItem.id),
          new Tag('Thumbnail-Large', largeDataItem.id),
          new Tag('App-Name', 'SmartWeaveContract'),
          new Tag('App-Version', '0.3.0'),
          new Tag('Contract-Src', this.config.contracts.atomicLicense),
          new Tag('Init-State', JSON.stringify({ owner: address }))
        ]
        if (opts.slug) {
          originalTags.push(new Tag('Slug', opts.slug))
        }
        const originalDataItem = await dataItemFactory.createAndSign(
          original.data,
          originalTags
        )
        const originalMetadata = {
          name: original.name,
          size: original.size,
          lastModifiedDate: original.lastModified,
          dataTxId: originalDataItem.id,
          dataContentType: original.type,
          title: opts.title,
          description: opts.description
        }
        const originalMetadataTags = generateArFSFileTags({
          driveId,
          parentFolderId: folderId,
          unixTime
        })
        const originalMetadataDataItem = await dataItemFactory.createAndSign(
          JSON.stringify(originalMetadata),
          originalMetadataTags
        )

        return {          
          originalDataItem,
          originalMetadataDataItem,
          smallDataItem,
          smallMetadataDataItem,
          largeDataItem,
          largeMetadataDataItem
        }
      })
    )

    const { originalDataItem, originalMetadataDataItem } = publicationItems[0]

    const dataItems = publicationItems.map(({          
      originalDataItem,
      originalMetadataDataItem,
      smallDataItem,
      smallMetadataDataItem,
      largeDataItem,
      largeMetadataDataItem
    }) => {
      return [
        originalDataItem,
        originalMetadataDataItem,
        smallDataItem,
        smallMetadataDataItem,
        largeDataItem,
        largeMetadataDataItem
      ]
    }).flat()

    const bundle = await bundleAndSignData(dataItems, this.signer)
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
    await this.arweave.transactions.post(tx)

    return {
      bundleTxId: tx.id,
      primaryAssetTxId: originalDataItem.id,
      primaryMetadataTxId: originalMetadataDataItem.id
    }
  }
}
