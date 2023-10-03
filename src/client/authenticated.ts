import Arweave from 'arweave'

import { ArtByCityConfig } from '../config'
import ArtByCity from './client'

export type PublicationType = 'image' | 'audio'
export interface BasePublicationOptions {
  type: PublicationType
}
export interface ImagePublicationOptions extends BasePublicationOptions {
  type: 'image'
}
export interface AudioPublicationOptions extends BasePublicationOptions {
  type: 'audio'
}

export default class AuthenticatedArtByCityClient extends ArtByCity {
  constructor(
    public readonly arweave: Arweave,
    public readonly config: ArtByCityConfig
  ) {
    super(arweave, config)
  }

  async publish(what: 'image', opts: ImagePublicationOptions): Promise<string>
  async publish(what: 'audio', opts: AudioPublicationOptions): Promise<string>
  async publish(what: PublicationType): Promise<string> {
    throw new Error('not yet implemented!')
  }
}
