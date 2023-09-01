import { ArtByCityEnvironment } from '../config'
import VerifiedCreators from './verified-creators.json'

export default class ArtByCityLegacy {
  constructor(private readonly environment: ArtByCityEnvironment) {}

  getVerifiedCreators(): string[] {
    return VerifiedCreators[this.environment]
  }
}
