import { expect } from 'chai'
import Arweave from 'arweave'

import ArtByCity from '../../dist/web'
import VerifiedCreators from '../../dist/web/legacy/verified-creators.json'

describe('ArtByCity (Web)', () => {
  it('Constructs with default Arweave instance', () => {
    const abc = new ArtByCity()

    expect(abc.arweave).to.be.an.instanceOf(Arweave)
  })

  it('Constructs given an Arweave instance', () => {
    const arweave = Arweave.init({})
    const abc = new ArtByCity(arweave)

    expect(abc.arweave).to.equal(arweave)
  })

  describe('Legacy Module', () => {
    it('Gets verified creator addresses', () => {
      const abc = new ArtByCity()

      expect(abc.legacy.getVerifiedCreators())
        .to
        .equal(VerifiedCreators.production)
    })
  })
})
