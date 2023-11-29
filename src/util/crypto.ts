import Arweave from 'arweave'
import { ArweaveSigner } from 'warp-arbundles'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy'

import { JWKInterface } from './types'

export function isValidAddress(address: string) {
  return address.length === 43
}

export class InvalidAddressError extends Error {
  constructor() {
    super('Invalid address')
  }
}

export async function getArweaveAddressFromPublicKey(
  publicKey: Buffer | Uint8Array
): Promise<string> {
  const hashedPublicKey = await Arweave.crypto.hash(new Uint8Array(publicKey))

  return Arweave.utils.bufferTob64Url(hashedPublicKey)
}

export async function getAddressFromSigner(
  signer: ArweaveSigner | InjectedArweaveSigner | JWKInterface
): Promise<string> {
  if (
    signer instanceof ArweaveSigner
    || signer instanceof InjectedArweaveSigner
  ) {

    if (signer instanceof InjectedArweaveSigner) {
      await signer.setPublicKey()
    }

    return getArweaveAddressFromPublicKey(signer.publicKey)
  }

  return getArweaveAddressFromPublicKey(Arweave.utils.b64UrlToBuffer(signer.n))
}
