import 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import Arweave from 'arweave'
import { ArweaveSigner } from 'warp-arbundles'

import TestweaveJWK from '../testweave-keyfile.json'
import {
  AuthenticatedArtByCityPublications,
  ImagePublicationOptions,
  PublicationImageWithThumbnails
} from '../../src/publications'

const arweaveMock = sinon.createStubInstance(Arweave)
const arweaveSignerMock = sinon.createStubInstance(ArweaveSigner)
arweaveSignerMock.pk = TestweaveJWK.n

describe('Publications Module', () => {
  beforeEach(() => {
    
  })

  afterEach(() => {
    sinon.reset()
  })

  context('Images', () => {
    it('publishes images', async () => {
      const publisher = new AuthenticatedArtByCityPublications(
        arweaveSignerMock
      )

      const image: PublicationImageWithThumbnails = {
        original: {
          type: 'image/png',
          data: 'mock-original-image-data',
          size: 24,
          name: 'my-original-image.png'
        },
        small: {
          type: 'image/jpeg',
          data: 'mock-small-preview-data',
          size: 23,
          name: 'my-original-image-small.jpeg'
        },
        large: {
          type: 'image/jpeg',
          data: 'mock-large-preview-data',
          size: 23,
          name: 'my-original-image-large.jpeg'
        }
      }
      const opts: ImagePublicationOptions = {
        type: 'image',
        title: 'My Image Publication',
        images: [ image ]
      }
      const publicationId = await publisher.publish(opts)

      expect(publicationId).to.be.a('string').with.length(43)
    })
  })
})
