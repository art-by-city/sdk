export const ENVIRONMENTS = [
  'development',
  'staging',
  'production'
] as const
export type ArtByCityEnvironment = typeof ENVIRONMENTS[number]

export type CacheStrategy = 'disabled' | 'memcache'

export type ArtByCityConfig = {
  environment: ArtByCityEnvironment
  usernamesContractId: string
  cache: {
    type: CacheStrategy
  }
}
