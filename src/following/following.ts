import { Warp } from 'warp-contracts'

import { ArtByCityConfig } from '../config'

export default class ArtByCityFollowing {
  constructor(
    protected readonly config: ArtByCityConfig,
    protected readonly warp: Warp
  ) {}

  async getContract(address: string) {}

  async following(address: string) {}
}
