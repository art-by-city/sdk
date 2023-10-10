import Arweave from 'arweave'
import { Contract, Warp } from 'warp-contracts'

import { ArtByCityConfig } from '../config'
import { CurationContractStates, OwnableCurationState } from './'

export default class ArtByCityCurations {
  constructor(
    protected readonly arweave: Arweave,
    protected readonly warp: Warp,
    protected readonly config: ArtByCityConfig
  ) {}

  async get<State extends CurationContractStates>(
    curationId: string
  ): Promise<Contract<State>> {
    return this.warp.contract<State>(curationId)
  }
}
