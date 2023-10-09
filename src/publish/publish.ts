import Arweave from 'arweave'

export type PublicationType = 'image' | 'audio'
export interface PublishingFile {
  data: string | Uint8Array
  type: string // mime type
  size: number // integer - computed file size
  name: string // user defined file name with extension
  lastModified?: number // last modified timestamp in unix epoch ms
}
export interface BasePublicationOptions {
  type: PublicationType
  title: string
  slug?: string
  description?: string
  city?: string
  images: PublishingFile[]
}
export interface ImagePublicationOptions extends BasePublicationOptions {
  type: 'image'
  medium?: string
}
export interface AudioPublicationOptions extends BasePublicationOptions {
  type: 'audio'
}
export type PublicationOptions =
  | ImagePublicationOptions
  | AudioPublicationOptions

export default class ArtByCityPublish {
  constructor(private readonly arweave: Arweave) {}

  async publish(what: 'image', opts: ImagePublicationOptions): Promise<string>
  async publish(what: 'audio', opts: AudioPublicationOptions): Promise<string>
  async publish(
    what: PublicationType,
    opts: PublicationOptions
  ): Promise<string> {
    switch (what) {
      case 'image':
      case 'audio':
      default:
        throw new Error('This publication type is not yet implemented!')
    }
  }

  private async publishImage(opts: ImagePublicationOptions) {

  }
}
