import { expect } from 'chai'

import ArtByCity from '../../dist/web'

describe('ArtByCity (Web)', () => {
  it('Should pass test', () => {
    const message = 'This is a test message!'
    const abc = new ArtByCity(message)

    expect(abc.getMessage()).to.equal(message)
  })
})
