import 'mocha'
import { expect } from 'chai'
import Arweave from 'arweave'
import { ArweaveSigner } from 'warp-arbundles'
import {
  InjectedArweaveSigner
} from 'warp-contracts-plugin-deploy'

import TestweaveJWK from '../testweave-keyfile.json'
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

    expect(abcNoConfig.config.environment).to.equal('production')
    expect(abcWithConfig.config.environment).to.equal('production')
  })

  it('Constructs with optional environment config', () => {
    const environment: ArtByCityEnvironment = 'development'
    const arweave = Arweave.init({})
    const abc = new ArtByCity(arweave, { environment })

    expect(abc.config.environment).to.equal(environment)
  })

  it('Initializes Legacy module', () => {
    const abc = new ArtByCity()

    expect(abc.legacy).to.be.an.instanceof(ArtByCityLegacy)
  })

  context('Allows creating an authenticated client', () => {
    it('from a wallet provider (web)', () => {
      global.window = { arweaveWallet: {} } as (Window & typeof globalThis)

      const abc = new ArtByCity().connect()

      expect(abc.signer).to.to.be.an.instanceOf(InjectedArweaveSigner)

      // @ts-expect-error un-setting mock
      global.window = undefined
    })

    it('from a wallet keyfile', () => {
      const abc = new ArtByCity().connect(TestweaveJWK)

      expect(abc.signer).to.to.be.an.instanceOf(ArweaveSigner)
    })

    it('but throws when wallet provider unavailable', () => {
      const abc = new ArtByCity()

      expect(() => abc.connect()).to.throw(Error)
    })
  })
})
