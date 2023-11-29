export { default as ArtByCityProfiles } from './profiles'
export {
  default as AuthenticatedArtByCityProfiles
} from './authenticated-profiles'

export interface ProfileUpdateOptions {
  handle: string
  avatar?: string
  banner?: string
  name?: string
  bio?: string
  links?: {
    twitter?: string
    x?: string
    github?: string
    instagram?: string
    discord?: string
    linkedin?: string
    facebook?: string
    youtube?: string
    twitch?: string
    soundcloud?: string
  },
  wallets?: {
    [chain: string]: string
  }
}
