import Arweave from 'arweave'

import { ArtByCityEnvironment } from '../config'
import VerifiedCreators from './verified-creators.json'
import LegacyTransactions from './transactions'

export default class ArtByCityLegacy {
  private readonly transactions!: LegacyTransactions

  constructor(
    private readonly arweave: Arweave,
    private readonly environment: ArtByCityEnvironment
  ) {}

  get verifiedCreators(): string[] {
    return VerifiedCreators[this.environment]
  }

  async feed() {
    
  }
}
