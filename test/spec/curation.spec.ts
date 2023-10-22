import 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import Arweave from 'arweave'
import { Warp } from 'warp-contracts'
import { ArweaveSigner } from 'warp-arbundles'

import { AuthenticatedArtByCityCurations } from '../../src/curations'
import { ArtByCityConfig } from '../../src'

const MOCK_OWNER = '0x-mock-owner'
const MOCK_CONTRACT_TX_ID = 'mock-contract-tx-id'
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

const signerMock = sinon.createStubInstance(ArweaveSigner)
const arweaveMock = sinon.createStubInstance(Arweave)
const warpMock = sinon.createStubInstance(Warp)
let authenticatedCurations: AuthenticatedArtByCityCurations

describe('Curation Module', () => {
  beforeEach(() => {
    authenticatedCurations = new AuthenticatedArtByCityCurations(
      arweaveMock,
      warpMock,
      MOCK_ABC_CONFIG,
      signerMock
    )
    warpMock.deployFromSourceTx.resolves({
      contractTxId: MOCK_CONTRACT_TX_ID
    })
  })

  afterEach(() => {
    sinon.reset()
  })

  context('Unauthenticated Curation Module', () => {
    it('constructs')
    it('gets curation by id')
    it('queries curations by creator')
  })

  context('Authenticated Curation Module', () => {
    it('creates ownable curations', async () => {
      const curationId = await authenticatedCurations.create('ownable', {
        owner: MOCK_OWNER,
        title: 'My Ownable Curation'
      })

      expect(curationId).to.equal(MOCK_CONTRACT_TX_ID)
      expect(warpMock.deployFromSourceTx.calledOnce).to.be.true
      const contractData = warpMock.deployFromSourceTx.firstCall.args[0]
      expect(contractData.srcTxId).to.equal(
        MOCK_ABC_CONFIG.contracts.curation.ownable
      )
      expect(
        contractData.tags?.some(tag => {
          return tag.get('name') === 'Contract-Name'
            && tag.get('value') === 'Ownable-Curation-Contract'
        })
      ).to.be.true
    })

    it('creates whitelist curations', async () => {
      const curationId = await authenticatedCurations.create('whitelist', {
        owner: MOCK_OWNER,
        title: 'My Whitelist Curation'
      })

      expect(curationId).to.equal(MOCK_CONTRACT_TX_ID)
      expect(warpMock.deployFromSourceTx.calledOnce).to.be.true
      const contractData = warpMock.deployFromSourceTx.firstCall.args[0]
      expect(contractData.srcTxId).to.equal(
        MOCK_ABC_CONFIG.contracts.curation.whitelist
      )
      expect(
        contractData.tags?.some(tag => {
          return tag.get('name') === 'Contract-Name'
            && tag.get('value') === 'Whitelist-Curation-Contract'
        })
      ).to.be.true
    })

    it('creates collaborative curations', async () => {
      const curationId = await authenticatedCurations.create('collaborative', {
        owner: MOCK_OWNER,
        title: 'My Collaborative Curation'
      })

      expect(curationId).to.equal(MOCK_CONTRACT_TX_ID)
      expect(warpMock.deployFromSourceTx.calledOnce).to.be.true
      const contractData = warpMock.deployFromSourceTx.firstCall.args[0]
      expect(contractData.srcTxId).to.equal(
        MOCK_ABC_CONFIG.contracts.curation.collaborative
      )
      expect(
        contractData.tags?.some(tag => {
          return tag.get('name') === 'Contract-Name'
            && tag.get('value') === 'Collaborative-Curation-Contract'
        })
      ).to.be.true
    })

    it('creates collaborative whitelist curations', async () => {
      const curationId = await authenticatedCurations.create(
        'collaborative-whitelist',
        {
          owner: MOCK_OWNER,
          title: 'My Collaborative Whitelist Curation'
        }
      )

      expect(curationId).to.equal(MOCK_CONTRACT_TX_ID)
      expect(warpMock.deployFromSourceTx.calledOnce).to.be.true
      const contractData = warpMock.deployFromSourceTx.firstCall.args[0]
      expect(contractData.srcTxId).to.equal(
        MOCK_ABC_CONFIG.contracts.curation.collaborativeWhitelist
      )
      expect(
        contractData.tags?.some(tag => {
          return tag.get('name') === 'Contract-Name'
            && tag.get('value') === 'Collaborative-Whitelist-Curation-Contract'
        })
      ).to.be.true
    })

    it('limits ANS-110 title to 150 chars and desc to 300 chars', async () => {
      const title = 'My Curation'.padEnd(175)
      const description = 'My Curation'.padEnd(350)

      await authenticatedCurations.create('ownable', {
        owner: MOCK_OWNER,
        title,
        description
      })

      const { tags } = warpMock.deployFromSourceTx.firstCall.args[0]
      const titleTag = tags?.find(tag => tag.get('name') === 'Title')
      const descTag = tags?.find(tag => tag.get('name') === 'Description')

      expect(titleTag?.get('value')).to.equal(title.substring(0, 150))
      expect(descTag?.get('value')).to.equal(description.substring(0, 300))
    })

    it('allows additional custom tags to be added to curations', async () => {
      const myTag1 = { name: 'My-Tag-1', value: 'My First Tag' }
      const myTag2 = { name: 'My-Tag-2', value: 'My Second Tag' }
      const myTag3 = { name: 'My-Tag-3', value: 'My Third Tag' }

      await authenticatedCurations.create('ownable', {
        owner: MOCK_OWNER,
        title: 'My Custom Tags Curation',
        tags: [ myTag1, myTag2, myTag3 ]
      })

      const { tags } = warpMock.deployFromSourceTx.firstCall.args[0]
      const foundTag1 = tags?.find(tag => tag.get('name') === myTag1.name)
      const foundTag2 = tags?.find(tag => tag.get('name') === myTag2.name)
      const foundTag3 = tags?.find(tag => tag.get('name') === myTag3.name)

      expect(foundTag1?.get('value')).to.equal(myTag1.value)
      expect(foundTag2?.get('value')).to.equal(myTag2.value)
      expect(foundTag3?.get('value')).to.equal(myTag3.value)
    })

    it('should generate a slug tag for curations based on title', async () => {
      const title = 'My Curation With A Slug'
      
      await authenticatedCurations.create('ownable', {
        owner: MOCK_OWNER,
        title
      })

      const { tags } = warpMock.deployFromSourceTx.firstCall.args[0]
      const slugTag = tags?.find(tag => tag.get('name') === 'Slug')

      expect(slugTag?.get('value')).to.equal('my-curation-with-a-slug')
    })

    it('should generate slugs up to 150 chars', async () => {
      const title = ''.padEnd(175, 'a')

      await authenticatedCurations.create('ownable', {
        owner: MOCK_OWNER,
        title
      })

      const { tags } = warpMock.deployFromSourceTx.firstCall.args[0]
      const slugTag = tags?.find(tag => tag.get('name') === 'Slug')

      expect(slugTag?.get('value')).to.equal(title.substring(0, 150))
    })

    it('should allow user to provide custom slug tag', async () => {
      const slug = 'my-custom-slug'

      await authenticatedCurations.create('ownable', {
        owner: MOCK_OWNER,
        title: 'My Custom Slug Curation',
        slug
      })

      const { tags } = warpMock.deployFromSourceTx.firstCall.args[0]
      const slugTag = tags?.find(tag => tag.get('name') === 'Slug')

      expect(slugTag?.get('value')).to.equal(slug)
    })

    it('should limit custom user slugs to 150 chars', async () => {
      const slug = 'a'.padEnd(175, 'a')

      await authenticatedCurations.create('ownable', {
        owner: MOCK_OWNER,
        title: 'My Long Custom Slug Curation',
        slug
      })

      const { tags } = warpMock.deployFromSourceTx.firstCall.args[0]
      const slugTag = tags?.find(tag => tag.get('name') === 'Slug')

      expect(slugTag?.get('value')).to.equal(slug.substring(0, 150))
    })

    it('should allow user to opt out of using a slug tag', async () => {
      await authenticatedCurations.create('ownable', {
        owner: MOCK_OWNER,
        title: 'My Curation Without A Slug',
        slug: false
      })

      const { tags } = warpMock.deployFromSourceTx.firstCall.args[0]
      const slugTag = tags?.find(tag => tag.get('name') === 'Slug')

      expect(slugTag).to.be.undefined
    })

    it('adds Protocol: ArtByCity tag to curations', async () => {
      await authenticatedCurations.create('ownable', {
        owner: MOCK_OWNER,
        title: 'My Art By City Tagged Curation'
      })

      const { tags } = warpMock.deployFromSourceTx.firstCall.args[0]
      const protocolTag = tags?.find(tag => tag.get('name') === 'Protocol')

      expect(protocolTag?.get('value')).to.equal('ArtByCity')
    })

    it('adds Contract-Version tag to curations', async () => {
      await authenticatedCurations.create('ownable', {
        owner: MOCK_OWNER,
        title: 'My Art By City Tagged Curation'
      })

      const { tags } = warpMock.deployFromSourceTx.firstCall.args[0]
      const contractVersionTag = tags?.find(
        tag => tag.get('name') === 'Contract-Version'
      )

      expect(contractVersionTag?.get('value')).to.equal('0.0.1')
    })
  })
})
