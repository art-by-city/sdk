import 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import Arweave from 'arweave'
import { ArweaveSigner, Bundle, DataItem } from 'arbundles'
import ArLocal from 'arlocal'

import TestweaveJWK from '../testweave-keyfile.json'
import {
  AudioPublicationOptions,
  AuthenticatedArtByCityPublications,
  ImagePublicationOptions
} from '../../src/publications'
import { AuthenticatedArFSClient } from '../../src/arfs'
import { ArtByCityConfig } from '../../src'
import { ImageDataItemFactory } from '../../src/publications/publication-item'

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
    },
    following: 'mock-following-contract-src-id'
  },
  cache: {
    type: 'memcache'
  }
}

const AOS_MODULE_ID = 'cbn0KKrBZH7hdNkNokuXLtGryrWM--PjSTBqIzw9Kkk'
const SCHEDULER_ID = '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA'

const arweave = new Arweave({
  protocol: 'http',
  host: 'localhost',
  port: 1984
})
const arlocal = new ArLocal(1984, false, 'file::memory:?cache=shared', false)
const TESTWEAVE_ADDRESS = 'MlV6DeOtRmakDOf6vgOBlif795tcWimgyPsYYNQ8q1Y'

describe('Publications Module', () => {
  before(async () => {
    await arlocal.start()
  })

  after(async () => {
    await arlocal.stop()
  })

  afterEach(() => {
    sinon.reset()
  })

  context('Images', () => {
    it('publishes images', async () => {
      const signer = new ArweaveSigner(TestweaveJWK)
      const publisher = new AuthenticatedArtByCityPublications(
        arweave,
        new AuthenticatedArFSClient(arweave, signer),
        MOCK_ABC_CONFIG,
        signer
      )

      const opts: ImagePublicationOptions = {
        type: 'image',
        title: 'My Image Publication',
        primary: {
          type: 'image/png',
          data: 'mock-original-image-data',
          size: 24,
          name: 'my-original-image.png',
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
      }
      const {
        primaryAssetTxId,
        primaryMetadataTxId,
        tx
      } = await publisher.create(opts)

      expect(primaryAssetTxId).to.be.a('string')
      expect(primaryMetadataTxId).to.be.a('string')

      const bundle = new Bundle(Buffer.from(tx.data))
      let primaryAssetDataItem: DataItem | undefined
      for (const item of bundle.items) {
        if (item.id === primaryAssetTxId) {
          primaryAssetDataItem = item
        }
      }

      expect(primaryAssetDataItem).to.exist

      const primaryAssetTags = primaryAssetDataItem!.tags

      // SmartWeave Contract Tags
      // { name: 'App-Name', value: 'SmartWeaveContract' },
      // { name: 'App-Version', value: '0.3.0' },
      // { name: 'Contract-Src', value: 'mock-atomic-license-contract-id' },
      // {
      //   name: 'Init-State',
      //   value: '{"owner":"MlV6DeOtRmakDOf6vgOBlif795tcWimgyPsYYNQ8q1Y"}'
      // }
      expect(
        primaryAssetTags.find(t => t.name === 'App-Name')
      ).to.deep.equal({ name: 'App-Name', value: 'SmartWeaveContract' })
      expect(
        primaryAssetTags.find(t => t.name === 'App-Version')
      ).to.deep.equal({ name: 'App-Version', value: '0.3.0' })
      expect(
        primaryAssetTags.find(t => t.name === 'Contract-Src')
      ).to.deep.equal({
        name: 'Contract-Src',
        value: MOCK_ABC_CONFIG.contracts.atomicLicense
      })
      expect(
        primaryAssetTags.find(t => t.name === 'Init-State')
      ).to.deep.equal({
        name: 'Init-State',
        value: `{"owner":"${TESTWEAVE_ADDRESS}"}`
      })

      // AO Process Tags
      // { name: 'Data-Protocol', value: 'ao' },
      // { name: 'Variant', value: 'ao.TN.1' },
      // { name: 'Type', value: 'Process' },
      // { name: 'Module', value: ctx.module },
      // { name: 'Scheduler', value: ctx.scheduler },
      // { name: 'SDK', value: 'aoconnect' }
      expect(
        primaryAssetTags.find(t => t.name === 'Data-Protocol')
      ).to.deep.equal({ name: 'Data-Protocol', value: 'ao' })
      expect(
        primaryAssetTags.find(t => t.name === 'Variant')
      ).to.deep.equal({ name: 'Variant', value: 'ao.TN.1' })
      expect(
        primaryAssetTags.find(t => t.name === 'Type' && t.value === 'Process')
      ).to.deep.equal({ name: 'Type', value: 'Process' })
      expect(
        primaryAssetTags.find(t => t.name === 'Module')
      ).to.deep.equal({ name: 'Module', value: AOS_MODULE_ID })
      expect(
        primaryAssetTags.find(t => t.name === 'Scheduler')
      ).to.deep.equal({ name: 'Scheduler', value: SCHEDULER_ID })
      expect(
        primaryAssetTags.find(t => t.name === 'SDK')
      ).to.deep.equal({ name: 'SDK', value: '@artbycity/sdk' })
    })

    it('publishes other file types', async () => {
      const signer = new ArweaveSigner(TestweaveJWK)
      const publisher = new AuthenticatedArtByCityPublications(
        arweave,
        new AuthenticatedArFSClient(arweave, signer),
        MOCK_ABC_CONFIG,
        signer
      )

      const opts: AudioPublicationOptions = {
        type: 'audio',
        title: 'My Image Publication',
        primary: {
          type: 'audio/mpeg',
          data: 'mock-original-audio-data',
          size: 24,
          name: 'my-original-audio.mp3'
        }
      }
      const {
        primaryAssetTxId,
        primaryMetadataTxId,
        tx
      } = await publisher.create(opts)

      expect(primaryAssetTxId).to.be.a('string')
      expect(primaryMetadataTxId).to.be.a('string')

      const bundle = new Bundle(Buffer.from(tx.data))
      let primaryAssetDataItem: DataItem | undefined
      for (const item of bundle.items) {
        if (item.id === primaryAssetTxId) {
          primaryAssetDataItem = item
        }
      }

      expect(primaryAssetDataItem).to.exist

      const primaryAssetTags = primaryAssetDataItem!.tags

      // SmartWeave Contract Tags
      // { name: 'App-Name', value: 'SmartWeaveContract' },
      // { name: 'App-Version', value: '0.3.0' },
      // { name: 'Contract-Src', value: 'mock-atomic-license-contract-id' },
      // {
      //   name: 'Init-State',
      //   value: '{"owner":"MlV6DeOtRmakDOf6vgOBlif795tcWimgyPsYYNQ8q1Y"}'
      // }
      expect(
        primaryAssetTags.find(t => t.name === 'App-Name')
      ).to.deep.equal({ name: 'App-Name', value: 'SmartWeaveContract' })
      expect(
        primaryAssetTags.find(t => t.name === 'App-Version')
      ).to.deep.equal({ name: 'App-Version', value: '0.3.0' })
      expect(
        primaryAssetTags.find(t => t.name === 'Contract-Src')
      ).to.deep.equal({
        name: 'Contract-Src',
        value: MOCK_ABC_CONFIG.contracts.atomicLicense
      })
      expect(
        primaryAssetTags.find(t => t.name === 'Init-State')
      ).to.deep.equal({
        name: 'Init-State',
        value: `{"owner":"${TESTWEAVE_ADDRESS}"}`
      })

      // AO Process Tags
      // { name: 'Data-Protocol', value: 'ao' },
      // { name: 'Variant', value: 'ao.TN.1' },
      // { name: 'Type', value: 'Process' },
      // { name: 'Module', value: ctx.module },
      // { name: 'Scheduler', value: ctx.scheduler },
      // { name: 'SDK', value: 'aoconnect' }
      expect(
        primaryAssetTags.find(t => t.name === 'Data-Protocol')
      ).to.deep.equal({ name: 'Data-Protocol', value: 'ao' })
      expect(
        primaryAssetTags.find(t => t.name === 'Variant')
      ).to.deep.equal({ name: 'Variant', value: 'ao.TN.1' })
      expect(
        primaryAssetTags.find(t => t.name === 'Type' && t.value === 'Process')
      ).to.deep.equal({ name: 'Type', value: 'Process' })
      expect(
        primaryAssetTags.find(t => t.name === 'Module')
      ).to.deep.equal({ name: 'Module', value: AOS_MODULE_ID })
      expect(
        primaryAssetTags.find(t => t.name === 'Scheduler')
      ).to.deep.equal({ name: 'Scheduler', value: SCHEDULER_ID })
      expect(
        primaryAssetTags.find(t => t.name === 'SDK')
      ).to.deep.equal({ name: 'SDK', value: '@artbycity/sdk' })
    })
  })
})
