import Arweave from 'arweave'
import axios from 'axios'
import { JWKInterface } from 'warp-contracts'

import { ArtByCityConfig } from '../../dist/web'
import { getAddressFromSigner } from '../../dist/web/util/crypto'
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

export async function generateWalletWithBalance() {
  const jwk = await Arweave.crypto.generateJWK()
  const address = await getAddressFromSigner(jwk)
  await axios.get(
    `http://localhost:1984/mint/${address}/9999999999999999999999`
  )
  await mine()

  return { jwk, address }
}

export async function mine() {
  await axios.get('http://localhost:1984/mine')
}

export function gatewayRoot() {
  const { protocol, host, port } = arweave.api.getConfig()
  
  return `${protocol}://${host}:${port}`
}
