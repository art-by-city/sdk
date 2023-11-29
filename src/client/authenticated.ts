import Arweave from 'arweave'
import { Warp } from 'warp-contracts'
import { ArweaveSigner } from 'warp-arbundles'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy'

import { JWKInterface } from '../util/types'
import { ArtByCityConfig } from '../config'
import { AuthenticatedArtByCityCurations } from '../curations'
import { AuthenticatedArFSClient } from '../arfs'
import { AuthenticatedArtByCityPublications } from '../publications'
import BaseArtByCityClient from './base'
import { AuthenticatedArtByCityFollowing } from '../following'
import { AuthenticatedArtByCityProfiles } from '../profiles'

export default class AuthenticatedArtByCityClient extends BaseArtByCityClient {
  declare public readonly curations: AuthenticatedArtByCityCurations
  declare public readonly arfs: AuthenticatedArFSClient
  declare public readonly publications: AuthenticatedArtByCityPublications
  declare public readonly following: AuthenticatedArtByCityFollowing
  declare public readonly profiles: AuthenticatedArtByCityProfiles

  declare public readonly signer: ArweaveSigner | InjectedArweaveSigner

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
        this.signer = new ArweaveSigner(jwk)
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
    this.arfs = new AuthenticatedArFSClient(
      this.arweave,
      this.signer
    )
    this.publications = new AuthenticatedArtByCityPublications(
      this.arweave,
      this.arfs,
      this.config,
      this.signer
    )
    this.following = new AuthenticatedArtByCityFollowing(
      this.arweave,
      this.warp,
      this.config,
      this.signer
    )
    this.profiles = new AuthenticatedArtByCityProfiles()
  }
}
