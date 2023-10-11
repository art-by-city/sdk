# Art By City SDK

## Requirements
Node 18 LTS

## Install
`npm i @artbycity/sdk`

## API

### Creating a Client

The client comes with defaults built in to use either `arweave.net` or, if being 
served from a permaweb dapp, the current gateway.
```ts
import ArtByCity from '@artbycity/sdk'

const abc = new ArtByCity()
```

You can optionally pass your own instance of the `Arweave` client.
```ts
import ArtByCity from '@artbycity/sdk'
import Arweave from 'arweave'

const arweave = Arweave.init({})
const abc = new ArtByCity(arweave)
```

You can optionally override the ArtByCity client default configuration.  All 
configuration overrides are optional and have defaults depending on 
`environment`.
```ts
import ArtByCity, { ArtByCityConfig } from '@artbycity/sdk'
import Arweave from 'arweave'

const arweave = Arweave.init({})
const config: Partial<ArtByCityConfig> = {
  environment: 'development', // 'development' | 'staging' | 'production'
  contracts: {
    usernames: '<local-usernames-contract-txid>',
    curation: {
      ownable: '<local-ownable-curation-contract-src-txid>',
      whitelist: '<local-whitelist-curation-contract-src-txid>',
      collaborative: '<local-collaborative-curation-contract-src-txid>',
      collaborativeWhitelist: 
        '<local-collaborative-whitelist-curation-contract-src-txid>'
    }
  },
  cache: {
    type: 'disabled' // 'memcache' | 'disabled'
  }
}
const abc = new ArtByCity(arweave)
```

#### Authenticated Client
Some API interfaces are only available to the client after calling `connect()`
which transforms the `ArtByCity` client into an `AuthenticatedArtByCityClient`.
```ts
const jwk: JWKInterface = {} /* your arweave wallet JWK */
const authenticated = new ArtByCity().connect(jwk)
```

Alternatively, in the browser you can call `connect()` without any arguments to
use `window.arweaveWallet`.
```ts
const authenticated = new ArtByCity().connect()
```

Typically, you'll only use `connect()` in a chain to method calls that require a
wallet as detailed below.

### Curations

For curation contracts sources, see
[ArtByCity Curation Contracts](https://github.com/art-by-city/contracts).

#### Curation State Type Reference
```ts
type BaseCurationMetadata = {
  [key: string]: any
}

type BaseCurationState = {
  title: string
  metadata: BaseCurationMetadata
  items: string[]
  hidden: string[]
}

type OwnableState = {
  owner: string
}

type WhitelistState = {
  addressWhitelist: string[]
}

type AccessControlState<Roles extends string | number | symbol> = {
  roles: {
    [role in Roles]: string[]
  }
}

/* Ownable Curation Contract State */
type OwnableCurationState = OwnableState & BaseCurationState

/* Whitelist Curation Contract State */
type WhitelistCurationState = OwnableCurationState & WhitelistState

/* Collaborative Curation Contract State */
type CollaborativeCurationState =
  OwnableCurationState & AccessControlState<'curator'>

/* Collaborative Whitelist Curation Contract State */
type CollaborativeWhitelistCurationState =
  CollaborativeCurationState & WhitelistCurationState
```

#### Create a Curation
Creates a curation, returning the `curationId` (smartweave initialization 
transaction id).  `owner` and `title` are required, while everything else is 
optional.  You can set the initial state of the contract through these options.

If `description` is defined, it will be copied to `metadata['description']`.
```ts
type CurationType =
  | 'ownable'
  | 'whitelist' 
  | 'collaborative'
  | 'collaborative-whitelist'

interface CurationCreationOptions {
  owner: string
  title: string
  description?: string
  topic?: string
  metadata?: BaseCurationMetadata
  items?: []
  hidden?: []
  addressWhitelist?: []
  roles?: {
    curator: []
  }
}

const abc = new ArtByCity()

const owner: string = '<an arweave address>'
const title: string = 'My Curation'
const description: string = 'This is a curation description'
const type: CurationType = 'ownable'
const opts: CurationCreationOptions = {
  owner,
  title,
  description
}

const curationId = await abc.connect().curations.create(type, opts)
```

#### Fetch a Curation
Fetch a curation by `curationId`.  This returns the Warp `Contract` with a union
state common to all curation contracts.

**In the future, this interface *will* change.**
```ts
const abc = new ArtByCity()

const curationId: string = '<curation tx id>'

const curation = abc.curations.get(curationId)
const { cachedValue: { state } } = await curation.readState()
```

If you know the type of curation, you could provide that to the Warp `Contract`.
**In the future, this interface *will* change.**
```ts


const curation = abc.curations.get(curationId)
```

#### Query Curations by Creator
Query curations deployed by `address`.
Returns `{ curations: ArdbTransaction[] }`.

Note: if the owner has been transferred or set to a different address than the
deployer on initial deployment, the curation will not match this query result. 
This function is intended to search on *creator* / initial deployer of
curations.

```ts
const { curations } = await abc.curations.createdBy(address)
```

### Legacy

The SDK contains a `legacy` module providing read-only interfaces for consuming
legacy Art By City publications and related entities (avatars, profiles, likes, tips, usernames, etc.)

#### Querying
```ts
const abc = new ArtByCity()

const limit: number | 'all' = 'all'
const address: string = '<an arweave address>'

const {
  publications,
  cursor
} = await abc.legacy.queryPublications(limit, address)
const {
  bundles,
  cursor
} = await abc.legacy.queryPublicationBundles(limit, address)

const publicationId: string = publications[0].id

const { likes: sentLikes, cursor } =
  await abc.legacy.queryLikes(address, 'sent')
const { likes: receivedLikes, cursor } =
  await abc.legacy.queryLikes(address, 'received')
const { likes: likesForPublication, cursor } =
  await abc.legacy.queryLikesForPublication(publicationId)
const { tips: sentTips, cursor } = await abc.legacy.queryTips(address, 'sent')
const { tips: receivedTips, cursor } =
  await abc.legacy.queryTips(address, 'received')

/* Query functions have optional arguments for limit, cursor, and cache */
const allCacheBustedLikesSent = await abc.legacy.queryLikes(
  address,
  'sent',
  'all',
  undefined,
  false
)
```

#### Fetching
```ts
const abc = new ArtByCity()

const address: string = '<an arweave address>'
const publicationId: string = '<an arweave txid of a publication manifest>'
const slug: string = 'my-cool-artwork' // url slug of a publication

const avatar = await abc.legacy.fetchAvatar(address)
const profile = await abc.legacy.fetchProfile(address)
const publication = await abc.legacy.fetchPublication(publicationId)
const publicationBySlug = await abc.legacy.fetchPublicationBySlug(slug)
const publicationBySlugOrId =
  await abc.legacy.fetchPublicationBySlugOrId(slug) // or publicationId
```

#### Usernames
```ts
const abc = new ArtByCity()

const address: string = '<an arweave address>'
const username: string = 'jim'

const { username, address } = await abc.legacy.usernames.resolve(username)
const { username, address } = await abc.legacy.usernames.resolve(address)
const resolvedAddress =
  await abc.legacy.usernames.resolveAddressFromUsername(username)
const resolvedUsername =
  await abc.legacy.usernames.resolveUsernameFromAddress(address)
```
