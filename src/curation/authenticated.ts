import Arweave from 'arweave'
import { JWKInterface, Tag, Warp } from 'warp-contracts'
import { ArweaveSigner } from 'warp-arbundles'
import {
  InjectedArweaveSigner,
  isSigner
} from 'warp-contracts-plugin-deploy'

import { ArtByCityConfig } from '../config'
import {
  ArtByCityCurations,
  CurationContractStates,
  CurationCreationOptions,
  CurationType,
  UnknownCurationTypeError,
} from './'
import { generateSlug } from '../util'

export default class AuthenticatedArtByCityCurations
  extends ArtByCityCurations
{
  constructor(
    arweave: Arweave,
    protected warp: Warp,
    config: ArtByCityConfig,
    private readonly signer:
      | ArweaveSigner
      | InjectedArweaveSigner
      | JWKInterface
  ) {
    super(arweave, warp, config)
  }

  private determineCurationSource(
    type: CurationType
  ): { srcTxId: string, contractName: string } {
    switch (type) {
      case 'ownable':
        return {
          srcTxId: this.config.contracts.curation.ownable,
          contractName: 'Ownable-Curation-Contract'
        }
      case 'whitelist':
        return {
          srcTxId: this.config.contracts.curation.whitelist,
          contractName: 'Whitelist-Curation-Contract'
        }
      case 'collaborative':
        return {
          srcTxId: this.config.contracts.curation.collaborative,
          contractName: 'Collaborative-Curation-Contract'
        }
      case 'collaborative-whitelist':
        return {
          srcTxId: this.config.contracts.curation.collaborativeWhitelist,
          contractName: 'Collaborative-Whitelist-Curation-Contract'
        }
      default:
        throw new UnknownCurationTypeError()
    }
  }

  private createInitialState(
    type: CurationType,
    opts: CurationCreationOptions
  ): CurationContractStates {
    const base = {
      owner: opts.owner,
      title: opts.title,
      metadata: opts.metadata || {},
      items: opts.items || [],
      hidden: opts.hidden || []
    }
    const addressWhitelist = opts.addressWhitelist || []
    const roles = opts.roles || { curator: [] }

    // NB: Copy full description to curation state metadata
    if (opts.description) {
      base.metadata['description'] = opts.description
    }

    // NB: Copy topic to curation state metadata
    if (opts.topic) {
      base.metadata['topic'] = opts.topic
    }

    if (type === 'ownable') {
      return base
    }

    if (type === 'whitelist') {
      return { ...base, addressWhitelist }
    }

    if (type === 'collaborative') {
      return { ...base, roles }
    }

    if (type === 'collaborative-whitelist') {
      return { ...base, addressWhitelist, roles }
    }

    throw new UnknownCurationTypeError()
  }

  async create(type: CurationType, opts: CurationCreationOptions) {
    const { srcTxId, contractName } = this.determineCurationSource(type)
    const initialState = this.createInitialState(type, opts)
    const tags = (opts.tags || []).map<Tag>(tag => new Tag(tag.name, tag.value))

    tags.push(
      new Tag('Contract-Name', contractName),

      // ArtByCity / ArFS Entity-Type
      new Tag('Entity-Type', 'curation'),

      // ANS-110 Type
      new Tag('Type', 'curation'),

      // ANS-110 Title
      new Tag('Title', opts.title.substring(0, 150))
    )

    // ANS-110 Description
    if (opts.description) {
      // NB: Description tag has a limit of 300 chars
      tags.push(new Tag('Description', opts.description.substring(0, 300)))
    }

    // ANS-110 Topic
    if (opts.topic) {
      tags.push(new Tag('Topic', opts.topic))
    }

    // Slug
    if (typeof opts.slug === 'undefined' || opts.slug === true) {
      tags.push(new Tag('Slug', generateSlug(opts.title, 150)))
    } else if (typeof opts.slug === 'string') {
      tags.push(new Tag('Slug', generateSlug(opts.slug, 150)))
    }

    const { contractTxId } = await this.warp.deployFromSourceTx({
      /* @ts-expect-error warp types are spaghetti */
      wallet: this.signer,
      srcTxId,
      initState: JSON.stringify(initialState),
      tags
    /* @ts-expect-error warp types are spaghetti */  
    }, !isSigner(this.signer))

    return contractTxId
  }
}
