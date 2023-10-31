import Arweave from 'arweave'

import { ArtByCityConfig } from '../config'

export default class ArFSClient {
  constructor(
    protected readonly arweave: Arweave,
    protected readonly config: ArtByCityConfig
  ) {}
}
