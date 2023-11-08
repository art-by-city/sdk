import { Topic } from '../common/tags'

export type PublicationType = 'image' | 'audio' | 'model' | 'video' | 'text'
export interface PublishingFile {
  data: string | Uint8Array
  type: string // mime type
  size: number // integer - computed file size
  name: string // user defined file name with extension
  lastModified?: number // last modified timestamp in unix epoch ms
}
export interface PrimaryImagePublishingFile extends PublishingFile {
  type: ImageMimeTypes
}
export interface PreviewImagePublishingFile extends PublishingFile {
  type: 'image/jpeg'
}
export interface PublicationImageWithThumbnails {
  primary: PrimaryImagePublishingFile
  small: PreviewImagePublishingFile
  large: PreviewImagePublishingFile
}
export interface PublicationAudio extends PublishingFile {
  type: AudioMimeTypes
}
export interface BasePublicationOptions {
  type: PublicationType
  title: string
  slug?: string
  description?: string
  driveId?: string
  folderId?: string

  // Topics
  topics?: Topic[]
  city?: string
  medium?: string
  genre?: string
}
export interface ImagePublicationOptions extends BasePublicationOptions {
  type: 'image'
  images: PublicationImageWithThumbnails[]
}
export interface AudioPublicationOptions extends BasePublicationOptions {
  type: 'audio',
  audio: PublicationAudio
  image?: PublicationImageWithThumbnails
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

export type AudioMimeTypes =
  | 'audio/aac'
  | 'audio/flac'
  | 'audio/mpeg'
  | 'audio/wav'
  | 'audio/ogg'
  | 'audio/webm'

export {
  default as AuthenticatedArtByCityPublications
} from './authenticated-publications'
