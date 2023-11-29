import Arweave from 'arweave'
import { JWKInterface } from 'warp-contracts'

import { ArtByCityConfig } from '../../dist/web'
import TestweaveJWK from '../testweave-keyfile.json'

/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
export const testweave: JWKInterface = TestweaveJWK

export const arweave = Arweave.init({
  protocol: 'http',
  host: 'localhost',
  port: 1984
})
export const config: Partial<ArtByCityConfig> = {
  environment: 'development',
  contracts: {
    usernames: '-0MjbNd0EwwmnNgHefa5axa0we64kNM3BOnXITcF7n0',
    atomicLicense: '8i_mVmJ9RPvG9KnMEBJimgD_l_I2BEkYja67vRZBWNo',
    curation: {
      ownable: '18WFZLc9rAfNpwWKKUNDycKaLXoknfjCUq42O6IK07Q',
      whitelist: 'N4JmgBHUu5ZHbcgaOUsKAydcVlQTSi5L7pwvq_NPZuA',
      collaborative: 'KNrobEq1MzK7121Tzd-J61trXcxKZujqPQ_B3ojZeb8',
      collaborativeWhitelist: '06Llbzymx4RI8Y0Ygen1grv4hM7MwjmmcCdCqeU9mAI'
    },
    following: 'ed6xnpsezIXbOg5XpO5DrsvQbxdXgUzWb-hzzMJ6zp0'
  }
}