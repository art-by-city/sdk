import { ProfileUpdateOptions } from './'

export default class ArweaveAccount {
  constructor(
    public readonly txid: string,
    public readonly addr: string,
    private readonly opts: ProfileUpdateOptions
  ) {}

  get handle() {
    return this.opts.handle
      ? this.addr.substring(0, 3)
        + this.opts.handle
        + this.addr.substring(this.addr.length - 3)
      : undefined
  }
}
