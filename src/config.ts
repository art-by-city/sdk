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
    atomicLicense: string
    usernames: string    
    curation: {
      ownable: string
      whitelist: string
      collaborative: string
      collaborativeWhitelist: string
    },
    following: string
  }
  cache: {
    type: CacheStrategy
  }
}

export const DEFAULT_ARTBYCITY_CONFIG: ArtByCityConfig = {
  environment: 'production',
  contracts: {
    atomicLicense: 'UJk7yvRhFASZkvPBRps6eLGwNpzCwbCnUDV1LJlK10o',
    usernames: 'NKj42L1tJ6SfAitwg3Qt3SZ2Us64IsPSTSCaJEzTunI',    
    curation: {
      ownable: 'FYeph502kp_B7JT5S7431SPerldciZLcMEZDzgmnmWc',
      whitelist: 'wQyCsSM-gROX2iVUaezrfNJg-z9MJdy_FCJB5oEx8cY',
      collaborative: 'O_SmOtUfUNYf8Z8BqFao1MzBM_9Ydh8djkcDAV2u7eM',
      collaborativeWhitelist: '3M_dT7kclnFtiITTMDRKvrbfAZEWWZb05KWH6OojEWs'
    },
    following: 'uPPmKBhY4L4MKAaGi2pCDU30nnEo9VtMb9Sw-zSApFY'
  },
  cache: {
    type: 'memcache'
  }
}

export const ARTBYCITY_STAGING_CONFIG: ArtByCityConfig = {
  environment: 'staging',
  contracts: {
    atomicLicense: 'UJk7yvRhFASZkvPBRps6eLGwNpzCwbCnUDV1LJlK10o',
    usernames: 'p8kCOXA7VsXQcmMg4Q5AYMvyXzJbDl8iPUG1uvUBAA0',
    curation: {
      ownable: 'FYeph502kp_B7JT5S7431SPerldciZLcMEZDzgmnmWc',
      whitelist: 'wQyCsSM-gROX2iVUaezrfNJg-z9MJdy_FCJB5oEx8cY',
      collaborative: 'O_SmOtUfUNYf8Z8BqFao1MzBM_9Ydh8djkcDAV2u7eM',
      collaborativeWhitelist: '3M_dT7kclnFtiITTMDRKvrbfAZEWWZb05KWH6OojEWs'
    },
    following: 'uPPmKBhY4L4MKAaGi2pCDU30nnEo9VtMb9Sw-zSApFY'
  },
  cache: {
    type: 'memcache'
  }
}
