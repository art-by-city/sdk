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
import { AuthenticatedArFSClient } from '../../src/arfs'
import { ArtByCityConfig } from '../../src'

const MOCK_ABC_CONFIG: ArtByCityConfig = {
  environment: 'development',
  contracts: {
    usernames: 'mock-usernames-contract-id',
    atomicLicense: 'mock-atomic-license-contract-id',
    curation: {
      ownable: 'mock-ownable-curation-contract-src-id',
      whitelist: 'mock-whitelist-curation-contract-src-id',
      collaborative: 'mock-collaborative-curation-contract-src-id',
      collaborativeWhitelist:
        'mock-collaborative-whitelist-curation-contract-src-id'
    }
  },
  cache: {
    type: 'memcache'
  }
}

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
    it.skip('publishes images', async () => {
      const publisher = new AuthenticatedArtByCityPublications(
        MOCK_ABC_CONFIG,
        arweaveMock,
        new AuthenticatedArFSClient(arweaveMock, arweaveSignerMock),
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
      const {
        bundleTxId,
        primaryAssetTxId,
        primaryMetadataTxId
      } = await publisher.publish(opts)

      expect(bundleTxId).to.be.a('string')
      expect(primaryAssetTxId).to.be.a('string')
      expect(primaryMetadataTxId).to.be.a('string')
    })
  })
})
