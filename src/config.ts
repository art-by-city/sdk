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

export const DEFAULT_ARTBYCITY_CONFIG: ArtByCityConfig = {
  environment: 'production',
  contracts: {
    usernames: 'BaAP2wyqSiF7Eqw3vcBvVss3C0H8i1NGQFgMY6nGpnk',
    curation: {
      ownable: 'FYeph502kp_B7JT5S7431SPerldciZLcMEZDzgmnmWc',
      whitelist: 'wQyCsSM-gROX2iVUaezrfNJg-z9MJdy_FCJB5oEx8cY',
      collaborative: 'O_SmOtUfUNYf8Z8BqFao1MzBM_9Ydh8djkcDAV2u7eM',
      collaborativeWhitelist: '3M_dT7kclnFtiITTMDRKvrbfAZEWWZb05KWH6OojEWs'
    }
  },
  cache: {
    type: 'memcache'
  }
}

export const ARTBYCITY_STAGING_CONFIG: ArtByCityConfig = {
  environment: 'staging',
  contracts: {
    usernames: 'UHPC-7wenVg-JyS81EXKCnLlKvjSbfrIsnWt1F8hueg',
    curation: {
      ownable: 'FYeph502kp_B7JT5S7431SPerldciZLcMEZDzgmnmWc',
      whitelist: 'wQyCsSM-gROX2iVUaezrfNJg-z9MJdy_FCJB5oEx8cY',
      collaborative: 'O_SmOtUfUNYf8Z8BqFao1MzBM_9Ydh8djkcDAV2u7eM',
      collaborativeWhitelist: '3M_dT7kclnFtiITTMDRKvrbfAZEWWZb05KWH6OojEWs'
    }
  },
  cache: {
    type: 'memcache'
  }
}
