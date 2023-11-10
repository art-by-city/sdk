import ArDB from 'ardb'
import Arweave from 'arweave'

import { ArtByCityConfig } from '../config'

export default class ArtByCityPublications {
  protected readonly ardb!: ArDB

  constructor(
    protected readonly arweave: Arweave,
    protected readonly config: ArtByCityConfig
  ) {
    this.ardb = new ArDB(this.arweave)
  }

  async query() {
    throw new Error('not yet implemented')
  }

  async getById(publicationId: string) {
    throw new Error('not yet implemented')
  }

  async getBySlug () {
    throw new Error('not yet implemented')
  }

  async getBySlugOrId() {
    throw new Error('not yet implemented')
  }
}
