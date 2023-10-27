import { Tag } from 'arbundles'
import { ArweaveSigner } from 'warp-arbundles'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy'

import DataItemFactory from '../common/data-item'
import {
  generateAns110Tags,
  generateArfsTags,
  generateArtByCityTags,
  generateRelatedToTags
} from '../common/tags'
import {
  AudioPublicationOptions,
  ImagePublicationOptions,
  PublicationOptions
} from '.'

export default class AuthenticatedArtByCityPublications {
  constructor(private readonly signer: ArweaveSigner | InjectedArweaveSigner) {}

  async publish(opts: ImagePublicationOptions): Promise<string>
  async publish(opts: AudioPublicationOptions): Promise<string>
  async publish(opts: PublicationOptions): Promise<string> {
    switch (opts.type) {
      case 'image':
        return this.publishImage(opts)
      case 'audio':
      default:
        throw new Error(`Publication type ${opts.type} is not yet implemented!`)
    }
  }

  private async publishImage(opts: ImagePublicationOptions): Promise<string> {
    const dataItemFactory = new DataItemFactory(this.signer)

    const imageDataItems = await Promise.all(
      opts.images.map(async ({ original, small, large }) => {
        const originalTags: Tag[] = [
          { name: 'Content-Type', value: original.type },
          ...generateAns110Tags({
            title: opts.title,
            type: 'image',
            description: opts.description,
            topics: opts.topics
          }),
          ...generateArtByCityTags()
        ]
        const originalDataItem = await dataItemFactory.create(
          original.data,
          originalTags
        )
        
        const smallTags: Tag[] = [
          { name: 'Content-Type', value: small.type },
          ...generateArtByCityTags(),
          ...generateRelatedToTags(originalDataItem.id, '1920', '1080')
        ]
        const smallDataItem = await dataItemFactory.create(
          small.data,
          smallTags
        )
        
        const largeTags: Tag[] = [
          { name: 'Content-Type', value: large.type },
          ...generateArtByCityTags(),
          ...generateRelatedToTags(originalDataItem.id, '3840', '2160')
        ]
        const largeDataItem = await dataItemFactory.create(
          large.data,
          largeTags
        )

        return {
          original: {
            dataItem: originalDataItem,
            ...original
          },
          small: {
            dataItem: smallDataItem,
            ...small
          },
          large: {
            dataItem: largeDataItem,
            ...large
          }
        }
      })
    )

    // TODO -> create ArFS manifests for every data item


    // TODO -> merge art by city metadata
    // TODO -> add image data items to manifest

    // TODO -> bundle data items

    // TODO -> tag bundle with manifest id
    // TODO -> tag bundle with primary image
    // TODO -> tag bundle with small preview
    // TODO -> tag bundle with large preview

    // TODO -> post bundle

    throw new Error('not yet implemented!')
  }
}
