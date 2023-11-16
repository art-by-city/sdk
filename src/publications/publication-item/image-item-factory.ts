import { DataItem } from 'arbundles'
import { Tag } from 'warp-contracts'
import { v4 as uuidv4 } from 'uuid'

import { generateArFSFileTags } from '../../arfs'
import DataItemFactory from '../../common/data-item'
import { generateArtByCityTags } from '../../common/tags'
import { PublishingImage } from '../'
import { PublicationItemOptions } from './publication-item-factory'

export interface ImagePublicationItems {
  original: DataItem
  originalMetadata: DataItem
  small: DataItem
  smallMetadata: DataItem
  large: DataItem
  largeMetadata: DataItem
}

export default class ImageDataItemFactory {
  constructor(private dataItemFactory: DataItemFactory) {}

  async createItems(
    opts: PublicationItemOptions<PublishingImage>
  ): Promise<ImagePublicationItems> {
    const { small, large, ...original } = opts.file

    const fileIdSmall = uuidv4()
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
      generateArFSFileTags({ ...opts.arfs, fileId: fileIdSmall })
    )
    
    const fileIdLarge = uuidv4()
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
      generateArFSFileTags({ ...opts.arfs, fileId: fileIdLarge })
    )

    const fileId = uuidv4()
    const originalTags: Tag[] = [
      new Tag('Content-Type', original.type),
      new Tag('Thumbnail-Small', smallDataItem.id),
      new Tag('Thumbnail-Large', largeDataItem.id),
      new Tag('Metadata-Id', fileId),
      ...generateArtByCityTags()
    ]
    if (opts.atomicAsset?.tags) {
      originalTags.push(...opts.atomicAsset.tags)
    }

    const originalDataItem = await this.dataItemFactory.createAndSign(
      original.data,
      originalTags
    )
    const originalMetadataDataItem = await this.dataItemFactory.createAndSign(
      JSON.stringify({
        name: original.name,
        size: original.size,
        lastModifiedDate: original.lastModified,
        dataTxId: originalDataItem.id,
        dataContentType: original.type,
        title: opts.atomicAsset?.title,
        description: opts.atomicAsset?.description
      }),
      generateArFSFileTags({ ...opts.arfs, fileId })
    )

    return {
      original: originalDataItem,
      originalMetadata: originalMetadataDataItem,
      small: smallDataItem,
      smallMetadata: smallMetadataDataItem,
      large: largeDataItem,
      largeMetadata: largeMetadataDataItem
    }
  }
}
