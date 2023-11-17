/* eslint-disable */
import('mocha') // NB: this style import makes both webpack and typescript happy
import { expect } from 'chai'
import Arweave from 'arweave'
import { JWKInterface } from 'warp-contracts'

import TestweaveJWK from '../testweave-keyfile.json'
import ArtByCity, { ArtByCityConfig } from '../../dist/web'

/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
const jwk: JWKInterface = TestweaveJWK

const arweave = Arweave.init({
  protocol: 'http',
  host: 'localhost',
  port: 1984
})
const config: Partial<ArtByCityConfig> = {
  environment: 'development',
  contracts: {
    usernames: '-0MjbNd0EwwmnNgHefa5axa0we64kNM3BOnXITcF7n0',
    atomicLicense: '8i_mVmJ9RPvG9KnMEBJimgD_l_I2BEkYja67vRZBWNo',
    curation: {
      ownable: '18WFZLc9rAfNpwWKKUNDycKaLXoknfjCUq42O6IK07Q',
      whitelist: 'N4JmgBHUu5ZHbcgaOUsKAydcVlQTSi5L7pwvq_NPZuA',
      collaborative: 'KNrobEq1MzK7121Tzd-J61trXcxKZujqPQ_B3ojZeb8',
      collaborativeWhitelist: '06Llbzymx4RI8Y0Ygen1grv4hM7MwjmmcCdCqeU9mAI'
    },
    following: 'ed6xnpsezIXbOg5XpO5DrsvQbxdXgUzWb-hzzMJ6zp0'
  }
}

describe('Following Module', () => {
  context('Authencitated', () => {
    it('creates following contract for signer', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)

      const followingId = await abc.connect(jwk).following.create()

      console.log('followingId', followingId)

      expect(followingId).to.be.a('string')
    })
    // it('gets or creates following contract for signer', async function () {
    //   this.timeout(0)
    //   const abc = new ArtByCity(arweave, config)

    //   const followingId = await abc.connect(jwk).following.getOrCreate()
    // })

    it('follows addresses')

    it('unfollows addresses')
  })

  context('Unauthenticated', () => {
    it.only('gets following contract by address', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const address = 'MlV6DeOtRmakDOf6vgOBlif795tcWimgyPsYYNQ8q1Y'

      const followingContract = await abc.following.getContract(address)

      expect(followingContract).to.exist
    })
  })  
})
