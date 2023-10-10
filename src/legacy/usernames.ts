import BaseContractProvider from '../common/contract'

export interface UsernamesContractState {
  usernames: {
    [owner: string]: string
  }
}

export default class LegacyUsernames
  extends BaseContractProvider<UsernamesContractState>
{
  async resolve(
    usernameOrAddress: string
  ): Promise<{ username: string | null, address: string | null }> {
    let address: string | null = null, username: string | null = null
    const tryUsername = await this.resolveUsernameFromAddress(usernameOrAddress)
    const tryAddress = await this.resolveAddressFromUsername(usernameOrAddress)

    if (tryUsername && tryAddress) {
      // Both username and address resolved. This shouldn't happen, but could
      // if someone set their username to their arweave address
      address = tryAddress
      username = tryUsername
    } else if (!tryUsername && tryAddress) {
      // Username didn't resolve but address did, so we were passed a username
      username = usernameOrAddress
      address = tryAddress
    } else if (tryUsername && !tryAddress) {
      // Username resolved but address didn't, so we were passed an address
      address = usernameOrAddress
      username = tryUsername
    } else {
      // Fall back on assuming arweave address
      if (usernameOrAddress.length === 43) {
        address = usernameOrAddress
      }
    }

    return { address, username }
  }

  async resolveAddressFromUsername(username: string): Promise<string | null> {
    const {
      cachedValue: { state: { usernames } }
    } = await this.contract.readState()

    for (const address in usernames) {
      if (usernames[address] === username) {
        return address
      }
    }

    return null
  }

  async resolveUsernameFromAddress(address: string): Promise<string | null> {
    const {
      cachedValue: { state: { usernames } }
    } = await this.contract.readState()

    return usernames[address] || null
  }
}
