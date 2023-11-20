export type CurationType =
  | 'ownable'
  | 'whitelist'
  | 'collaborative'
  | 'collaborative-whitelist'

export type BaseCurationMetadata = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key: string]: any
}

export interface OwnableState {
  owner: string
}

export interface WhitelistState {
  addressWhitelist: string[]
}

export type AccessControlState<Roles extends string | number | symbol> = {
  roles: {
    [role in Roles]: string[]
  }
}

export interface OwnableCurationState extends OwnableState {
  title: string
  metadata: BaseCurationMetadata
  items: string[]
  hidden: string[]
}

export type WhitelistCurationState = OwnableCurationState & WhitelistState
export type CollaborativeCurationState =
  OwnableCurationState & AccessControlState<'curator'>
export type CollaborativeWhitelistCurationState =
  OwnableCurationState & WhitelistState & AccessControlState<'curator'>

export type CurationContractStates =
  | OwnableCurationState
  | WhitelistCurationState
  | CollaborativeCurationState
  | CollaborativeWhitelistCurationState

export class UnknownCurationTypeError extends Error {
  constructor() {
    super('Unknown curation type')
  }
}

export interface CurationCreationOptions {
  owner?: string
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
  tags?: { name: string, value: string }[]
  slug?: boolean | string
}

export { default as ArtByCityCurations } from './curations'
export {
  default as AuthenticatedArtByCityCurations
} from './authenticated-curations'
