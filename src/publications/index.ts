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
export interface PublicationModel extends PublishingFile {
  type: ModelMimeTypes
}
export interface PublicationVideo extends PublishingFile {
  type: VideoMimeTypes
}
export interface PublicationText extends PublishingFile {
  type: TextMimeTypes
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
  type: 'audio'
  audio: PublicationAudio
  image?: PublicationImageWithThumbnails
}
export interface ModelPublicationOptions extends BasePublicationOptions {
  type: 'model'
  model: PublicationModel
}
export interface VideoPublicationOptions extends BasePublicationOptions {
  type: 'video'
  video: PublicationVideo
}
export interface TextPublicationOptions extends BasePublicationOptions {
  type: 'text'
  text: PublicationText
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

export type ModelMimeTypes =
  | 'model/gltf+json'
  | 'model/gltf+binary'

export type VideoMimeTypes = 
  | 'video/3gpp'
  | 'video/3gpp2'
  | 'video/mp4'
  | 'video/mpeg'
  | 'video/ogg'
  | 'video/quicktime'
  | 'video/webm'
  | 'video/x-f4v'
  | 'video/x-fli'
  | 'video/x-flv'
  | 'video/x-m4v'
  | 'video/x-matroska'

export type TextMimeTypes =
  | 'text/plain'
  | 'text/css'
  | 'text/csv'
  | 'text/html'
  | 'text/javascript'

export {
  default as AuthenticatedArtByCityPublications
} from './authenticated-publications'
