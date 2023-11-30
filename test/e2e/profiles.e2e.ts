/* eslint-disable */
import('mocha') // NB: this style import makes both webpack and typescript happy
import { expect } from 'chai'
import axios from 'axios'

import ArtByCity from '../../dist/web'
import {
  arweave,
  config,
  testweave,
  mine,
  gatewayRoot
} from './setup'
import { ArweaveAccount, ProfileUpdateOptions } from '../../dist/web/profiles'
import { getAddressFromSigner } from '../../dist/web/util/crypto'

describe('Profiles Module', () => {
  context('Authenticated', () => {
    it.only('updates profile for signer', async function () {
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
      const username = 'testweave' + Math.random().toString()
      const address = await getAddressFromSigner(testweave)

      const txid = await abc
        .connect(testweave)
        .profiles
        .update({ username, handle: username })

      expect(txid).to.be.a('string')

      await mine()
  
      const resolved = await abc.usernames.resolve(address)

      expect(resolved.username).to.equal(username)
      expect(resolved.address).to.equal(address)
    })
  })

  context('Unauthenticated', () => {
    it('returns null if no profile', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const address = 'TODO -> address without profile (fresh)'

      const profile = await abc.profiles.get(address)

      expect(profile).to.be.null
    })

    it('gets profile by address', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const address = 'TODO -> address with profile'

      const profile = await abc.profiles.getByAddress(address)

      expect(profile).to.not.be.null.and.not.empty
    })

    it('gets profile art by city username', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const username = 'TODO -> username with profile'

      const profile = await abc.profiles.getByUsername(username)

      expect(profile).to.not.be.null.and.not.empty
    })

    it('gets profile by art by city username or address', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const usernameOrAddress = 'TODO -> username or address with profile'

      const profile = await abc.profiles.getByUsername(usernameOrAddress)

      expect(profile).to.not.be.null.and.not.empty
    })
  })
})
