import 'mocha'
import { expect } from 'chai'
import Arweave from 'arweave'

import ArtByCityPublish from '../../src/publish'

describe('ArtByCity Publish Module', () => {
  context('Images', () => {
    it('publishes images', () => {
      const arweave = Arweave.init({})
      const publisher = new ArtByCityPublish(arweave)
    })
  })
})
