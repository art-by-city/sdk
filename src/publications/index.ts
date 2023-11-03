export type PublicationType = 'image' | 'audio' | 'model' | 'video' | 'text'
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
  driveId?: string
  folderId?: string
}
export interface ImagePublicationOptions extends BasePublicationOptions {
  type: 'image'
  medium?: string
}
export interface AudioPublicationOptions extends BasePublicationOptions {
  type: 'audio'
}
export interface ModelPublicationOptions extends BasePublicationOptions {
  type: 'model'
}
export interface VideoPublicationOptions extends BasePublicationOptions {
  type: 'video'
}
export interface TextPublicationOptions extends BasePublicationOptions {
  type: 'text'
}
export type PublicationOptions =
  | ImagePublicationOptions
  | AudioPublicationOptions
  | ModelPublicationOptions
  | VideoPublicationOptions
  | TextPublicationOptions

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
