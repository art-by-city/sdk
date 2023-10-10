import { JWKInterface } from '../util/types'
import AuthenticatedArtByCityClient from './authenticated'
import BaseArtByCityClient from './base'

export default class ArtByCity extends BaseArtByCityClient {
  connect(jwk?: JWKInterface): AuthenticatedArtByCityClient {
    let wallet: JWKInterface | 'use_wallet'

    if (!jwk) {
      if (!window || !window.arweaveWallet) {
        throw new Error(
          'Calling connect() with no keyfile is only available in the browser'
        )
      }

      wallet = 'use_wallet'
    } else {
      wallet = jwk
    }

    return new AuthenticatedArtByCityClient(
      this.arweave,
      this.warp,
      this.config,
      wallet
    )
  }
}
