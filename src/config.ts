export const ENVIRONMENTS = [
  'development',
  'staging',
  'production'
] as const
export type ArtByCityEnvironment = typeof ENVIRONMENTS[number]

export type ArtByCityConfig = {
  environment: ArtByCityEnvironment
}
