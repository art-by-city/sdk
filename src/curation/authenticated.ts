import Arweave from 'arweave'
import { Tag, Warp } from 'warp-contracts'

import { JWKInterface } from '../util/types'
import { ArtByCityConfig } from '../config'
import {
  ArtByCityCurations,
  CurationContractStates,
  CurationCreationOptions,
  CurationType,
  UnknownCurationTypeError,
} from './'

export default class AuthenticatedArtByCityCurations
  extends ArtByCityCurations
{
  constructor(
    arweave: Arweave,
    protected warp: Warp,
    config: ArtByCityConfig,
    private readonly wallet: JWKInterface | 'use_wallet'
  ) {
    super(arweave, warp, config)
  }

  private determineCurationType(
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
    const { srcTxId, contractName } = this.determineCurationType(type)
    const initialState = this.createInitialState(type, opts)
    const tags: Tag[] = [
      new Tag('Contract-Name', contractName),

      // ArtByCity / ArFS Entity-Type
      new Tag('Entity-Type', 'curation'),

      // ANS-110 Title & Type
      new Tag('Title', opts.title),
      new Tag('Type', 'curation')
    ]

    // ANS-110 Description
    if (opts.description) {
      // NB: Description tag has a limit of 300 chars
      tags.push(new Tag('Description', opts.description.substring(0, 300)))

      // NB: Copy full description to curation state metadata
      initialState.metadata['description'] = opts.description
    }

    // ANS-110 Topic
    if (opts.topic) {
      tags.push(new Tag('Topic', opts.topic))

      // NB: Copy topic to curation state metadata
      initialState.metadata['topic'] = opts.topic
    }

    const { contractTxId } = await this.warp.deployFromSourceTx({
      wallet: this.wallet,
      srcTxId,
      initState: JSON.stringify(initialState),
      tags
    })

    return contractTxId
  }
}
