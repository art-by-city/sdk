import Arweave from 'arweave'

import ArtByCityLegacy from './legacy'
import { ArtByCityConfig, ArtByCityEnvironment } from './config'

export * from './config'

export default class ArtByCity {
  public arweave!: Arweave
  public legacy!: ArtByCityLegacy
  public readonly environment!: ArtByCityEnvironment

  constructor(arweave?: Arweave, config?: ArtByCityConfig) {
    this.arweave = arweave || Arweave.init({})
    this.environment = config?.environment || 'production'
    this.legacy = new ArtByCityLegacy(this.arweave, this.environment)
  }
}
