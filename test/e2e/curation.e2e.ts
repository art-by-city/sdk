/* eslint-disable */
import('mocha') // NB: this style import makes both webpack and typescript happy
import { expect } from 'chai'
import Arweave from 'arweave'
import { JWKInterface, LoggerFactory, WarpFactory } from 'warp-contracts'

import TestweaveJWK from '../testweave-keyfile.json'
import ArtByCity, { ArtByCityConfig } from '../../src'

LoggerFactory.INST.logLevel('error')
/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
const jwk: JWKInterface = TestweaveJWK as JWKInterface
// const arweave = Arweave.init({
//   protocol: 'http',
//   host: 'localhost',
//   port: 1984
// })
// const warp = WarpFactory.forLocal()
// const config: Partial<ArtByCityConfig> = {
//   environment: 'development',
//   contracts: {
//     usernames: '-0MjbNd0EwwmnNgHefa5axa0we64kNM3BOnXITcF7n0',
//     curation: {
//       ownable: '18WFZLc9rAfNpwWKKUNDycKaLXoknfjCUq42O6IK07Q',
//       whitelist: 'N4JmgBHUu5ZHbcgaOUsKAydcVlQTSi5L7pwvq_NPZuA',
//       collaborative: 'KNrobEq1MzK7121Tzd-J61trXcxKZujqPQ_B3ojZeb8',
//       collaborativeWhitelist: '06Llbzymx4RI8Y0Ygen1grv4hM7MwjmmcCdCqeU9mAI'
//     }
//   }
// }
const arweave = Arweave.init({
  protocol: 'https',
  host: 'arweave.net',
  port: 443
})
const warp = WarpFactory.forMainnet({
  inMemory: true,
  dbLocation: '.art-by-city'
})
const config: Partial<ArtByCityConfig> = { environment: 'production' }

let ownableCurationContractId: string = ''

describe('Curation Module', () => {
  context('Authenticated', () => {
    it.skip('creates curation contracts with jwk', async function () {
      this.timeout(0)
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
      expect(id).to.be.a('string').with.length(43)

      // NB: set up for reading tests below
      ownableCurationContractId = id

      return
    })

    it.skip('creates curation contracts with injected signer', async function () {
      this.timeout(0)
      if (!window || !window.arweaveWallet) { return }
      await window.arweaveWallet.connect(
        ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'ACCESS_PUBLIC_KEY', 'SIGNATURE']
      )
      const address = await arweave.wallets.jwkToAddress(jwk)
      const abc = new ArtByCity(arweave, config)
      const title = 'My Ownable Curation'
      const description = 'My Ownable Curation Description'

      const id = await abc
        .connect()
        .curations
        .create('ownable', {
          owner: address,
          title,
          description
        })
      expect(id).to.be.a('string').with.length(43)

      // NB: set up for reading tests below
      ownableCurationContractId = id

      return
    })
  })
  context('Unauthenticated', () => {
    it.skip('fetches curation contracts by id', async () => {
      const address = await arweave.wallets.jwkToAddress(jwk)
      const abc = new ArtByCity(arweave, config)

      const curation = abc.curations.get(ownableCurationContractId)
      const { cachedValue: { state } } = await curation.contract.readState()
      
      expect(state).to.be.an('object').with.property('owner')
      expect(state.owner).to.be.a('string').that.equals(address)
    })

    it.skip('queries curations by creator', async () => {
      const address = await arweave.wallets.jwkToAddress(jwk)
      const abc = new ArtByCity(arweave, config)

      const { curations } = await abc.curations.createdBy(address)

      expect(curations).to.be.an('array').that.is.not.empty
    })

    it.only('fetches curation transaction by id', async () => {
      const abc = new ArtByCity(arweave, config)

      const tx = await abc.curations.getTransaction('eES4WS8QtO2mMprsEajd2q9eTsV_cRTh6wrjkVh5cIY')

      expect(tx).to.not.be.null
    })
  })
})
