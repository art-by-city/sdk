import Arweave from 'arweave'

import ArtByCityLegacy from '../legacy'
import { ArtByCityConfig } from '../config'
import { JWKInterface } from '../util/types'

export default class ArtByCity {
  public arweave!: Arweave
  public legacy!: ArtByCityLegacy
  public readonly config!: ArtByCityConfig
  public wallet: JWKInterface | 'use_wallet' | null = null

  constructor(arweave?: Arweave, config?: Partial<ArtByCityConfig>) {
    this.arweave = arweave || Arweave.init({})

    const environment = config?.environment || 'production'
    const usernamesContractId = config?.usernamesContractId
      ? config.usernamesContractId
      : environment === 'production'
        ? 'BaAP2wyqSiF7Eqw3vcBvVss3C0H8i1NGQFgMY6nGpnk'
        : 'UHPC-7wenVg-JyS81EXKCnLlKvjSbfrIsnWt1F8hueg'

    this.config = {
      environment,
      usernamesContractId,
      cache: {
        type: config?.cache?.type === 'disabled' ? 'disabled' : 'memcache'
      }
    }
    
    this.legacy = new ArtByCityLegacy(this.arweave, this.config)
  }

  async connect(jwk?: JWKInterface): Promise<ArtByCity> {
    if (!jwk) {
      if (!window || !window.arweaveWallet) {
        throw new Error(
          'Calling connect() with no keyfile is only available in the browser'
        )
      }

      this.wallet = 'use_wallet'
    } else {
      this.wallet = jwk
    }

    return this
  }
}