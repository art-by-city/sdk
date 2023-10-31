import 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import Arweave from 'arweave'
import { ArweaveSigner } from 'warp-arbundles'
import axios from 'axios'

import { ArtByCityConfig } from '../../src'
import { AuthenticatedArFSClient } from '../../src/arfs'
import TestweaveJWK from '../testweave-keyfile.json'

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
const arweaveSignerMock = sinon.createStubInstance(ArweaveSigner)
arweaveSignerMock.pk = TestweaveJWK.n

describe('ArFS Module', () => {
  beforeEach(() => {})

  afterEach(() => {
    sinon.reset()
  })

  context('Unauthenticated ArFS Client', () => {
    it('lists drives by address')
    it('lists folders by address')
    it('lists files by address')
  })

  context('Authenticated ArFS Client', () => {

    let arfs: AuthenticatedArFSClient

    beforeEach(() => {
      arfs = new AuthenticatedArFSClient(
        arweaveMock,
        MOCK_ABC_CONFIG,
        new ArweaveSigner(TestweaveJWK)
      )

      sinon.stub(axios, 'post').resolves({ status: 200, statusText: 'OK' })
    })

    context('Creating Drives', () => {
      it('creates a drive', async () => {
        const name = 'My Drive'

        const {
          driveId,
          driveTxId,
          rootFolderId,
          rootFolderTxId
        } = await arfs.createDrive(name)

        expect(driveId).to.be.a('string')
        expect(driveTxId).to.be.a('string')
        expect(rootFolderId).to.be.a('string')
        expect(rootFolderTxId).to.be.a('string')
        expect(driveId).to.not.equal(rootFolderId)
        expect(driveTxId).to.not.equal(rootFolderTxId)
      })
    })

    context('Creating Folders', () => {
      it('creates a folder')
    })

    context('Creating Files', () => {
      it('creates a file')
    })
  })
})
