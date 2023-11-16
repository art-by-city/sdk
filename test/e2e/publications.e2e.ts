/* eslint-disable */
import('mocha') // NB: this style import makes both webpack and typescript happy
import { expect } from 'chai'
import Arweave from 'arweave'
import { JWKInterface } from 'warp-contracts'

import TestweaveJWK from '../testweave-keyfile.json'
import ArtByCity, { ArtByCityConfig } from '../../dist/web'
import {
  AudioPublicationOptions,
  ImagePublicationOptions,
  ModelPublicationOptions,
  TextPublicationOptions,
  VideoPublicationOptions
} from '../../dist/web/publications'

/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
const jwk: JWKInterface = TestweaveJWK

const arweave = Arweave.init({
  protocol: 'http',
  host: 'localhost',
  port: 1984
})
const config: Partial<ArtByCityConfig> = {
  environment: 'development',
  contracts: {
    usernames: '-0MjbNd0EwwmnNgHefa5axa0we64kNM3BOnXITcF7n0',
    atomicLicense: '8i_mVmJ9RPvG9KnMEBJimgD_l_I2BEkYja67vRZBWNo',
    curation: {
      ownable: '18WFZLc9rAfNpwWKKUNDycKaLXoknfjCUq42O6IK07Q',
      whitelist: 'N4JmgBHUu5ZHbcgaOUsKAydcVlQTSi5L7pwvq_NPZuA',
      collaborative: 'KNrobEq1MzK7121Tzd-J61trXcxKZujqPQ_B3ojZeb8',
      collaborativeWhitelist: '06Llbzymx4RI8Y0Ygen1grv4hM7MwjmmcCdCqeU9mAI'
    }
  }
}

describe('Publications Module', () => {
  context('Unauthenticated', () => {
    context('query', () => {
      it('queries all publications', async function () {
        this.timeout(0)
        const abc = new ArtByCity(arweave, config)

        const {
          publications,
          cursor
        } = await abc.publications.query(10, undefined, 'all')

        console.log('publications', publications.map(p => p.id))

        expect(publications).to.be.an('array')
        expect(publications).to.not.be.empty
        expect(cursor).to.be.a('string')
      })
    })

    context('fetch', () => {
      it('gets by publication id', async function () {
        this.timeout(0)
        const abc = new ArtByCity(arweave, config)
        const publicationId = 'RYJL2-5vkYtZVd-6IgQZqJQC56VIr8VEvR3aqllKNAk'
        
        const pub = await abc.publications.getById(publicationId)

        console.log('metadata', pub?.metadata)

        expect(pub).to.not.be.null
        expect(pub!.metadata).to.exist
        expect(pub!.tx).to.exist
      })

      it('gets by publication slug')

      it('gets by publication slug or id')
    })
  })

  context('Authenticated', () => {
    it.only('publishes images', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const opts: ImagePublicationOptions = {
        type: 'image',
        title: 'My Image Publication',
        slug: 'my-custom-slug',
        primary: {
          type: 'image/png',
          data: 'mock-png',
          size: 8,
          name: 'my-original-image.png',
          small: {
            type: 'image/jpeg',
            data: 'mock-jpg',
            size: 8,
            name: 'my-original-image-small.jpeg'
          },
          large: {
            type: 'image/jpeg',
            data: 'mock-jpg',
            size: 8,
            name: 'my-original-image-large.jpeg'
          }
        }
      }

      const {
        bundleTxId,
        primaryAssetTxId,
        primaryMetadataTxId,
        tx
      } = await abc.connect(jwk).publications.create(opts)

      console.log('bundle', bundleTxId)
      console.log('primary asset', primaryAssetTxId)
      console.log('primary metadata', primaryMetadataTxId)

      expect(bundleTxId).to.be.a('string')
      expect(primaryAssetTxId).to.be.a('string')
      expect(primaryMetadataTxId).to.be.a('string')

      const { status } = await arweave.transactions.post(tx)
      expect(status).to.be.lessThan(400)
    })

    it('publishes audio', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const opts: AudioPublicationOptions = {
        type: 'audio',
        title: 'My Audio Publication',
        primary: {
          type: 'audio/mpeg',
          data: 'mock-mp3',
          size: 8,
          name: 'my-original-audio.mp3'
        }
      }

      const {
        bundleTxId,
        primaryAssetTxId,
        primaryMetadataTxId
      } = await abc.connect(jwk).publications.create(opts)

      console.log('bundle', bundleTxId)
      console.log('primary asset', primaryAssetTxId)
      console.log('primary metadata', primaryMetadataTxId)

      expect(bundleTxId).to.be.a('string')
      expect(primaryAssetTxId).to.be.a('string')
      expect(primaryMetadataTxId).to.be.a('string')
    })

    it('publishes models', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const opts: ModelPublicationOptions = {
        type: 'model',
        title: 'My Model Publication',
        primary: {
          type: 'model/gltf+binary',
          data: 'mock-model',
          size: 10,
          name: 'my-original-audio.glb'
        }
      }

      const {
        bundleTxId,
        primaryAssetTxId,
        primaryMetadataTxId
      } = await abc.connect(jwk).publications.create(opts)

      console.log('bundle', bundleTxId)
      console.log('primary asset', primaryAssetTxId)
      console.log('primary metadata', primaryMetadataTxId)

      expect(bundleTxId).to.be.a('string')
      expect(primaryAssetTxId).to.be.a('string')
      expect(primaryMetadataTxId).to.be.a('string')
    })

    it('publishes video', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const opts: VideoPublicationOptions = {
        type: 'video',
        title: 'My Video Publication',
        primary: {
          type: 'video/mp4',
          data: 'mock-video',
          size: 10,
          name: 'my-original-video.mp4'
        }
      }

      const {
        bundleTxId,
        primaryAssetTxId,
        primaryMetadataTxId
      } = await abc.connect(jwk).publications.create(opts)

      console.log('bundle', bundleTxId)
      console.log('primary asset', primaryAssetTxId)
      console.log('primary metadata', primaryMetadataTxId)

      expect(bundleTxId).to.be.a('string')
      expect(primaryAssetTxId).to.be.a('string')
      expect(primaryMetadataTxId).to.be.a('string')
    })

    it('publishes text', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)
      const opts: TextPublicationOptions = {
        type: 'text',
        title: 'My Text Publication',
        primary: {
          type: 'text/plain',
          data: 'mock-text',
          size: 9,
          name: 'my-original-text.txt'
        }
      }

      const {
        bundleTxId,
        primaryAssetTxId,
        primaryMetadataTxId
      } = await abc.connect(jwk).publications.create(opts)

      console.log('bundle', bundleTxId)
      console.log('primary asset', primaryAssetTxId)
      console.log('primary metadata', primaryMetadataTxId)

      expect(bundleTxId).to.be.a('string')
      expect(primaryAssetTxId).to.be.a('string')
      expect(primaryMetadataTxId).to.be.a('string')
    })
  })
})
