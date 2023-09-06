import('mocha') // NB: this style import makes both webpack and typescript happy
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Arweave from 'arweave'

chai.use(chaiAsPromised)

import ArtByCity from '../../dist/web'
import VerifiedCreators from '../../dist/web/legacy/verified-creators.json'

// TODO -> change to arlocal txids

// Ancient Publication GIF from TodComplex
// const ANCIENT_LEGACY_GIF_PUBLICATION =
//   '-UMDjHJtPXqzQftxB-D56J-RklN2lTJCvbGSUiKDOyA'

// const GIF_BUNDLE_ID = 'STcJRLvWlCqMnUlSJyc__2u82JQ963F4kNNa9YcwWuY'
const GIF_MANIFEST_ID = 'K5RHKPb1YQ8rV5OMfrItqk0712OXjf2Wl6qDmJef0x8'
// const AUDIO_BUNDLE_ID = 'BgRQtrLdwexvWcbP5RKheYRGnQUsAZtZ6uKD_5A-CzE'
const AUDIO_MANIFEST_ID = 'q0GSg9bSntJQIj-FiHYApMat1e20EGM2JkdgrkhtZjI'
// const MODEL_BUNDLE_ID = 'gUIU8bTV1vGLTQc3gZ3TWfRkHGRHJYTnr0vrNUjm5CA'
const MODEL_MANIFEST_ID = 'N_nbvz1vWrNI1kl0Nxefgi3Zo0p9F-onoF1mafWaKUU'
// const LICENSE_BUNDLE_ID = 'BgRQtrLdwexvWcbP5RKheYRGnQUsAZtZ6uKD_5A-CzE'
const LICENSE_MANIFEST_ID = 'q0GSg9bSntJQIj-FiHYApMat1e20EGM2JkdgrkhtZjI'

