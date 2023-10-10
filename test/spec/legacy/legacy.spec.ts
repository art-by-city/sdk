import 'mocha'
import { expect } from 'chai'
import Arweave from 'arweave'

import ArtByCityLegacy from '../../../src/legacy'
import VerifiedCreators from '../../../src/legacy/verified-creators.json'

describe('ArtByCity Legacy Module', () => {
  describe('Verified Creators', () => {
    // it('Gets addresses for development', () => {
    //   const arweave = Arweave.init({})
    //   const environment = 'development'
    //   const legacy = new ArtByCityLegacy(arweave, {
    //     environment,
    //     cache: { type: 'memcache' },
    //     usernamesContractId: 'TODO'
    //   })
  
    //   expect(legacy.verifiedCreators).to.equal(VerifiedCreators.development)
    // })
  
    // it('Gets addresses for staging', () => {
    //   const arweave = Arweave.init({})
    //   const environment = 'staging'
    //   const legacy = new ArtByCityLegacy(arweave, {
    //     environment,
    //     cache: { type: 'memcache' },
    //     usernamesContractId: 'TODO'
    //   })
  
    //   expect(legacy.verifiedCreators).to.equal(VerifiedCreators.staging)
    // })
  
    // it('Gets addresses for production', () => {
    //   const arweave = Arweave.init({})
    //   const environment = 'production'
    //   const legacy = new ArtByCityLegacy(arweave, {
    //     environment,
    //     cache: { type: 'memcache' },
    //     usernamesContractId: 'TODO'
    //   })
  
    //   expect(legacy.verifiedCreators).to.equal(VerifiedCreators.production)
    // })
  })
})