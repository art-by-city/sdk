import 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import Arweave from 'arweave'
import ArweaveApi from 'arweave/node/lib/api'
import NodeCryptoDriver from 'arweave/node/lib/crypto/node-driver'
import { ArweaveSigner } from 'warp-arbundles'
import axios from 'axios'

import { ArtByCityConfig } from '../../src'
import { ArFSClient, AuthenticatedArFSClient } from '../../src/arfs'
import TestweaveJWK from '../testweave-keyfile.json'

const MOCK_OWNER = '0x-mock-owner'
const MOCK_CONTRACT_TX_ID = 'mock-contract-tx-id'

const arweaveMock = sinon.createStubInstance(Arweave)
const arweaveApiMock = sinon.createStubInstance(ArweaveApi)
arweaveMock.api = arweaveApiMock
const arweaveSignerMock = sinon.createStubInstance(ArweaveSigner)
arweaveSignerMock.pk = TestweaveJWK.n
const mockNodeCryptoDriver = sinon.createStubInstance(NodeCryptoDriver)

const axiosPostStub = sinon.stub(axios, 'post')

describe('ArFS Module', () => {
  beforeEach(() => {
    arweaveMock.getConfig.returns({
      api: {},
      crypto: mockNodeCryptoDriver
    })
  })

  afterEach(() => {
    sinon.reset()
  })

  context('Unauthenticated ArFS Client', () => {
    let arfs: ArFSClient

    beforeEach(() => {
      arfs = new ArFSClient(arweaveMock)
    })

    it('gets publication drive by address', async () => {
      arweaveApiMock.post.resolves({
        ...new Response(),
        data: {
          data: {
            transaction: {
              id: MOCK_CONTRACT_TX_ID,
              tags: [
                { name: 'Drive-Id', value: 'mock-drive-id' },
                { name: 'Folder-Id', value: 'mock-folder-id' },
                { name: 'Folder-Type', value: 'publications' }
              ]
            }
          }
        }
      })

      const publicationRoot = await arfs.getPublicationRoot(MOCK_OWNER)

      expect(publicationRoot).to.not.be.null
      expect(publicationRoot?.driveId).to.be.a('string')
      expect(publicationRoot?.folderId).to.be.a('string')
    })

    it('lists drives by address')
    it('lists folders by address')
    it('lists files by address')
  })

  context('Authenticated ArFS Client', () => {

    let arfs: AuthenticatedArFSClient

    beforeEach(() => {
      arfs = new AuthenticatedArFSClient(
        arweaveMock,
        new ArweaveSigner(TestweaveJWK)
      )

      axiosPostStub.resolves({ status: 200, statusText: 'OK' })
    })

    context('Drives', () => {
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

      it('creates a drive with publication root folder', async () => {
        const name = 'My Publication Drive'

        const {
          driveId,
          driveTxId,
          rootFolderId,
          rootFolderTxId
        } = await arfs.createDrive(name, true)

        expect(driveId).to.be.a('string')
        expect(driveTxId).to.be.a('string')
        expect(rootFolderId).to.be.a('string')
        expect(rootFolderTxId).to.be.a('string')
        expect(driveId).to.not.equal(rootFolderId)
        expect(driveTxId).to.not.equal(rootFolderTxId)
      })

      it('updates a drive')
      it('updates a drive with publication root folder')
    })

    context('Folders', () => {
      it('creates a folder')
    })

    context('Files', () => {
      it('creates a file')
    })
  })
})
