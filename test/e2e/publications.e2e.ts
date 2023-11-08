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
  PublicationAudio,
  PublicationImageWithThumbnails,
  PublicationModel,
  PublicationVideo,
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
  context('Authenticated', () => {
    it('publishes images', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)

      const image: PublicationImageWithThumbnails = {
        primary: {
          type: 'image/png',
          data: 'mock-png',
          size: 8,
          name: 'my-original-image.png'
        },
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
      const opts: ImagePublicationOptions = {
        type: 'image',
        title: 'My Image Publication',
        images: [ image ]
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

    it('publishes audio', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)

      const audio: PublicationAudio = {
        type: 'audio/mpeg',
        data: 'mock-mp3',
        size: 8,
        name: 'my-original-audio.mp3'
      }
      const opts: AudioPublicationOptions = {
        type: 'audio',
        audio,
        title: 'My Audio Publication'
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

      const model: PublicationModel = {
        type: 'model/gltf+binary',
        data: 'mock-model',
        size: 10,
        name: 'my-original-audio.glb'
      }

      const opts: ModelPublicationOptions = {
        type: 'model',
        model,
        title: 'My Model Publication'
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

    it.only('publishes video', async function () {
      this.timeout(0)
      const abc = new ArtByCity(arweave, config)

      const video: PublicationVideo = {
        type: 'video/mp4',
        data: 'mock-video',
        size: 10,
        name: 'my-original-video.mp4'
      }

      const opts: VideoPublicationOptions = {
        type: 'video',
        video,
        title: 'My video Publication'
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
