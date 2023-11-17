import { Tag, Warp } from 'warp-contracts'
import { ArweaveSigner } from 'warp-arbundles'
import { InjectedArweaveSigner, isSigner } from 'warp-contracts-plugin-deploy'

import { ArtByCityConfig } from '../config'
import { getAddressFromSigner } from '../util/crypto'
import { ArtByCityFollowing, FollowingCreationOptions } from './'

export default class AuthenticatedArtByCityFollowing
  extends ArtByCityFollowing
{
  constructor(
    protected readonly config: ArtByCityConfig,
    protected readonly warp: Warp,
    private readonly signer: ArweaveSigner | InjectedArweaveSigner
  ) {
    super(config, warp)
  }

  async getOrCreate() {
    // TODO -> try to get

    // TODO -> if null, create

    // TODO -> return contract followingId
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
      wallet: this.signer,
      srcTxId: this.config.contracts.following,
      initState: JSON.stringify(initialState),
      tags
      /* @ts-expect-error warp types are spaghetti */
    }, !isSigner(this.signer))

    return contractTxId
  }

  async follow(address: string) {}

  async unfollow(address: string) {}
}
