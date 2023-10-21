import Arweave from 'arweave'
import { Warp, } from 'warp-contracts'
import { ArweaveSigner } from 'warp-arbundles'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy'

import { JWKInterface } from '../util/types'
import { ArtByCityConfig } from '../config'
import { AuthenticatedArtByCityCurations } from '../curation'
import BaseArtByCityClient from './base'

export default class AuthenticatedArtByCityClient extends BaseArtByCityClient {
  declare public readonly curations: AuthenticatedArtByCityCurations
  declare public readonly signer:
    | ArweaveSigner
    | InjectedArweaveSigner
    | JWKInterface

  constructor(
    public readonly arweave: Arweave,
    public readonly warp: Warp,
    public readonly config: ArtByCityConfig,
    jwk?: JWKInterface
  ) {
    super(arweave, config)

    if (typeof window !== 'undefined') {
      if (!jwk) {
        if (typeof window.arweaveWallet === 'undefined') {
          throw new Error(
            'an arconnect wallet is required for connect() in browser env'
          )
        }
        this.signer = new InjectedArweaveSigner(window.arweaveWallet)
      } else {
        this.signer = jwk
      }
    } else {
      if (!jwk) { throw new Error('jwk required for connect() in node env') }
      this.signer = new ArweaveSigner(jwk)
    }

    this.curations = new AuthenticatedArtByCityCurations(
      this.arweave,
      this.warp,
      this.config,
      this.signer
    )
  }
}
