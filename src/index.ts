import Arweave from 'arweave'

import ArtByCityLegacy from './legacy'
import { ArtByCityConfig } from './config'

export * from './config'

export default class ArtByCity {
  public arweave!: Arweave
  public legacy!: ArtByCityLegacy
  public readonly config!: ArtByCityConfig

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
}
