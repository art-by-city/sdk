import Arweave from 'arweave'
import { Warp, WarpFactory } from 'warp-contracts'
import { ArweaveSigner } from 'warp-arbundles'
import {
  DeployPlugin,
  InjectedArweaveSigner
} from 'warp-contracts-plugin-deploy'

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

    let disableWarpBundling = false
    if (typeof window !== 'undefined') {
      if (!jwk) {
        if (typeof window.arweaveWallet === 'undefined') {
          throw new Error(
            'an arconnect wallet is required for connect() in browser env'
          )
        }
        this.signer = new InjectedArweaveSigner(window.arweaveWallet)
        console.log('AUTH CREATED NODE ARWEAVESIGNER')
      } else {
        this.signer = jwk
        disableWarpBundling = true
        console.log('AUTH USING JWK', jwk)
      }
    } else {
      if (!jwk) { throw new Error('jwk required for connect() in node env') }
      this.signer = new ArweaveSigner(jwk)
      console.log('AUTH CREATED NODE ARWEAVESIGNER')
    }

    this.curations = new AuthenticatedArtByCityCurations(
      this.arweave,
      disableWarpBundling
        ? WarpFactory.forMainnet({
            inMemory: true,
            dbLocation: '.art-by-city'
          }, true).use(new DeployPlugin())
        : this.warp,
      this.config,
      this.signer
    )
  }
}
