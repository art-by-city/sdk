import 'mocha'
import { expect } from 'chai'
import Arweave from 'arweave'

import ArtByCity, { ArtByCityEnvironment } from '../../src'
import ArtByCityLegacy from '../../src/legacy'

describe('ArtByCity SDK', () => {
  it('Constructs with default Arweave instance', () => {
    const abc = new ArtByCity()

    expect(abc.arweave).to.be.an.instanceOf(Arweave)
  })

  it('Constructs given an Arweave instance', () => {
    const arweave = Arweave.init({})
    const abc = new ArtByCity(arweave)

    expect(abc.arweave).to.equal(arweave)
  })

  it('Constructs with default environment of production', () => {
    const arweave = Arweave.init({})
    const abcNoConfig = new ArtByCity()
    const abcWithConfig = new ArtByCity(arweave)

    expect(abcNoConfig.environment).to.equal('production')
    expect(abcWithConfig.environment).to.equal('production')
  })

  it('Constructs with optional environment config', () => {
    const environment: ArtByCityEnvironment = 'development'
    const arweave = Arweave.init({})
    const abc = new ArtByCity(arweave, { environment })

    expect(abc.environment).to.equal(environment)
  })

  it('Initializes Legacy module', () => {
    const abc = new ArtByCity()

    expect(abc.legacy).to.be.an.instanceof(ArtByCityLegacy)
  })
})
