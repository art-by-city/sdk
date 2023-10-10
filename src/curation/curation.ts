import Arweave from 'arweave'
import { Contract, Warp } from 'warp-contracts'

import { ArtByCityConfig } from '../config'
import { CurationContractStates } from './'

export default class ArtByCityCurations {
  constructor(
    protected readonly arweave: Arweave,
    protected readonly warp: Warp,
    protected readonly config: ArtByCityConfig
  ) {}

  get<State extends CurationContractStates>(
    curationId: string
  ): Contract<State> {
    return this.warp.contract<State>(curationId)
  }
}
