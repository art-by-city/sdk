import('mocha') // NB: this style import makes both webpack and typescript happy
import { expect } from 'chai'
import Arweave from 'arweave'

import ArtByCity from '../../dist/web'
import VerifiedCreators from '../../dist/web/legacy/verified-creators.json'

const arweave = Arweave.init({
  protocol: 'https',
  host: 'arweave.net',
  port: 443
})

describe(`ArtByCity (web)`, () => {
  it('Constructs with default Arweave instance', () => {
    const abc = new ArtByCity()

    expect(abc.arweave).to.be.an.instanceOf(Arweave)
  })

  it('Constructs given an Arweave instance', () => {
    const abc = new ArtByCity(arweave)

    expect(abc.arweave).to.equal(arweave)
  })

  describe('Legacy Module', () => {
    it('Gets verified creator addresses', () => {
      const abc = new ArtByCity(arweave)

      expect(abc.legacy.verifiedCreators)
        .to.deep.equal(VerifiedCreators.production)
    })

    it('Gets verified creator publication feed', async () => {
      const abc = new ArtByCity(arweave)

      const { bundles } = await abc.legacy.feed()

      expect(bundles).to.be.an('array')
      for (const bundle of bundles) {
        expect(bundle.category).to.equal('artwork:bundle')
        expect(bundle.id).to.be.a('string')
        expect(bundle.manifestId).to.be.a('string')
        expect(bundle.slug).to.be.a('string')
      }
    })

    it('Allows specifying limit when fetching publication feed', async () => {
      const abc = new ArtByCity(arweave)

      const { bundles } = await abc.legacy.feed(5)

      expect(bundles).to.be.an('array')
      expect(bundles.length).to.equal(5)
    })

    // TODO -> re-enable this test when using arlocal mock data
    it.skip('Allows specifying all when fetching publication feed', async () => {
      const abc = new ArtByCity(arweave)

      const { bundles } = await abc.legacy.feed('all')

      expect(bundles).to.be.an('array')
      expect(bundles.length).to.be.greaterThan(10)
    })

    it('Allows specifying cursor when fetching publication feed', async () => {
      const abc = new ArtByCity(arweave)

      const {
        bundles: firstBatch,
        cursor
      } = await abc.legacy.feed(1)
      const {
        bundles: secondBatch
      } = await abc.legacy.feed(1, undefined, cursor)

      expect(firstBatch).to.be.an('array')
      expect(secondBatch).to.be.an('array')
      expect(firstBatch).to.not.deep.equal(secondBatch)
    })

    it('Fetches artwork by manifest id', async () => {
      const abc = new ArtByCity(arweave)

      const { bundles } = await abc.legacy.feed(1)
      const { manifestId } = bundles[0]
      const publication = await abc.legacy.fetch(manifestId)

      expect(publication.id).to.be.a('string').with.length(43)
      expect(publication.category).to.equal('artwork')
      expect(publication.subCategory).to.be.oneOf([ 'image', 'audio', 'model' ])
      expect(publication.published).to.be.a('Date')
      expect(publication.year).to.be.a('string')
      expect(publication.slug).to.be.a('string')
      expect(publication.title).to.be.a('string')
      expect(publication.images).to.not.be.empty
      expect(publication.images[0].image).to.be.a('string').with.length(43)
      expect(publication.images[0].preview).to.be.a('string').with.length(43)
      expect(publication.images[0].preview4k).to.be.a('string').with.length(43)
    })
  })
})
