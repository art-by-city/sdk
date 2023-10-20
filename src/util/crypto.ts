export function isValidAddress(address: string) {
  return address.length === 43
}

export class InvalidAddressError extends Error {
  constructor() {
    super('Invalid address')
  }
}
