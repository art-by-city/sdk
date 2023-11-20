/* eslint-disable */
import('mocha') // NB: this style import makes both webpack and typescript happy
import { expect } from 'chai'
import Arweave from 'arweave'
import { JWKInterface } from 'warp-contracts'
import axios from 'axios'
import ArLocal from 'arlocal'

import { getAddressFromSigner } from '../../dist/web/util/crypto'
import TestweaveJWK from '../testweave-keyfile.json'
import ArtByCity, { ArtByCityConfig } from '../../dist/web'

/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
const testweave: JWKInterface = TestweaveJWK
const artbycity = 'Uy2XZ7P7F4zBllF5uPdd1ih9jiQrIGvD3X8L13cc5_s'
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
// const arweave = Arweave.init({
//   protocol: 'https',
//   host: 'arweave.net',
//   port: 443
// })
// const config: Partial<ArtByCityConfig> = { environment: 'production' }

describe('Following Module', () => {
  context('Authenticated', () => {
    it('creates following contract for signer', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)

      const followingId = await abc.connect(testweave).following.create()

      console.log('followingId', followingId)

      expect(followingId).to.be.a('string')
    })

    it.only('gets or creates following contract for signer', async function () {
      this.timeout(0)
      const jwk = await Arweave.crypto.generateJWK()
      const address = await getAddressFromSigner(jwk)
      await axios.get(
        `http://localhost:1984/mint/${address}/9999999999999999999999`
      )
      await axios.get('http://localhost:1984/mine')

      const abc = new ArtByCity(arweave, config)

      const followingId = await abc
        .connect(jwk)
        .following
        .getOrCreate()

      console.log('followingId', followingId)
      expect(followingId).to.be.a('string')

      await axios.get('http://localhost:1984/mine')

      const secondFollowingId = await abc.connect(jwk).following.getOrCreate()

      console.log('secondFollowingId', secondFollowingId)
      expect(secondFollowingId).to.equal(followingId)
    })

    it('follows addresses', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)

      const res = await abc.connect(testweave).following.follow(artbycity)

      const interactionId = await res.interactionTx.id
      console.log('follow result interactionTx.id', interactionId)
      console.log('follow result originalTxId', res.originalTxId)

      expect(res.interactionTx).to.exist
      expect(res.originalTxId).to.be.a('string')
    })

    it('unfollows addresses', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)

      const res = await abc.connect(testweave).following.unfollow(artbycity)

      const interactionId = await res.interactionTx.id
      console.log('follow result interactionTx.id', interactionId)
      console.log('follow result originalTxId', res.originalTxId)

      expect(res.interactionTx).to.exist
      expect(res.originalTxId).to.be.a('string')
    })
  })

  context('Unauthenticated', () => {
    it('gets following contract by address', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const address = 'MlV6DeOtRmakDOf6vgOBlif795tcWimgyPsYYNQ8q1Y'

      const followingContract = await abc.following.getContract(address)

      console.log('followingId', followingContract?.txId())

      expect(followingContract).to.exist
    })

    it('gets followed addresses', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const owner = 'MlV6DeOtRmakDOf6vgOBlif795tcWimgyPsYYNQ8q1Y'

      const following = await abc.following.following(owner)

      console.log('following', following)

      expect(following).to.be.an('array')
    })
  })
})
