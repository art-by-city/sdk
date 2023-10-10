import 'mocha'
import { expect } from 'chai'
import Arweave from 'arweave'
import { JWKInterface, LoggerFactory, WarpFactory } from 'warp-contracts'

import TestweaveJWK from '../../.secrets/testweave-keyfile.json'
import ArtByCity, { ArtByCityConfig } from '../../src'
import { CurationContractStates } from '../../src/curation'

LoggerFactory.INST.logLevel('error')
/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
const jwk: JWKInterface = TestweaveJWK as JWKInterface
const arweave = Arweave.init({
  protocol: 'http',
  host: 'localhost',
  port: 1984
})
const warp = WarpFactory.forLocal()

const config: Partial<ArtByCityConfig> = {
  environment: 'development',
  contracts: {
    usernames: '-0MjbNd0EwwmnNgHefa5axa0we64kNM3BOnXITcF7n0',
    curation: {
      ownable: '18WFZLc9rAfNpwWKKUNDycKaLXoknfjCUq42O6IK07Q',
      whitelist: 'N4JmgBHUu5ZHbcgaOUsKAydcVlQTSi5L7pwvq_NPZuA',
      collaborative: 'KNrobEq1MzK7121Tzd-J61trXcxKZujqPQ_B3ojZeb8',
      collaborativeWhitelist: '06Llbzymx4RI8Y0Ygen1grv4hM7MwjmmcCdCqeU9mAI'
    }
  }
}

let ownableCurationContractId: string = ''

describe('ArtByCity Curation Module', () => {
  context('Authenticated', () => {
    it('creates ownable curation contracts', async () => {
      const address = await arweave.wallets.jwkToAddress(jwk)
      const abc = new ArtByCity(arweave, config)
      const title = 'My Ownable Curation'
      const description = 'My Ownable Curation Description'

      const id = await abc
        .connect(jwk)
        .curations
        .create('ownable', {
          owner: address,
          title,
          description
        })

      const curation = warp.contract<CurationContractStates>(id)
      const { cachedValue: { state } } = await curation.readState()
      
      expect(id).to.be.a('string').with.length(43)
      expect(state.owner).to.be.a('string').that.equals(address)
      expect(state.title).to.be.a('string').that.equals(title)
      expect(state.metadata).to.have.property('description')
      expect(state.metadata.description)
        .to.be.a('string')
        .that.equals(description)
      expect(state.items).to.be.an('array').and.empty
      expect(state.hidden).to.be.an('array').and.empty

      // NB: set up for reading tests below
      ownableCurationContractId = id
    })

    it('creates whitelist curation contracts')
    it('creates collaborative curation contracts')
    it('creates collaborative whitelist curation contracts')
  })
  context('Unauthenticated', () => {
    it('fetches curation contracts by id', async () => {
      const address = await arweave.wallets.jwkToAddress(jwk)
      const abc = new ArtByCity(arweave, config)

      const curation = abc.curations.get(ownableCurationContractId)
      const { cachedValue: { state } } = await curation.readState()
      
      expect(state).to.be.an('object').with.property('owner')
      expect(state.owner).to.be.a('string').that.equals(address)
    })
  })
})
