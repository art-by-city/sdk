import 'mocha'
import { expect } from 'chai'
import Arweave from 'arweave'

import ArtByCity from '../../src/index'

describe('ArtByCity', () => {
  it('Constructs with default Arweave instance', () => {
    const abc = new ArtByCity()

    expect(abc.arweave).to.be.an.instanceOf(Arweave)
  })

  it('Constructs given an Arweave instance', () => {
    const arweave = Arweave.init({})
    const abc = new ArtByCity(arweave)

    expect(abc.arweave).to.equal(arweave)
  })
})
