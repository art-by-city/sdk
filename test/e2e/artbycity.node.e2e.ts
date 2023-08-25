import 'mocha'
import { expect } from 'chai'

import ArtByCity from '../../dist/node'

describe('ArtByCity (Node)', () => {
  it('Should pass test', () => {
    const message = 'This is a test message!'
    const abc = new ArtByCity(message)

    expect(abc.getMessage()).to.equal(message)
  })
})
