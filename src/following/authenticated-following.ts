import Arweave from 'arweave'
import { Tag, Warp } from 'warp-contracts'
import { ArweaveSigner } from 'warp-arbundles'
import { InjectedArweaveSigner, isSigner } from 'warp-contracts-plugin-deploy'

import { ArtByCityConfig } from '../config'
import { getAddressFromSigner } from '../util/crypto'
import {
  ArtByCityFollowing,
  FollowInteraction,
  FollowingCreationOptions,
  UnfollowInteraction
} from './'

export default class AuthenticatedArtByCityFollowing
  extends ArtByCityFollowing
{
  constructor(
    protected readonly arweave: Arweave,
    protected readonly warp: Warp,
    protected readonly config: ArtByCityConfig,
    private readonly signer: ArweaveSigner | InjectedArweaveSigner
  ) {
    super(arweave, warp, config)
  }

  async getOrCreate() {
    const owner = await getAddressFromSigner(this.signer)
    const contract = await this.getContract(owner)

    if (contract) {
      return contract.txId()
    }

    return await this.create()
  }

  async create(opts?: FollowingCreationOptions) {
    if (!opts) {
      opts = {}
    }

    if (!opts.owner) {
      opts.owner = await getAddressFromSigner(this.signer)
    }

    const initialState = {
      owner: opts.owner,
      following: opts.following || []
    }

    const tags = (opts.tags || []).map<Tag>(tag => new Tag(tag.name, tag.value))
    tags.push(
      new Tag('Protocol', 'ArtByCity'),
      new Tag('Contract-Name', 'Following'),
      new Tag('Contract-Version', '0.0.1'),
      new Tag('Entity-Type', 'following')
    )

    const { contractTxId } = await this.warp.deployFromSourceTx({
      /* @ts-expect-error warp types are spaghetti */
      wallet: this.signer instanceof ArweaveSigner ? this.signer.jwk : this.signer,
      srcTxId: this.config.contracts.following,
      initState: JSON.stringify(initialState),
      tags
      /* @ts-expect-error warp types are spaghetti */
    }, !isSigner(this.signer) || this.config.environment === 'development')

    return contractTxId
  }

  async follow(address: string) {
    const owner = await getAddressFromSigner(this.signer)
    const contract = await this.getContract(owner)

    if (contract) {
      const res = await contract
        /* @ts-expect-error warp spaghetti */
        .connect(this.signer)
        .writeInteraction<FollowInteraction>({
          function: 'follow',
          address
        })

      if (!res) {
        throw new Error(`Error interacting with Following contract`)
      }

      return res
    }

    throw new Error(`No Following contract found for ${owner}`)
  }

  async unfollow(address: string) {
    const owner = await getAddressFromSigner(this.signer)
    const contract = await this.getContract(owner)

    if (contract) {
      const res = await contract
        /* @ts-expect-error warp spaghetti */
        .connect(this.signer)
        .writeInteraction<UnfollowInteraction>({
          function: 'unfollow',
          address
        })

      if (!res) {
        throw new Error(`Error interacting with Following contract`)
      }

      return res
    }

    throw new Error(`No Following contract found for ${owner}`)
  }
}
