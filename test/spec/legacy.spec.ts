import 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import Arweave from 'arweave'
import { Warp } from 'warp-contracts'
import Api from 'arweave/node/lib/api'

import ArtByCityLegacy from '../../src/legacy'
import { ArtByCityConfig } from '../../src'
import VerifiedCreators from '../../src/legacy/verified-creators.json'

const MOCK_ABC_CONFIG: ArtByCityConfig = {
  environment: 'development',
  contracts: {
    usernames: 'mock-usernames-contract-id',
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
const warpMock = sinon.createStubInstance(Warp)
const localApiConfig = {
  protocol: 'http',
  host: 'localhost',
  port: 1984
}

describe('ArtByCity Legacy Module', () => {
  beforeEach(() => {
    arweaveMock.api = {
      getConfig: sinon.stub().returns(localApiConfig) as unknown
    } as Api
  })

  afterEach(() => {
    sinon.reset()
  })

  context('Verified Creators', () => {
    it('Gets addresses for development', () => {
      const environment = 'development'
      const legacy = new ArtByCityLegacy(
        arweaveMock,
        warpMock,
        { ...MOCK_ABC_CONFIG, environment }
      )
  
      expect(legacy.verifiedCreators).to.equal(VerifiedCreators.development)
    })
  
    it('Gets addresses for staging', () => {
      const environment = 'staging'
      const legacy = new ArtByCityLegacy(
        arweaveMock,
        warpMock,
        { ...MOCK_ABC_CONFIG, environment }
      )
  
      expect(legacy.verifiedCreators).to.equal(VerifiedCreators.staging)
    })
  
    it('Gets addresses for production', () => {
      const environment = 'production'
      const legacy = new ArtByCityLegacy(
        arweaveMock,
        warpMock,
        { ...MOCK_ABC_CONFIG, environment }
      )
  
      expect(legacy.verifiedCreators).to.equal(VerifiedCreators.production)
    })
  })

  context.only('Fetching Publications', () => {
    it('Populates manifest .image with first from .images', async () => {
      const legacy = new ArtByCityLegacy(
        arweaveMock,
        warpMock,
        MOCK_ABC_CONFIG
      )
      const manifestId = 'mock-manifest-id'
      const image = {
        image: 'mock-image-id',
        preview: 'mock-preview-id',
        preview4k: 'mock-preview4k-id',
        animated: false
      }

      /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */
      sinon.stub(legacy.transactions, 'fetchData').resolves({
        ok: true,
        data: {
          images: [image]
        },
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      } as any)

      const manifest = await legacy.fetchPublication(manifestId)

      expect(manifest.image).to.deep.equal(image)
    })
  })
})
