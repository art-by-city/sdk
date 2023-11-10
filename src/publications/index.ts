import { Transaction } from 'warp-contracts'

import { Topic } from '../common/tags'

export type PublicationType = 'image' | 'audio' | 'model' | 'video' | 'text'
export interface PublishingFile {
  data: string | Uint8Array
  type: SupportedMimeTypes //string // mime type
  size: number // integer - computed file size
  name: string // user defined file name with extension
  lastModified?: number // last modified timestamp in unix epoch ms
}
export interface PublishingImage extends PublishingFile {
  type: ImageMimeTypes,
  small: PublishingThumbnail
  large: PublishingThumbnail
}
export interface PublishingThumbnail extends PublishingFile {
  type: 'image/jpeg'
}
export interface PublishingAudio extends PublishingFile {
  type: AudioMimeTypes
}
export interface PublishingModel extends PublishingFile {
  type: ModelMimeTypes
}
export interface PublishingVideo extends PublishingFile {
  type: VideoMimeTypes
}
export interface PublishingText extends PublishingFile {
  type: TextMimeTypes
}

export function isPublishingImage(
  file: PublishingFile
): file is PublishingImage {
  return Object.keys(MimeTypes.image).includes(file.type)
}
export function isPublishingAudio(
  file: PublishingFile
): file is PublishingAudio {
  return Object.keys(MimeTypes.audio).includes(file.type)
}
export function isPublishingModel(
  file: PublishingFile
): file is PublishingModel {
  return Object.keys(MimeTypes.model).includes(file.type)
}
export function isPublishingVideo(
  file: PublishingFile
): file is PublishingVideo {
  return Object.keys(MimeTypes.video).includes(file.type)
}
export function isPublishingText(
  file: PublishingFile
): file is PublishingText {
  return Object.keys(MimeTypes.text).includes(file.type)
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
  primary: PublishingImage
  secondary?: PublishingFile[]
}
export interface AudioPublicationOptions extends BasePublicationOptions {
  type: 'audio'
  primary: PublishingAudio
  thumbnail?: PublishingImage
  secondary?: PublishingFile[]
}
export interface ModelPublicationOptions extends BasePublicationOptions {
  type: 'model'
  primary: PublishingModel
  thumbnail?: PublishingImage
  secondary?: PublishingFile[]
}
export interface VideoPublicationOptions extends BasePublicationOptions {
  type: 'video'
  primary: PublishingVideo
  thumbnail?: PublishingImage
  secondary?: PublishingFile[]
}
export interface TextPublicationOptions extends BasePublicationOptions {
  type: 'text'
  primary: PublishingText
  thumbnail?: PublishingImage
  secondary?: PublishingFile[]
}
export type PublicationOptions =
  | ImagePublicationOptions
  | AudioPublicationOptions
  | ModelPublicationOptions
  | VideoPublicationOptions
  | TextPublicationOptions

export const MimeTypes = {
  image: {
    'image/apng'   : 'image/apng',
    'image/avif'   : 'image/avif',
    'image/gif'    : 'image/gif',
    'image/jpeg'   : 'image/jpeg',
    'image/png'    : 'image/png',
    'image/svg+xml': 'image/svg+xml',
    'image/webp'   : 'image/webp'
  },
  audio: {
    'audio/aac' : 'audio/aac',
    'audio/flac': 'audio/flac',
    'audio/mpeg': 'audio/mpeg',
    'audio/wav' : 'audio/wav',
    'audio/ogg' : 'audio/ogg',
    'audio/webm': 'audio/webm'
  },
  model: {
    'model/gltf+json'  : 'model/gltf+json',
    'model/gltf+binary': 'model/gltf+binary'
  },
  video: {
    'video/3gpp'      : 'video/3gpp',
    'video/3gpp2'     : 'video/3gpp2',
    'video/mp4'       : 'video/mp4',
    'video/mpeg'      : 'video/mpeg',
    'video/ogg'       : 'video/ogg',
    'video/quicktime' : 'video/quicktime',
    'video/webm'      : 'video/webm',
    'video/x-f4v'     :  'video/x-f4v',
    'video/x-fli'     :  'video/x-fli',
    'video/x-flv'     :  'video/x-flv',
    'video/x-m4v'     :  'video/x-m4v',
    'video/x-matroska':  'video/x-matroska'
  },
  text: {
    'text/plain'     : 'text/plain',
    'text/css'       : 'text/css',
    'text/csv'       : 'text/csv',
    'text/html'      : 'text/html',
    'text/javascript': 'text/javascript'
  }
}

export type ImageMimeTypes = keyof typeof MimeTypes.image
export type AudioMimeTypes = keyof typeof MimeTypes.audio
export type ModelMimeTypes = keyof typeof MimeTypes.model
export type VideoMimeTypes = keyof typeof MimeTypes.video
export type TextMimeTypes = keyof typeof MimeTypes.text

export type SupportedMimeTypes =
  | ImageMimeTypes
  | AudioMimeTypes
  | ModelMimeTypes
  | VideoMimeTypes
  | TextMimeTypes

export interface PublicationResult {
  bundleTxId: string
  primaryAssetTxId: string
  primaryMetadataTxId: string
  tx: Transaction
}

export {
  default as ArtByCityPublications
} from './publications'
export {
  default as AuthenticatedArtByCityPublications
} from './authenticated-publications'
