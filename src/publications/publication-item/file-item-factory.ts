import { Tag } from 'warp-contracts'

import { generateArFSFileTags } from '../../arfs'
import DataItemFactory from '../../common/data-item'
import { generateArtByCityTags } from '../../common/tags'
import { PublishingFile } from '../'
import { PublicationItemOptions } from './publication-item-factory'

export default class FileDataItemFactory {
  constructor(private dataItemFactory: DataItemFactory) {}

  async createItems(opts: PublicationItemOptions<PublishingFile>) {
    const { ...original } = opts.file

    const originalTags: Tag[] = [
      new Tag('Content-Type', original.type),
      ...generateArtByCityTags()
    ]
    if (opts.thumbnail) {
      originalTags.push(new Tag('Thumbnail', opts.thumbnail.original))
      originalTags.push(new Tag('Thumbnail-Small', opts.thumbnail.small))
      originalTags.push(new Tag('Thumbnail-Large', opts.thumbnail.large))
    }
    if (opts.atomicAsset?.tags) {
      originalTags.push(...opts.atomicAsset.tags)
    }
    if (opts.relatedTo) {
      originalTags.push(new Tag('Related-To', opts.relatedTo))
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
      generateArFSFileTags(opts.arfs)
    )

    return {
      original: originalDataItem,
      originalMetadata: originalMetadataDataItem
    }
  }
}
