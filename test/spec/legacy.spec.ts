import 'mocha'
import { expect } from 'chai'

import ArtByCityLegacy from '../../src/legacy'
import VerifiedCreators from '../../src/legacy/verified-creators.json'

describe('ArtByCity Legacy Module', () => {
  it('Gets verified creator addresses for development', () => {
    const environment = 'development'
    const legacy = new ArtByCityLegacy(environment)

    expect(legacy.getVerifiedCreators()).to.equal(VerifiedCreators.development)
  })

  it('Gets verified creator addresses for staging', () => {
    const environment = 'staging'
    const legacy = new ArtByCityLegacy(environment)

    expect(legacy.getVerifiedCreators()).to.equal(VerifiedCreators.staging)
  })

  it('Gets verified creator addresses for production', () => {
    const environment = 'production'
    const legacy = new ArtByCityLegacy(environment)

    expect(legacy.getVerifiedCreators()).to.equal(VerifiedCreators.production)
  })
})
