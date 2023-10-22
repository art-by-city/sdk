import('mocha') // NB: this style import makes both webpack and typescript happy
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import * as sinon from 'sinon'
import sinonChai from 'sinon-chai'
import Arweave from 'arweave'

chai.use(chaiAsPromised)
chai.use(sinonChai)

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
const MODEL_SLUG = 'modified-icosahedron-3d'

const PROFILE_ID = '2aLkIcBH52s2LtZoyRQC_YaFGGSB2r2yGUtgYM5MjZc'
const ARTIST_ADDRESS = 'YftBIDY3rUeITuEhhXBHCGY77K6VkBj70STjRyGFE4k'
const LIKER_ADDRESS = '36Ar8VmyC7YS7JGaep9ca2ANjLABETTpxSeA7WOV45Y'
const LIKED_PUBLICATION = 'VAcSNlptOPg6Brf4Ur4tnmzziebTWux5VnWowHZkDLM'
const TIPPER_ADDRESS = 'Uy2XZ7P7F4zBllF5uPdd1ih9jiQrIGvD3X8L13cc5_s'
const TIPPEE_ADDRESS = 'x3GW6wfBZ3wHTflETInuzJ5rOv_6JvlFi-dl6yYAr8Y'
const JIM_ADDRESS = '36Ar8VmyC7YS7JGaep9ca2ANjLABETTpxSeA7WOV45Y'

