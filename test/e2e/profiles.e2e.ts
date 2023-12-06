/* eslint-disable */
import('mocha') // NB: this style import makes both webpack and typescript happy
import { expect } from 'chai'
import axios from 'axios'
import Arweave from 'arweave'

import ArtByCity from '../../dist/web'
import {
  arweave,
  config,
  testweave,
  mine,
  gatewayRoot
} from './setup'
import { ProfileUpdateOptions } from '../../dist/web/profiles'
import { getAddressFromSigner } from '../../dist/web/util/crypto'

describe('Profiles Module', () => {
  context('Authenticated', () => {
    it('updates profile for signer', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const handle = 'testweave'
      const bio = Math.random().toString()

      const txid = await abc
        .connect(testweave)
        .profiles
        .update({ handle, bio })

      expect(txid).to.be.a('string')

      await mine()

      const {
        data
      } = await axios.get<ProfileUpdateOptions>(`${gatewayRoot()}/${txid}`)

      expect(data.handle).to.equal(handle)
      expect(data.bio).to.equal(bio)
    })

    it('updates art by city username on profile update', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const username = 'testweave' + Math.random().toString().substring(2)
      console.log('test random username', username)
      // const address = await getAddressFromSigner(testweave)

      const txid = await abc
        .connect(testweave)
        .profiles
        .update({ username, handle: username })

      expect(txid).to.be.a('string')

      // await mine()
      // await mine()
  
      // const {
      //   cachedValue: { state }
      // } = await abc.usernames.contract.readState()
      // console.log('usernames state', state)

      // const resolved = await abc.usernames.resolve(address)

      // expect(resolved.username).to.equal(username)
      // expect(resolved.address).to.equal(address)

      // // NB: Reset test username
      // await abc
      //   .connect(testweave)
      //   .profiles
      //   .update({ username, handle: 'testweave' })
    })
  })

  context('Unauthenticated', () => {
    it('returns null if no profile', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const jwk = await Arweave.crypto.generateJWK()
      const address = await getAddressFromSigner(jwk)

      const profile = await abc.profiles.get(address)

      expect(profile).to.be.null
    })

    it('gets profile by address', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const address = await getAddressFromSigner(testweave)

      const profile = await abc.profiles.getByAddress(address)

      expect(profile).to.not.be.null.and.not.empty
    })

    it('gets profile art by city username', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const username = 'jim' // TODO -> local profile

      const profile = await abc.profiles.getByUsername(username)

      expect(profile).to.not.be.null
    })

    it('gets profile by art by city username or address', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const username = 'TODO -> username or address with profile'
      const address = 'TODO -> address matching username'

      const profileFromUsername = await abc.profiles.get(username)
      const profileFromAddress = await abc.profiles.get(address)

      expect(profileFromUsername).to.not.be.null.and.not.empty
      expect(profileFromUsername).to.deep.equal(profileFromAddress)
    })
  })
})
