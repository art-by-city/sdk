export { default as ArtByCityProfiles } from './profiles'
export {
  default as AuthenticatedArtByCityProfiles
} from './authenticated-profiles'
export { default as ArweaveAccount } from './arweave-account'

export interface ArweaveAccountWalletMap {
  [chain: string]: string
}

export interface ProfileUpdateOptions {
  username?: string
  handle?: string
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
  wallets?: ArweaveAccountWalletMap
}

export interface ArweaveProfile {
  avatar?: string
  avatarURL?: string
  banner?: string
}
