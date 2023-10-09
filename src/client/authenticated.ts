import Arweave from 'arweave'

import { JWKInterface } from '../util/types'
import { ArtByCityConfig } from '../config'
import BaseArtByCityClient from './base'

export default class AuthenticatedArtByCityClient extends BaseArtByCityClient {
  constructor(
    public readonly arweave: Arweave,
    public readonly config: ArtByCityConfig,
    public wallet: JWKInterface | 'use_wallet'
  ) {
    super(arweave, config)
  }

  // private async publishImage(opts: ImagePublicationOptions): Promise<string> {}
}
