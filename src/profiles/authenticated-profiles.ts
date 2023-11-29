import { ArtByCityProfiles, ProfileUpdateOptions } from './'

export default class AuthenticatedArtByCityProfiles extends ArtByCityProfiles {
  constructor() {
    super()
  }

  async update(opts: ProfileUpdateOptions): Promise<string> {
    throw new Error('not yet implemented!')
  }
}
