import('mocha') // NB: this style import makes both webpack and typescript happy
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import * as sinon from 'sinon'
import sinonChai from 'sinon-chai'
import Arweave from 'arweave'

chai.use(chaiAsPromised)
chai.use(sinonChai)

import ArtByCity from '../../dist/web'

const protocol = 'https'
const host = 'arweave.net'
const port = 443
const arweave = Arweave.init({ protocol, host, port })

const JIM_ADDRESS = '36Ar8VmyC7YS7JGaep9ca2ANjLABETTpxSeA7WOV45Y'

describe('ArtByCity Usernames Module', () => {
  it('resolves usernames from address', async () => {
    const abc = new ArtByCity(arweave)

    const username = await abc
      .usernames
      .resolveUsernameFromAddress(JIM_ADDRESS)
    
    expect(username).to.equal('jim')
  })

  it('resolves address from username', async () => {
    const abc = new ArtByCity(arweave)

    const address = await abc
      .usernames
      .resolveAddressFromUsername('jim')
    
    expect(address).to.equal(JIM_ADDRESS)
  })

  it('resolves username or address', async () => {
    const abc = new ArtByCity(arweave)

    const { username } = await abc.usernames.resolve(JIM_ADDRESS)
    const { address } = await abc.usernames.resolve('jim')

    expect(username).to.equal('jim')
    expect(address).to.equal(JIM_ADDRESS)
  })

  it('null when username does not resolve from address', async () => {
    const abc = new ArtByCity(arweave)

    const username = await abc
      .usernames
      .resolveUsernameFromAddress('invalid-address')

    expect(username).to.be.null
  })

  it('null when address does not resolve from username', async () => {
    const abc = new ArtByCity(arweave)

    const address = await abc
      .usernames
      .resolveAddressFromUsername('890782399999333999999999*(*(&9999999999')

    expect(address).to.be.null
  })

  it('throws when username contract not available', () => {
    const abc = new ArtByCity(arweave, {
      contracts: {
        usernames: 'bad-contract-id',
        curation: {
          ownable: 'bad-contract-id',
          whitelist: 'bad-contract-id',
          collaborative: 'bad-contract-id',
          collaborativeWhitelist: 'bad-contract-id'
        }
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    expect(abc.usernames.resolve(JIM_ADDRESS))
      .to.be.rejectedWith(Error)
  })
})
