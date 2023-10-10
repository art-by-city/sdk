export const ENVIRONMENTS = [
  'development',
  'staging',
  'production'
] as const
export type ArtByCityEnvironment = typeof ENVIRONMENTS[number]

export type CacheStrategy = 'disabled' | 'memcache'

export type ArtByCityConfig = {
  environment: ArtByCityEnvironment
  contracts: {
    usernames: string
    curation: {
      ownable: string
      whitelist: string
      collaborative: string
      collaborativeWhitelist: string
    }
  }
  cache: {
    type: CacheStrategy
  }
}
