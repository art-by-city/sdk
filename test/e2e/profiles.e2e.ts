/* eslint-disable */
import('mocha') // NB: this style import makes both webpack and typescript happy
import { expect } from 'chai'

import ArtByCity from '../../dist/web'
import { arweave, config, testweave } from './setup'

describe('Profiles Module', () => {
  context('Authenticated', () => {
    it.only('updates profile for signer', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)

      const profileId = await abc
        .connect(testweave)
        .profiles
        .update({
          // TODO -> arweave-account & arprofile spec
        })

      expect(profileId).to.be.a('string')

      // TODO -> fetch and check it
    })

    it('updates art by city username on profile update', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)

      const profileId = await abc
        .connect(testweave)
        .profiles
        .update({
          // TODO -> include art by city username
        })

      expect(profileId).to.be.a('string')

      // TODO -> check art by city username was updated
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
