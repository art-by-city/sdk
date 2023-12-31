import { DataItem } from 'arbundles'
import { Tag } from 'warp-contracts'

import { ArFSOpts } from '../../arfs'
import DataItemFactory from '../../common/data-item'
import {
  PublishingFile,
  PublishingImage,
  isPublishingImage
} from '../'
import { FileDataItemFactory, ImageDataItemFactory } from './'

export interface AtomicAssetOptions {
  title: string
  description?: string
  tags?: Tag[]
}

export interface PublicationItemOptions<
  F extends PublishingFile = PublishingFile
> {
  file: F
  arfs: ArFSOpts
  thumbnail?: {
    original: string,
    small: string,
    large: string
  }
  atomicAsset?: AtomicAssetOptions
  relatedTo?: string
}

export default class PublicationItemFactory {
  private readonly imageItemFactory!: ImageDataItemFactory
  private readonly fileItemFactory!: FileDataItemFactory

  constructor(dataItemFactory: DataItemFactory) {
    this.imageItemFactory = new ImageDataItemFactory(dataItemFactory)
  }

  async createItems(
    opts: PublicationItemOptions<PublishingImage>
  ): Promise<DataItem[]>
  async createItems(
    opts: PublicationItemOptions<PublishingFile>
  ): Promise<DataItem[]>
  async createItems(opts: PublicationItemOptions): Promise<DataItem[]> {
    const { arfs, atomicAsset, file } = opts

    if (isPublishingImage(file)) {
      const items = await this.imageItemFactory.createItems({
        file,
        arfs,
        atomicAsset
      })
      
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
      return Object.values(items)
    }

    const items = await this.fileItemFactory.createItems(opts)

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
    return Object.values(items)
  }
}