const protocol = 'https'
const host = 'arweave.net'
const port = 443
const arweave = Arweave.init({ protocol, host, port })
const gatewayRoot = `${protocol}://${host}:${port}`

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

    context('Querying Publication Manifests', () => {
      it('Defaults to verified creators when querying', async () => {
        const abc = new ArtByCity(arweave)

        const { publications } = await abc.legacy.queryPublications()

        expect(publications).to.be.an('array')
        for (const publication of publications) {
          expect(publication.id).to.be.a('string')
          expect(publication.category).to.equal('artwork')
          expect(publication.subCategory)
            .to.be.oneOf(['image', 'audio', 'model'])
          expect(publication.slug).to.be.a('string')
        }
      })

      it('Allows specifying limit', async () => {
        const abc = new ArtByCity(arweave)
  
        const { publications } = await abc.legacy.queryPublications(5)
  
        expect(publications).to.be.an('array')
        expect(publications.length).to.equal(5)
      })

      // TODO -> re-enable this test when using arlocal mock data
      it.skip('Allows limit all', async () => {
        const abc = new ArtByCity(arweave)
  
        const { publications } = await abc.legacy.queryPublications('all')
  
        expect(publications).to.be.an('array')
        expect(publications.length).to.be.greaterThan(10)
      })

      it('Allows specifying cursor', async () => {
        const abc = new ArtByCity(arweave)
  
        const {
          publications: firstBatch,
          cursor
        } = await abc.legacy.queryPublications(1)
        const {
          publications: secondBatch
        } = await abc.legacy.queryPublications(1, undefined, cursor)
  
        expect(firstBatch).to.be.an('array')
        expect(secondBatch).to.be.an('array')
        expect(firstBatch).to.not.deep.equal(secondBatch)
      })
    })

    context('Fetching Publications', () => {
      it('Fetches a publication by id', async () => {
        const abc = new ArtByCity(arweave)

        const { publications } = await abc.legacy.queryPublications(1)
        const { id } = publications[0]
        const publication = await abc.legacy.fetchPublication(id)
  
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

      it('Fetches a publication by slug', async () => {
        const abc = new ArtByCity(arweave)

        const publication = await abc.legacy.fetchPublicationBySlug(MODEL_SLUG)

        expect(publication.id).to.be.a('string').with.length(43)
        expect(publication.category).to.equal('artwork')
        expect(publication.subCategory).to.be.oneOf(
          [ 'image', 'audio', 'model' ]
        )
        expect(publication.published).to.be.a('Date')
        expect(publication.year).to.be.a('string')
        expect(publication.slug).to.equal(MODEL_SLUG)
        expect(publication.title).to.be.a('string')
        expect(publication.images).to.not.be.empty
        expect(publication.images[0].image).to.be.a('string').with.length(43)
        expect(publication.images[0].preview).to.be.a('string').with.length(43)
        expect(publication.images[0].preview4k)
          .to.be.a('string')
          .with.length(43)
      })

      context('Fetches publication by slug or id', () => {
        it('by slug', async () => {
          const slug = MODEL_SLUG
          const abc = new ArtByCity(arweave)

          const publication = await abc.legacy.fetchPublicationBySlugOrId(slug)
          expect(publication.id).to.be.a('string').with.length(43)
          expect(publication.category).to.equal('artwork')
          expect(publication.subCategory).to.be.oneOf(
            [ 'image', 'audio', 'model' ]
          )
          expect(publication.slug).to.equal(MODEL_SLUG)
        })

        it('by id', async () => {
          const abc = new ArtByCity(arweave)

          const publication = await abc.legacy.fetchPublicationBySlugOrId(
            MODEL_MANIFEST_ID
          )
          expect(publication.id).to.be.a('string').with.length(43)
          expect(publication.category).to.equal('artwork')
          expect(publication.subCategory).to.be.oneOf(
            [ 'image', 'audio', 'model' ]
          )
        })
      })

      it('Fetches a publication by manifest id from bundle', async () => {
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

      it('Throws 404 on fetches by slug', () => {
        const abc = new ArtByCity(arweave)
        const badSlug = '404thisslugnotexistpleaselol'

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        expect(abc.legacy.fetchPublicationBySlug(badSlug)).to.be.rejectedWith(
          Error,
          `404 Publication Not Found: slug://${badSlug}`
        )
      })

      it('Throws 404 on fetches by slug or id', () => {
        const abc = new ArtByCity(arweave)
        const badSlug = '404thisslugnotexistpleaselol'

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        expect(abc.legacy.fetchPublicationBySlugOrId(badSlug))
          .to.be.rejectedWith(
            Error,
            `404 Publication Not Found: ar://${badSlug}`
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

    context('Fetching Avatars', () => {
      it('Fetches an avatar by address', async () => {
        const abc = new ArtByCity(arweave)

        const avatar = await abc.legacy.fetchAvatar(JIM_ADDRESS)

        expect(avatar).to.exist
        expect(avatar?.id).to.be.a('string').with.lengthOf(43)
        expect(avatar?.src).to.be.a('string')
        expect(avatar?.src.startsWith(gatewayRoot)).to.be.true
        expect(avatar?.src.endsWith(avatar?.id)).to.be.true
        expect(avatar?.contentType).to.be.a('string')
      })

      it('Returns null when avatar not found', async () => {
        const abc = new ArtByCity(arweave)
        const badAddress = '404aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaidontexist'

        const avatar = await abc.legacy.fetchAvatar(badAddress)

        expect(avatar).to.be.null
      })
    })

    context('Querying Likes', () => {
      context('By address', () => {
        it('Query likes received by address', async () => {
          const abc = new ArtByCity(arweave)
  
          const { likes } = await abc.legacy.queryLikes(
            ARTIST_ADDRESS,
            'received'
          )
  
          expect(likes).to.be.an('array')
          expect(likes).to.not.be.empty
          for (const like of likes) {
            expect(like.id).to.be.a('string')
            expect(like.amount).to.be.a('string')
            expect(like.from).to.be.a('string')
            expect(like.to).to.equal(ARTIST_ADDRESS)
            expect(like.timestamp).to.be.a('number')
            expect(like.liked).to.be.a('string')
          }
        })
  
        it('Query likes sent by address', async () => {
          const abc = new ArtByCity(arweave)
  
          const { likes } = await abc.legacy.queryLikes(
            LIKER_ADDRESS,
            'sent'
          )
  
          expect(likes).to.be.an('array')
          expect(likes).to.not.be.empty
          for (const like of likes) {
            expect(like.id).to.be.a('string')
            expect(like.amount).to.be.a('string')
            expect(like.from).to.equal(LIKER_ADDRESS)
            expect(like.to).to.be.a('string')
            expect(like.timestamp).to.be.a('number')
            expect(like.liked).to.be.a('string')
          }
        })

        it('Query likes given a limit', async () => {
          const abc = new ArtByCity(arweave)
  
          const { likes } = await abc.legacy.queryLikes(
            LIKER_ADDRESS,
            'sent',
            5
          )
  
          expect(likes).to.be.an('array')
          expect(likes).to.have.lengthOf(5)
        })
  
        // TODO -> re-enable this test when using arlocal mock data
        it.skip('Query likes given a limit of all', async () => {
          const abc = new ArtByCity(arweave)
  
          const { likes } = await abc.legacy.queryLikes(
            LIKER_ADDRESS,
            'sent',
            'all'
          )
  
          expect(likes).to.be.an('array')
          expect(likes).to.not.be.empty
          // TODO -> more specific test
        })
  
        it('Query likes given a cursor', async () => {
          const abc = new ArtByCity(arweave)
    
          const {
            likes: firstBatch,
            cursor
          } = await abc.legacy.queryLikes(LIKER_ADDRESS, 'sent', 5)
          const {
            likes: secondBatch
          } = await abc.legacy.queryLikes(LIKER_ADDRESS, 'sent', 5, cursor)
    
          expect(firstBatch).to.be.an('array')
          expect(secondBatch).to.be.an('array')
          expect(firstBatch).to.not.deep.equal(secondBatch)
        })
      })

      context('By publication', () => {
        it('Query likes received by publication', async () => {
          const abc = new ArtByCity(arweave)
  
          const { likes } = await abc
            .legacy
            .queryLikesForPublication(LIKED_PUBLICATION)
  
          expect(likes).to.be.an('array')
          expect(likes).to.not.be.empty
          for (const like of likes) {
            expect(like.id).to.be.a('string')
            expect(like.amount).to.be.a('string')
            expect(like.from).to.be.a('string')
            expect(like.to).to.be.a('string')
            expect(like.timestamp).to.be.a('number')
            expect(like.liked).to.equal(LIKED_PUBLICATION)
          }
        })

        it('Query likes given a limit', async () => {
          const abc = new ArtByCity(arweave)

          const { likes } = await abc
            .legacy
            .queryLikesForPublication(LIKED_PUBLICATION, 2)

          expect(likes).to.be.an('array')
          expect(likes).to.have.lengthOf(2)
        })

        // TODO -> re-enable this test when using arlocal mock data
        it.skip('Query likes given a limit of all', async () => {
          const abc = new ArtByCity(arweave)

          const { likes } = await abc
            .legacy
            .queryLikesForPublication(LIKED_PUBLICATION, 'all')

          expect(likes).to.be.an('array')
          expect(likes).to.not.be.empty
          // TODO -> more specific test
        })

        it('Query likes given a cursor', async () => {
          const abc = new ArtByCity(arweave)
    
          const {
            likes: firstBatch,
            cursor
          } = await abc
            .legacy
            .queryLikesForPublication(LIKED_PUBLICATION, 2)
          const {
            likes: secondBatch
          } = await abc
            .legacy
            .queryLikesForPublication(LIKED_PUBLICATION, 2, cursor)
    
          expect(firstBatch).to.be.an('array')
          expect(secondBatch).to.be.an('array')
          expect(firstBatch).to.not.deep.equal(secondBatch)
        })
      })
    })

    context('Querying Tips', () => {
      it('received by address', async () => {
        const abc = new ArtByCity(arweave)

        const { tips } = await abc.legacy.queryTips(TIPPEE_ADDRESS, 'received')

        expect(tips).to.be.an('array')
        expect(tips).to.not.be.empty
        for (const tip of tips) {
          expect(tip.id).to.be.a('string')
          expect(tip.amount).to.be.a('string')
          expect(tip.from).to.be.a('string')
          expect(tip.to).to.equal(TIPPEE_ADDRESS)
          expect(tip.timestamp).to.be.a('number')
        }
      })

      it('sent by address', async () => {
        const abc = new ArtByCity(arweave)

        const { tips } = await abc.legacy.queryTips(TIPPER_ADDRESS, 'sent')

        expect(tips).to.be.an('array')
        expect(tips).to.not.be.empty
        for (const tip of tips) {
          expect(tip.id).to.be.a('string')
          expect(tip.amount).to.be.a('string')
          expect(tip.from).to.equal(TIPPER_ADDRESS)
          expect(tip.to).to.be.a('string')
          expect(tip.timestamp).to.be.a('number')
        }
      })

      it('given a limit', async () => {
        const abc = new ArtByCity(arweave)

        const { tips } = await abc.legacy.queryTips(TIPPER_ADDRESS, 'sent', 2)

        expect(tips).to.be.an('array')
        expect(tips).to.have.lengthOf(2)
      })

      // TODO -> re-enable this test when using arlocal mock data
      it.skip('given a limit of all', async () => {
        const abc = new ArtByCity(arweave)

        const { tips } = await abc
          .legacy
          .queryTips(TIPPER_ADDRESS, 'sent', 'all')

        expect(tips).to.be.an('array')
        expect(tips).to.not.be.empty
        // TODO -> more specific test
      })

      it('given a cursor', async () => {
        const abc = new ArtByCity(arweave)
    
        const {
          tips: firstBatch,
          cursor
        } = await abc.legacy.queryTips(TIPPER_ADDRESS, 'sent', 2)
        const {
          tips: secondBatch
        } = await abc.legacy.queryTips(TIPPER_ADDRESS, 'sent', 2, cursor)
  
        expect(firstBatch).to.be.an('array')
        expect(secondBatch).to.be.an('array')
        expect(firstBatch).to.not.deep.equal(secondBatch)
      })
    })

    context('Resolving Usernames', () => {
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

    context('MemCache', () => {
      const sandbox = sinon.createSandbox()

      afterEach(() => {
        sandbox.restore()
      })

      context('Config', () => {
        it('defaults to using memcache', () => {
          const abc = new ArtByCity(arweave)

          expect(abc.config.cache.type).to.equal('memcache')
        })

        it('can be disabled via config', () => {
          const abc = new ArtByCity(arweave, { cache: { type: 'disabled' } } )

          expect(abc.config.cache.type).to.equal('disabled')
        })
      })

      context('Publications', () => {
        context('by publication id', () => {
          it('gets publication from memcache', async () => {
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.publications, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.publications, 'put')

            const publicationNoCache = await abc
              .legacy
              .fetchPublication(MODEL_MANIFEST_ID)

            const publicationFromCache = await abc
              .legacy
              .fetchPublication(MODEL_MANIFEST_ID)

            expect(publicationNoCache).to.deep.equal(publicationFromCache)
            expect(getSpy).to.have.been.calledTwice
            expect(putSpy).to.have.been.calledOnce
            expect(getSpy.firstCall).to.have.been.calledWith(MODEL_MANIFEST_ID)
            expect(getSpy.firstCall).to.have.returned(null)
            expect(putSpy.firstCall).to.have.been.calledWith(MODEL_MANIFEST_ID)
            expect(getSpy.secondCall).to.have.been.calledWith(MODEL_MANIFEST_ID)
            expect(getSpy.secondCall).to.have.returned(publicationNoCache)
          })
          
          it('allows force override of cache', async () => {
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.publications, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.publications, 'put')

            const publicationNoCache = await abc
              .legacy
              .fetchPublication(MODEL_MANIFEST_ID)

            const publicationCacheBust = await abc
              .legacy
              .fetchPublication(MODEL_MANIFEST_ID, false)

            expect(publicationNoCache).to.deep.equal(publicationCacheBust)
            expect(getSpy).to.have.been.calledOnce.and.returned(null)
            expect(putSpy).to.have.been.calledOnce
          })

          it('does not use cache when it is disabled', async () => {
            const abc = new ArtByCity(arweave, { cache: { type: 'disabled' } })

            const getSpy = sandbox.spy(abc.legacy.caches.publications, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.publications, 'put')

            const publicationNoCache = await abc
              .legacy
              .fetchPublication(MODEL_MANIFEST_ID)

            const publicationAlsoNoCache = await abc
              .legacy
              .fetchPublication(MODEL_MANIFEST_ID)

            expect(publicationNoCache).to.deep.equal(publicationAlsoNoCache)
            expect(getSpy).to.not.have.been.called
            expect(putSpy).to.not.have.been.called
          })
        })

        context('by slug', () => {
          it('gets publication from memcache', async () => {
            const manifestId = MODEL_MANIFEST_ID
            const abc = new ArtByCity(arweave)

            const getPubSpy = sandbox.spy(abc.legacy.caches.publications, 'get')
            const putPubSpy = sandbox.spy(abc.legacy.caches.publications, 'put')
            const getSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'get')
            const putSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'put')

            const publicationNoCache = await abc
              .legacy
              .fetchPublicationBySlug(MODEL_SLUG)

            const publicationFromCache = await abc
              .legacy
              .fetchPublicationBySlug(MODEL_SLUG)
            
            expect(publicationNoCache).to.deep.equal(publicationFromCache)
            expect(getPubSpy).to.have.been.calledTwice
            expect(putPubSpy).to.have.been.calledOnce
            expect(getPubSpy.firstCall).to.have.been.calledWith(manifestId)
            expect(getPubSpy.firstCall).to.have.returned(null)
            expect(putPubSpy.firstCall).to.have.been.calledWith(manifestId)
            expect(getPubSpy.secondCall).to.have.been.calledWith(manifestId)
            expect(getPubSpy.secondCall).to.have.returned(publicationNoCache)
            expect(getSlugSpy).to.have.been.calledTwice
            expect(putSlugSpy).to.have.been.calledOnce
            expect(getSlugSpy.firstCall).to.have.been.calledWith(MODEL_SLUG)
            expect(getSlugSpy.firstCall).to.have.returned(null)
            expect(putSlugSpy.firstCall).to.have.been.calledWith(MODEL_SLUG)
            expect(getSlugSpy.secondCall).to.have.been.calledWith(MODEL_SLUG)
            expect(getSlugSpy.secondCall).to.have.returned(manifestId)
          })

          it('allows force override of cache', async () => {
            const abc = new ArtByCity(arweave)

            const getPubSpy = sandbox.spy(abc.legacy.caches.publications, 'get')
            const putPubSpy = sandbox.spy(abc.legacy.caches.publications, 'put')
            const getSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'get')
            const putSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'put')

            const publicationNoCache = await abc
              .legacy
              .fetchPublicationBySlug(MODEL_SLUG)

            const publicationCacheBust = await abc
              .legacy
              .fetchPublicationBySlug(MODEL_SLUG, false)

            expect(publicationNoCache).to.deep.equal(publicationCacheBust)
            expect(getPubSpy).to.have.been.calledOnce.and.returned(null)
            expect(putPubSpy).to.have.been.calledOnce
            expect(getSlugSpy).to.have.been.calledOnce.and.returned(null)
            expect(putSlugSpy).to.have.been.calledOnce
          })

          it('does not use cache when it is disabled', async () => {
            const abc = new ArtByCity(arweave, { cache: { type: 'disabled' } })

            const getPubSpy = sandbox.spy(abc.legacy.caches.publications, 'get')
            const putPubSpy = sandbox.spy(abc.legacy.caches.publications, 'put')
            const getSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'get')
            const putSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'put')

            const publicationNoCache = await abc
              .legacy
              .fetchPublicationBySlug(MODEL_SLUG)

            const publicationAlsoNoCache = await abc
              .legacy
              .fetchPublicationBySlug(MODEL_SLUG)

            expect(publicationNoCache).to.deep.equal(publicationAlsoNoCache)
            expect(getPubSpy).to.not.have.been.called
            expect(putPubSpy).to.not.have.been.called
            expect(getSlugSpy).to.not.have.been.called
            expect(putSlugSpy).to.not.have.been.called
          })
        })

        context('by slug or id', () => {
          context('by id', () => {
            it('gets publication from memcache', async () => {
              const manifestId = MODEL_MANIFEST_ID
              const abc = new ArtByCity(arweave)

              const getPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'get'
              )
              const putPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'put'
              )
              const getSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'get')
              const putSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'put')
  
              const publicationNoCache = await abc
                .legacy
                .fetchPublicationBySlugOrId(manifestId)
  
              const publicationFromCache = await abc
                .legacy
                .fetchPublicationBySlugOrId(manifestId)
  
              expect(publicationNoCache).to.deep.equal(publicationFromCache)
              expect(getPubSpy).to.have.been.calledTwice
              expect(putPubSpy).to.have.been.calledOnce
              expect(getPubSpy.firstCall).to.have.been.calledWith(manifestId)
              expect(getPubSpy.firstCall).to.have.returned(null)
              expect(putPubSpy.firstCall).to.have.been.calledWith(manifestId)
              expect(getPubSpy.secondCall).to.have.been.calledWith(manifestId)
              expect(getPubSpy.secondCall).to.have.returned(publicationNoCache)
              expect(getSlugSpy).to.have.been.calledTwice
              expect(putSlugSpy).to.not.have.been.called
              expect(getSlugSpy.firstCall).to.have.been.calledWith(manifestId)
              expect(getSlugSpy.firstCall).to.have.returned(null)
              expect(getSlugSpy.secondCall).to.have.been.calledWith(manifestId)
              expect(getSlugSpy.secondCall).to.have.returned(null)
            })

            it('allows force override of cache', async () => {
              const manifestId = MODEL_MANIFEST_ID
              const abc = new ArtByCity(arweave)

              const getPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'get'
              )
              const putPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'put'
              )
              const getSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'get')
              const putSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'put')
  
              const publicationNoCache = await abc
                .legacy
                .fetchPublicationBySlugOrId(manifestId)
  
              const publicationCacheBust = await abc
                .legacy
                .fetchPublicationBySlugOrId(manifestId, false)
  
              expect(publicationNoCache).to.deep.equal(publicationCacheBust)
              expect(getPubSpy).to.have.been.calledOnce.and.returned(null)
              expect(putPubSpy).to.have.been.calledOnce
              expect(getSlugSpy).to.have.been.calledOnce.and.returned(null)
              expect(putSlugSpy).to.not.have.been.called
            })

            it('does not use cache when it is disabled', async () => {
              const manifestId = MODEL_MANIFEST_ID
              const abc = new ArtByCity(arweave, {
                cache: { type: 'disabled' }
              })

              const getPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'get'
              )
              const putPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'put'
              )
              const getSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'get')
              const putSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'put')

              const publicationNoCache = await abc
                .legacy
                .fetchPublicationBySlugOrId(manifestId)

              const publicationAlsoNoCache = await abc
                .legacy
                .fetchPublicationBySlugOrId(manifestId, false)

              expect(publicationNoCache).to.deep.equal(publicationAlsoNoCache)
              expect(getPubSpy).to.not.have.been.called
              expect(putPubSpy).to.not.have.been.called
              expect(getSlugSpy).to.not.have.been.called
              expect(putSlugSpy).to.not.have.been.called
            })
          })

          context('by slug', () => {
            it('gets publication from memcache', async () => {
              const slug = MODEL_SLUG
              const manifestId = MODEL_MANIFEST_ID
              const abc = new ArtByCity(arweave)

              const getPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'get'
              )
              const putPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'put'
              )
              const getSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'get')
              const putSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'put')
  
              const publicationNoCache = await abc
                .legacy
                .fetchPublicationBySlugOrId(slug)
  
              const publicationFromCache = await abc
                .legacy
                .fetchPublicationBySlugOrId(slug)
  
              expect(publicationNoCache).to.deep.equal(publicationFromCache)
              expect(getPubSpy).to.have.been.calledTwice
              expect(putPubSpy).to.have.been.calledOnce
              expect(getPubSpy.firstCall).to.have.been.calledWith(manifestId)
              expect(getPubSpy.firstCall).to.have.returned(null)
              expect(putPubSpy.firstCall).to.have.been.calledWith(manifestId)
              expect(getPubSpy.secondCall).to.have.been.calledWith(manifestId)
              expect(getPubSpy.secondCall)
                .to.have.returned(publicationNoCache)
              expect(getSlugSpy).to.have.been.calledTwice
              expect(putSlugSpy).to.have.been.calledOnce
              expect(getSlugSpy.firstCall).to.have.been.calledWith(slug)
              expect(getSlugSpy.firstCall).to.have.returned(null)
              expect(getSlugSpy.secondCall).to.have.been.calledWith(slug)
              expect(getSlugSpy.secondCall).to.have.returned(manifestId)
            })

            it('allows force override of cache', async () => {
              const slug = MODEL_SLUG
              const abc = new ArtByCity(arweave)

              const getPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'get'
              )
              const putPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'put'
              )
              const getSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'get')
              const putSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'put')
  
              const publicationNoCache = await abc
                .legacy
                .fetchPublicationBySlugOrId(slug)
  
              const publicationCacheBust = await abc
                .legacy
                .fetchPublicationBySlugOrId(slug, false)
  
              expect(publicationNoCache).to.deep.equal(publicationCacheBust)
              expect(getPubSpy).to.have.been.calledOnce.and.returned(null)
              expect(putPubSpy).to.have.been.calledOnce
              expect(getSlugSpy).to.have.been.calledOnce.and.returned(null)
              expect(putSlugSpy).to.have.been.calledOnce
            })

            it('does not use cache when it is disabled', async () => {
              const slug = MODEL_SLUG
              const abc = new ArtByCity(arweave, {
                cache: { type: 'disabled' }
              })

              const getPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'get'
              )
              const putPubSpy = sandbox.spy(
                abc.legacy.caches.publications,
                'put'
              )
              const getSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'get')
              const putSlugSpy = sandbox.spy(abc.legacy.caches.slugs, 'put')

              const publicationNoCache = await abc
                .legacy
                .fetchPublicationBySlugOrId(slug)

              const publicationAlsoNoCache = await abc
                .legacy
                .fetchPublicationBySlugOrId(slug, false)

              expect(publicationNoCache).to.deep.equal(publicationAlsoNoCache)
              expect(getPubSpy).to.not.have.been.called
              expect(putPubSpy).to.not.have.been.called
              expect(getSlugSpy).to.not.have.been.called
              expect(putSlugSpy).to.not.have.been.called
            })
          })
        })
      })

      context('Profiles', () => {
        it('gets profiles from memcache', async () => {
          const abc = new ArtByCity(arweave)

          const getSpy = sandbox.spy(abc.legacy.caches.profiles, 'get')
          const putSpy = sandbox.spy(abc.legacy.caches.profiles, 'put')

          const profileNoCache = await abc.legacy.fetchProfile(PROFILE_ID)
          const profileFromCache = await abc.legacy.fetchProfile(PROFILE_ID)

          expect(profileNoCache).to.deep.equal(profileFromCache)
          expect(getSpy).to.have.been.calledTwice
          expect(putSpy).to.have.been.calledOnce
          expect(getSpy.firstCall).to.have.been.calledWith(PROFILE_ID)
          expect(getSpy.firstCall).to.have.returned(null)
          expect(putSpy.firstCall).to.have.been.calledWith(PROFILE_ID)
          expect(getSpy.secondCall).to.have.been.calledWith(PROFILE_ID)
          expect(getSpy.secondCall).to.have.returned(profileNoCache)
        })

        it('allows force override of cache', async () => {
          const abc = new ArtByCity(arweave)

          const getSpy = sandbox.spy(abc.legacy.caches.profiles, 'get')
          const putSpy = sandbox.spy(abc.legacy.caches.profiles, 'put')

          const profileNoCache = await abc.legacy.fetchProfile(PROFILE_ID)
          const profileCacheBust = await abc
            .legacy
            .fetchProfile(PROFILE_ID, false)

          expect(profileNoCache).to.deep.equal(profileCacheBust)
          expect(getSpy).to.have.been.calledOnce.and.returned(null)
          expect(putSpy).to.have.been.calledOnce
        })

        it('does not use cache when it is disabled', async () => {
          const abc = new ArtByCity(arweave, { cache: { type: 'disabled' } })

          const getSpy = sandbox.spy(abc.legacy.caches.profiles, 'get')
          const putSpy = sandbox.spy(abc.legacy.caches.profiles, 'put')

          const profileNoCache = await abc.legacy.fetchProfile(PROFILE_ID)
          const profileAlsoNoCache = await abc.legacy.fetchProfile(PROFILE_ID)

          expect(profileNoCache).to.deep.equal(profileAlsoNoCache)
          expect(getSpy).to.not.have.been.called
          expect(putSpy).to.not.have.been.called
        })
      })

      context('Avatars', () => {
        it('gets avatars from memcache', async () => {
          const address = JIM_ADDRESS
          const abc = new ArtByCity(arweave)

          const getSpy = sandbox.spy(abc.legacy.caches.avatars, 'get')
          const putSpy = sandbox.spy(abc.legacy.caches.avatars, 'put')

          const avatarNoCache = await abc.legacy.fetchAvatar(address)
          const avatarFromCache = await abc.legacy.fetchAvatar(address)

          expect(avatarNoCache).to.deep.equal(avatarFromCache)

          expect(getSpy).to.have.been.calledTwice
          expect(putSpy).to.have.been.calledOnce
          expect(getSpy.firstCall).to.have.been.calledWith(address)
          expect(getSpy.firstCall).to.have.returned(null)
          expect(putSpy.firstCall).to.have.been.calledWith(address)
          expect(getSpy.secondCall).to.have.been.calledWith(address)
          expect(getSpy.secondCall).to.have.returned(avatarNoCache)
        })

        it('allows force override of cache', async () => {
          const address = JIM_ADDRESS
          const abc = new ArtByCity(arweave)

          const getSpy = sandbox.spy(abc.legacy.caches.avatars, 'get')
          const putSpy = sandbox.spy(abc.legacy.caches.avatars, 'put')

          const avatarNoCache = await abc.legacy.fetchAvatar(address)
          const avatarCacheBust = await abc.legacy.fetchAvatar(address, false)

          expect(avatarNoCache).to.deep.equal(avatarCacheBust)
          expect(getSpy).to.have.been.calledOnce.and.returned(null)
          expect(putSpy).to.have.been.calledOnce
        })

        it('does not use cache when it is disabled', async () => {
          const address = JIM_ADDRESS
          const abc = new ArtByCity(arweave, { cache: { type: 'disabled' } })

          const getSpy = sandbox.spy(abc.legacy.caches.avatars, 'get')
          const putSpy = sandbox.spy(abc.legacy.caches.avatars, 'put')

          const avatarNoCache = await abc.legacy.fetchAvatar(address)
          const avatarAlsoNoCache = await abc.legacy.fetchAvatar(address)

          expect(avatarNoCache).to.deep.equal(avatarAlsoNoCache)
          expect(getSpy).to.not.have.been.called
          expect(putSpy).to.not.have.been.called
        })
      })

      context('Likes', () => {
        context('sent by address', () => {
          it('gets queries for all likes from memcache', async () => {
            const address = LIKER_ADDRESS
            const cacheKey = `sent-by-${address}`
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')

            const likesNoCache = await abc.legacy.queryLikes(address, 'sent')
            const likesFromCache = await abc.legacy.queryLikes(address, 'sent')

            expect(likesNoCache).to.deep.equal(likesFromCache)
            expect(getSpy).to.have.been.calledTwice
            expect(putSpy).to.have.been.calledOnce
            expect(getSpy.firstCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.firstCall).to.have.returned(null)
            expect(putSpy.firstCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.secondCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.secondCall).to.have.returned(likesNoCache)
          })

          it('allows force override of cache', async () => {
            const address = LIKER_ADDRESS
            const abc = new ArtByCity(arweave)
  
            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')
  
            const likesNoCache = await abc.legacy.queryLikes(address, 'sent')
            const likesCacheBust = await abc.legacy
              .queryLikes(address, 'sent', 'all', undefined, false)
  
            expect(likesNoCache).to.deep.equal(likesCacheBust)
            expect(getSpy).to.have.been.calledOnce.and.returned(null)
            expect(putSpy).to.have.been.calledOnce
          })

          it('does not use cache when it is disabled', async () => {
            const address = LIKER_ADDRESS
            const abc = new ArtByCity(arweave, { cache: { type: 'disabled' } })
  
            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')
  
            const likesNoCache = await abc.legacy.queryLikes(address, 'sent')
            const likesAlsoNoCache = await abc.legacy
              .queryLikes(address, 'sent')
  
            expect(likesNoCache).to.deep.equal(likesAlsoNoCache)
            expect(getSpy).to.not.have.been.called
            expect(putSpy).to.not.have.been.called
          })

          it('does not use cache when not querying for all', async () => {
            const address = LIKER_ADDRESS
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')

            const threeLikes = await abc.legacy.queryLikes(address, 'sent', 3)
            const alsoThreeLikes = await abc.legacy
              .queryLikes(address, 'sent', 3)

            expect(threeLikes.likes).to.deep.equal(alsoThreeLikes.likes)
            expect(getSpy).to.not.have.been.called
            expect(putSpy).to.not.have.been.called
          })
        })

        context('received by address', () => {
          it('gets queries for all likes from memcache', async () => {
            const address = ARTIST_ADDRESS
            const cacheKey = `received-by-${address}`
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')

            const likesNoCache = await abc.legacy
              .queryLikes(address, 'received')
            const likesFromCache = await abc.legacy
              .queryLikes(address, 'received')

            expect(likesNoCache).to.deep.equal(likesFromCache)
            expect(getSpy).to.have.been.calledTwice
            expect(putSpy).to.have.been.calledOnce
            expect(getSpy.firstCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.firstCall).to.have.returned(null)
            expect(putSpy.firstCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.secondCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.secondCall).to.have.returned(likesNoCache)
          })

          it('allows force override of cache', async () => {
            const address = ARTIST_ADDRESS
            const abc = new ArtByCity(arweave)
  
            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')
  
            const likesNoCache = await abc.legacy
              .queryLikes(address, 'received')
            const likesCacheBust = await abc.legacy
              .queryLikes(address, 'received', 'all', undefined, false)
  
            expect(likesNoCache).to.deep.equal(likesCacheBust)
            expect(getSpy).to.have.been.calledOnce.and.returned(null)
            expect(putSpy).to.have.been.calledOnce
          })

          it('does not use cache when it is disabled', async () => {
            const address = ARTIST_ADDRESS
            const abc = new ArtByCity(arweave, { cache: { type: 'disabled' } })
  
            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')
  
            const likesNoCache = await abc.legacy
              .queryLikes(address, 'received')
            const likesAlsoNoCache = await abc.legacy
              .queryLikes(address, 'received')
  
            expect(likesNoCache).to.deep.equal(likesAlsoNoCache)
            expect(getSpy).to.not.have.been.called
            expect(putSpy).to.not.have.been.called
          })

          it('does not use cache when not querying for all', async () => {
            const address = ARTIST_ADDRESS
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')

            const threeLikes = await abc.legacy
              .queryLikes(address, 'received', 3)
            const alsoThreeLikes = await abc.legacy
              .queryLikes(address, 'received', 3)

            expect(threeLikes.likes).to.deep.equal(alsoThreeLikes.likes)
            expect(getSpy).to.not.have.been.called
            expect(putSpy).to.not.have.been.called
          })
        })

        context('by publication', () => {
          it('gets queries for all likes from memcache', async () => {
            const id = LIKED_PUBLICATION
            const cacheKey = `likes-for-${id}`
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')

            const likesNoCache = await abc.legacy
              .queryLikesForPublication(id)
            const likesFromCache = await abc.legacy
              .queryLikesForPublication(id)

            expect(likesNoCache).to.deep.equal(likesFromCache)
            expect(getSpy).to.have.been.calledTwice
            expect(putSpy).to.have.been.calledOnce
            expect(getSpy.firstCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.firstCall).to.have.returned(null)
            expect(putSpy.firstCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.secondCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.secondCall).to.have.returned(likesNoCache)
          })

          it('allows force override of cache', async () => {
            const id = LIKED_PUBLICATION
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')

            const likesNoCache = await abc.legacy
              .queryLikesForPublication(id)
            const likesCacheBust = await abc.legacy
              .queryLikesForPublication(id, 'all', undefined, false)

            expect(likesNoCache.likes).to.deep.equal(likesCacheBust.likes)
            expect(getSpy).to.have.been.calledOnce.and.returned(null)
            expect(putSpy).to.have.been.calledOnce
          })

          it('does not use cache when it is disabled', async () => {
            const id = LIKED_PUBLICATION
            const abc = new ArtByCity(arweave, { cache: { type: 'disabled' } })

            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')

            const likesNoCache = await abc.legacy
              .queryLikesForPublication(id)
            const likesAlsoNoCache = await abc.legacy
              .queryLikesForPublication(id)

            expect(likesNoCache).to.deep.equal(likesAlsoNoCache)
            expect(getSpy).to.not.have.been.called
            expect(putSpy).to.not.have.been.called
          })

          it('does not use cache when not querying for all', async () => {
            const id = LIKED_PUBLICATION
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.likes, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.likes, 'put')

            const threeLikes = await abc.legacy
              .queryLikesForPublication(id, 3)
            const alsoThreeLikes = await abc.legacy
              .queryLikesForPublication(id, 3)

            expect(threeLikes.likes).to.deep.equal(alsoThreeLikes.likes)
            expect(getSpy).to.not.have.been.called
            expect(putSpy).to.not.have.been.called
          })
        })
      })

      context('Tips', () => {
        context('sent by address', () => {
          it('gets queries for all tips from memcache', async () => {
            const address = TIPPER_ADDRESS
            const cacheKey = `sent-by-${address}`
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.tips, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.tips, 'put')

            const tipsNoCache = await abc.legacy.queryTips(address, 'sent')
            const tipsFromCache = await abc.legacy.queryTips(address, 'sent')

            expect(tipsNoCache).to.deep.equal(tipsFromCache)
            expect(getSpy).to.have.been.calledTwice
            expect(putSpy).to.have.been.calledOnce
            expect(getSpy.firstCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.firstCall).to.have.returned(null)
            expect(putSpy.firstCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.secondCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.secondCall).to.have.returned(tipsNoCache)
          })

          it('allows force override of cache', async () => {
            const address = TIPPER_ADDRESS
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.tips, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.tips, 'put')

            const tipsNoCache = await abc.legacy.queryTips(address, 'sent')
            const tipsCacheBust = await abc.legacy
              .queryTips(address, 'sent', 'all', undefined, false)
  
            expect(tipsNoCache).to.deep.equal(tipsCacheBust)
            expect(getSpy).to.have.been.calledOnce.and.returned(null)
            expect(putSpy).to.have.been.calledOnce
          })

          it('does not use cache when it is disabled', async () => {
            const address = TIPPER_ADDRESS
            const abc = new ArtByCity(arweave, { cache: { type: 'disabled' } })

            const getSpy = sandbox.spy(abc.legacy.caches.tips, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.tips, 'put')

            const tipsNoCache = await abc.legacy.queryTips(address, 'sent')
            const tipsAlsoNoCache = await abc.legacy.queryTips(address, 'sent')

            expect(tipsNoCache).to.deep.equal(tipsAlsoNoCache)
            expect(getSpy).to.not.have.been.called
            expect(putSpy).to.not.have.been.called
          })

          it('does not use cache when not querying for all', async () => {
            const address = TIPPER_ADDRESS
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.tips, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.tips, 'put')

            const threeTips = await abc.legacy.queryTips(address, 'sent', 3)
            const alsoThreeTips = await abc.legacy.queryTips(address, 'sent', 3)

            expect(threeTips.tips).to.deep.equal(alsoThreeTips.tips)
            expect(getSpy).to.not.have.been.called
            expect(putSpy).to.not.have.been.called
          })
        })

        context('received by address', () => {
          it('gets queries for all tips from memcache', async () => {
            const address = TIPPEE_ADDRESS
            const cacheKey = `received-by-${address}`
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.tips, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.tips, 'put')

            const tipsNoCache = await abc.legacy
              .queryTips(address, 'received')
            const tipsFromCache = await abc.legacy
              .queryTips(address, 'received')

            expect(tipsNoCache).to.deep.equal(tipsFromCache)
            expect(getSpy).to.have.been.calledTwice
            expect(putSpy).to.have.been.calledOnce
            expect(getSpy.firstCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.firstCall).to.have.returned(null)
            expect(putSpy.firstCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.secondCall).to.have.been.calledWith(cacheKey)
            expect(getSpy.secondCall).to.have.returned(tipsNoCache)
          })

          it('allows force override of cache', async () => {
            const address = TIPPEE_ADDRESS
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.tips, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.tips, 'put')

            const tipsNoCache = await abc.legacy.queryTips(address, 'received')
            const tipsCacheBust = await abc.legacy
              .queryTips(address, 'received', 'all', undefined, false)
  
            expect(tipsNoCache).to.deep.equal(tipsCacheBust)
            expect(getSpy).to.have.been.calledOnce.and.returned(null)
            expect(putSpy).to.have.been.calledOnce
          })

          it('does not use cache when it is disabled', async () => {
            const address = TIPPEE_ADDRESS
            const abc = new ArtByCity(arweave, { cache: { type: 'disabled' } })

            const getSpy = sandbox.spy(abc.legacy.caches.tips, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.tips, 'put')

            const tipsNoCache = await abc.legacy.queryTips(address, 'received')
            const tipsAlsoNoCache = await abc.legacy
              .queryTips(address, 'received')

            expect(tipsNoCache).to.deep.equal(tipsAlsoNoCache)
            expect(getSpy).to.not.have.been.called
            expect(putSpy).to.not.have.been.called
          })

          it('does not use cache when not querying for all', async () => {
            const address = TIPPEE_ADDRESS
            const abc = new ArtByCity(arweave)

            const getSpy = sandbox.spy(abc.legacy.caches.tips, 'get')
            const putSpy = sandbox.spy(abc.legacy.caches.tips, 'put')

            const threeTips = await abc.legacy.queryTips(address, 'received', 3)
            const alsoThreeTips = await abc.legacy
              .queryTips(address, 'received', 3)

            expect(threeTips.tips).to.deep.equal(alsoThreeTips.tips)
            expect(getSpy).to.not.have.been.called
            expect(putSpy).to.not.have.been.called
          })
        })
      })
    })
  })
})
