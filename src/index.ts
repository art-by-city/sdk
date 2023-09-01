import Arweave from 'arweave'

export default class ArtByCity {
  public arweave!: Arweave

  constructor(arweave?: Arweave) {
    this.arweave = arweave || Arweave.init({})
  }
}
