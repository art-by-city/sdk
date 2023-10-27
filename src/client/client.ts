import { JWKInterface } from '../util/types'
import AuthenticatedArtByCityClient from './authenticated'
import BaseArtByCityClient from './base'

export default class ArtByCity extends BaseArtByCityClient {
  connect(wallet?: JWKInterface): AuthenticatedArtByCityClient {
    return new AuthenticatedArtByCityClient(
      this.arweave,
      this.warp,
      this.config,
      wallet
    )
  }
}
