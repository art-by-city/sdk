import 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import Arweave from 'arweave'
import { FromSrcTxContractData, Tag, Warp } from 'warp-contracts'

import { AuthenticatedArtByCityCurations } from '../../src/curation'
import { ArtByCityConfig } from '../../src'

const MOCK_OWNER = '0x-mock-owner'
const MOCK_CONTRACT_TX_ID = 'mock-contract-tx-id'
const MOCK_CONTRACT_SRC_TX_ID = 'mock-contract-tx-src-id'
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

const warpMock = sinon.createStubInstance(Warp)
const arweaveMock = sinon.createStubInstance(Arweave)
let authenticatedCurations: AuthenticatedArtByCityCurations

describe('Curation Module', () => {
  beforeEach(() => {
    authenticatedCurations = new AuthenticatedArtByCityCurations(
      arweaveMock,
      warpMock,
      MOCK_ABC_CONFIG,
      'use_wallet'
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
        (contractData.tags || []).some(tag => {
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
        (contractData.tags || []).some(tag => {
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
        (contractData.tags || []).some(tag => {
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
        (contractData.tags || []).some(tag => {
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
      const titleTag = (tags || []).find(tag => tag.get('name') === 'Title')
      const descTag = (tags || []).find(
        tag => tag.get('name') === 'Description'
      )

      expect(titleTag?.get('value')).to.equal(title.substring(0, 150))
      expect(descTag?.get('value')).to.equal(description.substring(0, 300))
    })
  })
})
