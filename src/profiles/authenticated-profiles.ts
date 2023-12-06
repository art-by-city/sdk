import Arweave from 'arweave'
import { ArweaveSigner, createData } from 'warp-arbundles'
import { Tag } from 'warp-contracts'
import { InjectedArweaveSigner, isSigner } from 'warp-contracts-plugin-deploy'

import { ArtByCityProfiles, ProfileUpdateOptions } from './'
import { ArtByCityConfig } from '../config'
import { ArtByCityUsernames } from '../usernames'
import { DataItem } from 'arbundles'

const MAX_HANDLE_LENGTH = 32

export default class AuthenticatedArtByCityProfiles extends ArtByCityProfiles {
  constructor(
    protected readonly arweave: Arweave,
    protected readonly usernames: ArtByCityUsernames,
    protected readonly config: ArtByCityConfig,
    private readonly signer: ArweaveSigner | InjectedArweaveSigner
  ) {
    super(arweave, usernames, config)
  }

  async update(opts: ProfileUpdateOptions) {
    if (opts.handle && opts.handle.length > MAX_HANDLE_LENGTH) {
      throw new Error(`handle must be less than ${MAX_HANDLE_LENGTH}`)
    }

    if (
      opts.avatar
      && !(
        opts.avatar.startsWith('ar://')
        || opts.avatar.startsWith('http://')
        || opts.avatar.startsWith('https://')
      )
    ) {
      throw new Error('avatar must use protocol http://, https://, or ar://')
    }

    if (
      opts.banner
      && !(
        opts.banner.startsWith('ar://')
        || opts.banner.startsWith('http://')
        || opts.banner.startsWith('https://')
      )
    ) {
      throw new Error('banner must use protocol http://, https://, or ar://')
    }

    const tags = [
      new Tag('Protocol-Name', 'Account-0.2'),
      new Tag('Content-Type', 'application/json'),
      new Tag('Client', '@artbycity/sdk'),
      new Tag('Protocol', 'ArtByCity'),
      new Tag('Entity-Type', 'profile'),
    ]

    if (opts.handle) {
      tags.push(new Tag('Handle', opts.handle))
    }

    if (opts.username) {

      const res = await this.usernames
        .contract
        .connect(
          /* @ts-expect-error warp spaghetti */
          this.signer instanceof ArweaveSigner
            /* @ts-expect-error you will give me the jwk or else, machine */
            ? this.signer.jwk
            : this.signer
        )
        .writeInteraction(
          {
            function: 'register',
            username: opts.username
          },
          {
            disableBundling:
              /* @ts-expect-error Spaghetti Western by Primus */
              !isSigner(this.signer)
              || this.config.environment === 'development'
          }
        )

      console.log('username write res', res)
    }

    const profileDataItem = createData(
      JSON.stringify(opts),
      /* @ts-expect-error warp types */
      this.signer,
      { tags }
    )
    
    /* @ts-expect-error warp types */
    await profileDataItem.sign(this.signer)

    await this.transactions.dispatch(
      profileDataItem as unknown as DataItem,
      this.signer
    )

    return profileDataItem.id
  }
}
