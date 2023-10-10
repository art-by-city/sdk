import 'mocha'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Arweave from 'arweave'

import ArtByCity, { ArtByCityEnvironment } from '../../src'
import ArtByCityLegacy from '../../src/legacy'
import { JWKInterface } from '../../src/util/types'

chai.use(chaiAsPromised)

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

      expect(abc.wallet).to.equal('use_wallet')

      // @ts-expect-error un-setting mock
      global.window = undefined
    })

    it('from a wallet keyfile', () => {
      const jwk = { mock: 'keyfile' } as unknown as JWKInterface
      const abc = new ArtByCity().connect(jwk)

      expect(abc.wallet).to.equal(jwk)
    })

    it('but throws when wallet provider unavailable', async () => {
      const abc = new ArtByCity()

      return expect(abc.connect()).to.be.rejectedWith(Error)
    })
  })

  // context.only('Authenticated Client', () => {
  //   context.only('Publishing')
  // })
})
