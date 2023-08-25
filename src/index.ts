export default class ArtByCity {
  private messageBuffer!: Buffer

  constructor(message: string) {
    this.messageBuffer = Buffer.from(message)
  }

  getMessage() {
    return this.messageBuffer.toString()
  }
}
