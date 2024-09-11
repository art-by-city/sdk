import { Tag } from 'arbundles'
import { v4 as uuidv4 } from 'uuid'

import { generateArFSFileTags } from '../../arfs'
import DataItemFactory from '../../common/data-item'
import { generateArtByCityTags } from '../../common/tags'
import { PublishingFile } from '../'
import { PublicationItemOptions } from './publication-item-factory'

export default class FileDataItemFactory {
  constructor(private dataItemFactory: DataItemFactory) {}

  async createItems(opts: PublicationItemOptions<PublishingFile>) {
    const { ...original } = opts.file

    const fileId = uuidv4()

    const originalTags: Tag[] = [
      { name: 'Content-Type', value: original.type },
      { name: 'Metadata-Id', value: fileId },
      ...generateArtByCityTags()
    ]
    if (opts.thumbnail) {
      originalTags.push({ name: 'Thumbnail', value: opts.thumbnail.original })
      originalTags.push({ name: 'Thumbnail-Small', value: opts.thumbnail.small })
      originalTags.push({ name: 'Thumbnail-Large', value: opts.thumbnail.large })
    }
    if (opts.atomicAsset?.tags) {
      originalTags.push(...opts.atomicAsset.tags)
    }
    if (opts.relatedTo) {
      originalTags.push({ name: 'Related-To', value: opts.relatedTo })
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
      originalMetadata: originalMetadataDataItem
    }
  }
}
