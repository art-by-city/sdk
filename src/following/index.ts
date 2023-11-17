export { default as ArtByCityFollowing } from './following'
export {
  default as AuthenticatedArtByCityFollowing
} from './authenticated-following'

export interface FollowingCreationOptions {
  owner?: string
  following?: string[]
  tags?: { name: string, value: string }[]
  slug?: boolean | string
}
