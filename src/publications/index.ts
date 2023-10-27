export type PublicationType = 'image' | 'audio'
export interface PublishingFile {
  data: string | Uint8Array
  type: string // mime type
  size: number // integer - computed file size
  name: string // user defined file name with extension
  lastModified?: number // last modified timestamp in unix epoch ms
}
export interface OriginalImagePublishingFile extends PublishingFile {
  type: ImageMimeTypes
}
export interface PreviewImagePublishingFile extends PublishingFile {
  type: 'image/jpeg'
}
export interface PublicationImageWithThumbnails {
  original: OriginalImagePublishingFile
  small: PreviewImagePublishingFile
  large: PreviewImagePublishingFile
}
export interface BasePublicationOptions {
  type: PublicationType
  title: string
  slug?: string
  description?: string
  city?: string
  images: PublicationImageWithThumbnails[]
  topics?: string[]
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

export type ImageMimeTypes =
  | 'image/apng'
  | 'image/avif'
  | 'image/gif'
  | 'image/jpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'image/webp'

export {
  default as AuthenticatedArtByCityPublications
} from './authenticated-publications'
