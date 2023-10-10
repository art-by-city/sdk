import Arweave from 'arweave'

import { JWKInterface } from '../util/types'
import { ArtByCityConfig } from '../config'
import { AuthenticatedArtByCityCurations } from '../curation'
import BaseArtByCityClient from './base'
import { Warp } from 'warp-contracts'

export default class AuthenticatedArtByCityClient extends BaseArtByCityClient {
  declare public readonly curations: AuthenticatedArtByCityCurations

  constructor(
    public readonly arweave: Arweave,
    public readonly warp: Warp,
    public readonly config: ArtByCityConfig,
    public readonly wallet: JWKInterface | 'use_wallet'
  ) {
    super(arweave, config)
    this.curations = new AuthenticatedArtByCityCurations(
      this.arweave,
      this.warp,
      this.config,
      this.wallet
    )
  }
}
