import Arweave from 'arweave'
import { ArweaveSigner, Tag } from 'arbundles'

import { ArtByCityConfig } from '../config'
import {
  ArtByCityCurations,
  CurationContractStates,
  CurationCreationOptions,
  CurationType,
  UnknownCurationTypeError,
} from '.'
import { generateSlug } from '../util'
import { getAddressFromSigner } from '../util/crypto'
import { WithRequired, assertHasValueForKey } from '../util/types'

export default class AuthenticatedArtByCityCurations
  extends ArtByCityCurations
{
  constructor(
    arweave: Arweave,
    // protected readonly warp: Warp,
    config: ArtByCityConfig,
    private readonly signer: ArweaveSigner //| InjectedArweaveSigner
  ) {
    super(
      arweave,
      // warp,
      config
    )
  }

  private determineCurationSource(
    type: CurationType
  ): { srcTxId: string, contractName: string, contractVersion: string } {
    switch (type) {
      case 'ownable':
        return {
          srcTxId: this.config.contracts.curation.ownable,
          contractName: 'Ownable-Curation-Contract',
          contractVersion: '0.0.1'
        }
      case 'whitelist':
        return {
          srcTxId: this.config.contracts.curation.whitelist,
          contractName: 'Whitelist-Curation-Contract',
          contractVersion: '0.0.1'
        }
      case 'collaborative':
        return {
          srcTxId: this.config.contracts.curation.collaborative,
          contractName: 'Collaborative-Curation-Contract',
          contractVersion: '0.0.1'
        }
      case 'collaborative-whitelist':
        return {
          srcTxId: this.config.contracts.curation.collaborativeWhitelist,
          contractName: 'Collaborative-Whitelist-Curation-Contract',
          contractVersion: '0.0.1'
        }
      default:
        throw new UnknownCurationTypeError()
    }
  }

  private createInitialState(
    type: CurationType,
    opts: WithRequired<CurationCreationOptions, 'owner'>
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
    const {
      srcTxId,
      contractName,
      contractVersion
    } = this.determineCurationSource(type)

    if (!opts.owner) {
      opts.owner = await getAddressFromSigner(this.signer)
    }
    assertHasValueForKey(opts, 'owner')
    const initialState = this.createInitialState(type, opts)
    
    const tags = (opts.tags || []).map<Tag>(
      tag => ({ name: tag.name, value: tag.value })
    )

    tags.push(
      { name: 'Protocol', value: 'ArtByCity' },
      { name: 'Contract-Name', value: contractName },
      { name: 'Contract-Version', value: contractVersion },

      // ArtByCity / ArFS Entity-Type
      { name: 'Entity-Type', value: 'curation' },

      // ANS-110 Type
      { name: 'Type', value: 'curation' },

      // ANS-110 Title
      { name: 'Title', value: opts.title.substring(0, 150) }
    )

    // ANS-110 Description
    if (opts.description) {
      // NB: Description tag has a limit of 300 chars
      tags.push(
        { name: 'Description', value: opts.description.substring(0, 300) }
      )
    }

    // ANS-110 Topic
    if (opts.topic) {
      tags.push({ name: 'Topic', value: opts.topic })
    }

    // Slug
    if (typeof opts.slug === 'undefined' || opts.slug === true) {
      tags.push({ name: 'Slug', value: generateSlug(opts.title, 150) })
    } else if (typeof opts.slug === 'string') {
      tags.push({ name: 'Slug', value: generateSlug(opts.slug, 150) })
    }

    throw new Error(
      'This feature is being reimplemented with AO and is not yet available'
    )

    // const { contractTxId } = await this.warp.deployFromSourceTx({
    //   wallet: this.signer instanceof ArweaveSigner
    //     ? this.signer.jwk
    //     : this.signer,
    //   srcTxId,
    //   initState: JSON.stringify(initialState),
    //   tags
    // }, !isSigner(this.signer) || this.config.environment === 'development')

    // return contractTxId
  }
}