const PROFILE_ID = '2aLkIcBH52s2LtZoyRQC_YaFGGSB2r2yGUtgYM5MjZc'

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

    context('Querying Publication Bundles', () => {
      it('Defaults to verified creators when querying', async () => {
        const abc = new ArtByCity(arweave)
  
        const { bundles } = await abc.legacy.queryPublicationBundles()
  
        expect(bundles).to.be.an('array')
        for (const bundle of bundles) {
          expect(bundle.category).to.equal('artwork:bundle')
          expect(bundle.id).to.be.a('string')
          expect(bundle.manifestId).to.be.a('string')
          expect(bundle.slug).to.be.a('string')
        }
      })

      it('Allows specifying limit', async () => {
        const abc = new ArtByCity(arweave)
  
        const { bundles } = await abc.legacy.queryPublicationBundles(5)
  
        expect(bundles).to.be.an('array')
        expect(bundles.length).to.equal(5)
      })
  
      // TODO -> re-enable this test when using arlocal mock data
      it.skip('Allows limit all', async () => {
        const abc = new ArtByCity(arweave)
  
        const { bundles } = await abc.legacy.queryPublicationBundles('all')
  
        expect(bundles).to.be.an('array')
        expect(bundles.length).to.be.greaterThan(10)
      })
  
      it('Allows specifying cursor', async () => {
        const abc = new ArtByCity(arweave)
  
        const {
          bundles: firstBatch,
          cursor
        } = await abc.legacy.queryPublicationBundles(1)
        const {
          bundles: secondBatch
        } = await abc.legacy.queryPublicationBundles(1, undefined, cursor)
  
        expect(firstBatch).to.be.an('array')
        expect(secondBatch).to.be.an('array')
        expect(firstBatch).to.not.deep.equal(secondBatch)
      })
    })

    context('Fetching Publications', () => {
      it('Fetches a publication by manifest id', async () => {
        const abc = new ArtByCity(arweave)
  
        const { bundles } = await abc.legacy.queryPublicationBundles(1)
        const { manifestId } = bundles[0]
        const publication = await abc.legacy.fetchPublication(manifestId)
  
        expect(publication.id).to.be.a('string').with.length(43)
        expect(publication.category).to.equal('artwork')
        expect(publication.subCategory).to.be.oneOf(
          [ 'image', 'audio', 'model' ]
        )
        expect(publication.published).to.be.a('Date')
        expect(publication.year).to.be.a('string')
        expect(publication.slug).to.be.a('string')
        expect(publication.title).to.be.a('string')
        expect(publication.images).to.not.be.empty
        expect(publication.images[0].image).to.be.a('string').with.length(43)
        expect(publication.images[0].preview).to.be.a('string').with.length(43)
        expect(publication.images[0].preview4k)
          .to.be.a('string')
          .with.length(43)
      })
  
      it('Includes legacy licenses from manifests', async () => {
        const abc = new ArtByCity(arweave)
  
        const publication = await abc.legacy.fetchPublication(
          LICENSE_MANIFEST_ID
        )
  
        expect(publication.license).to.be.an('object')
        expect(publication.license?.reference).to.be.a('string')
        expect(publication.license?.detailsUrl).to.be.a('string')
        expect(publication.license?.name).to.be.a('string')
        expect(publication.license?.licenseId).to.be.a('string')
        expect(publication.license?.seeAlso).to.be.an('array')
        expect(publication.license?.seeAlso).to.not.be.empty
      })
  
      it('Fetches gif publications', async () => {
        const abc = new ArtByCity(arweave)
  
        const publication = await abc.legacy.fetchPublication(GIF_MANIFEST_ID)
  
        expect(publication.id).to.be.a('string').with.length(43)
        expect(publication.category).to.equal('artwork')
        expect(publication.subCategory).to.be.equal('image')
        expect(publication.published).to.be.a('Date')
        expect(publication.year).to.be.a('string')
        expect(publication.slug).to.be.a('string')
        expect(publication.title).to.be.a('string')
        expect(publication.images).to.not.be.empty
        expect(publication.images[0].image).to.be.a('string').with.length(43)
        expect(publication.images[0].preview).to.be.a('string').with.length(43)
        expect(publication.images[0].preview4k)
          .to.be.a('string')
          .with.length(43)
        expect(publication.images[0].animated).to.be.true
      })
  
      it('Fetches audio publications', async () => {
        const abc = new ArtByCity(arweave)
  
        const publication = await abc.legacy.fetchPublication(AUDIO_MANIFEST_ID)
  
        expect(publication.id).to.be.a('string').with.length(43)
        expect(publication.category).to.equal('artwork')
        expect(publication.subCategory).to.be.equal('audio')
        expect(publication.published).to.be.a('Date')
        expect(publication.year).to.be.a('string')
        expect(publication.slug).to.be.a('string')
        expect(publication.title).to.be.a('string')
        expect(publication.genre).to.be.a('string')
        expect(publication.city).to.be.a('string')
        expect(publication.images).to.not.be.empty
        expect(publication.images[0].image).to.be.a('string').with.length(43)
        expect(publication.images[0].preview).to.be.a('string').with.length(43)
        expect(publication.images[0].preview4k)
          .to.be.a('string')
          .with.length(43)
        expect(publication.audio).to.be.a('string')
      })
  
      it('Fetches model publications', async () => {
        const abc = new ArtByCity(arweave)
  
        const publication = await abc.legacy.fetchPublication(MODEL_MANIFEST_ID)
  
        expect(publication.id).to.be.a('string').with.length(43)
        expect(publication.category).to.equal('artwork')
        expect(publication.subCategory).to.be.equal('model')
        expect(publication.published).to.be.a('Date')
        expect(publication.year).to.be.a('string')
        expect(publication.slug).to.be.a('string')
        expect(publication.title).to.be.a('string')
        expect(publication.images).to.not.be.empty
        expect(publication.images[0].image).to.be.a('string').with.length(43)
        expect(publication.images[0].preview).to.be.a('string').with.length(43)
        expect(publication.images[0].preview4k)
          .to.be.a('string')
          .with.length(43)
        expect(publication.model).to.be.a('string')
      })
  
      it('Throws on 404 fetches', () => {
        const abc = new ArtByCity(arweave)
        const badManifestId = '404aaaaaaaaaaaaaaaaaaaawhereismytransaction'
  
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        expect(abc.legacy.fetchPublication(badManifestId)).to.be.rejectedWith(
          Error,
          `404 Publication Not Found: ar://${badManifestId}`
        )
      })
    })

    context('Fetching Profiles', () => {
      it('Fetches a profile by address', async () => {
        const abc = new ArtByCity(arweave)
        
        const profile = await abc.legacy.fetchProfile(PROFILE_ID)

        expect(profile).to.exist
        expect(profile?.displayName).to.be.a('string')
        expect(profile?.bio).to.be.a('string')
        expect(profile?.twitter).to.be.a('string')
        expect(profile?.x).to.be.a('string')
        expect(profile?.instagram).to.be.a('string')
        expect(profile?.twitch).to.be.a('string')
        // TODO -> test soundcloud, linkedin
        // expect(profile.soundcloud).to.be.a('string')
        // expect(profile.linkedin).to.be.a('string')
      })

      it('Returns null when profile not found', async () => {
        const abc = new ArtByCity(arweave)
        const badAddress = '404aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaidontexist'

        const profile = await abc.legacy.fetchProfile(badAddress)

        expect(profile).to.be.null
      })
    })
  })
})
