import Arweave from 'arweave'
import { LoggerFactory, Warp, WarpFactory } from 'warp-contracts'
import { DeployPlugin } from 'warp-contracts-plugin-deploy'

import ArtByCityLegacy from '../legacy'
import {
  ARTBYCITY_STAGING_CONFIG,
  ArtByCityConfig,
  DEFAULT_ARTBYCITY_CONFIG
} from '../config'
import { ArtByCityCurations } from '../curations'
import { ArtByCityUsernames } from '../usernames'
import { ArFSClient } from '../arfs'
import TransactionsModule from '../common/transactions'
import { ArtByCityPublications } from '../publications'
import { ArtByCityFollowing } from '../following'

export default class ArtByCity {
  public readonly arweave!: Arweave
  public readonly warp!: Warp
  public readonly legacy!: ArtByCityLegacy
  public readonly config!: ArtByCityConfig
  public readonly curations!: ArtByCityCurations
  public readonly usernames!: ArtByCityUsernames
  public readonly arfs!: ArFSClient
  public readonly transactions!: TransactionsModule
  public readonly publications!: ArtByCityPublications
  public readonly following!: ArtByCityFollowing

  constructor(arweave?: Arweave, config?: Partial<ArtByCityConfig>) {
    const environment = config?.environment || 'production'
    const defaultConfig = environment === 'staging'
      ? ARTBYCITY_STAGING_CONFIG
      : DEFAULT_ARTBYCITY_CONFIG

    this.config = { ...defaultConfig, ...config }
    
    LoggerFactory.INST.logLevel(
      environment !== 'development' ? 'fatal' : 'error'
    )
    this.arweave = arweave || Arweave.init({})
    this.warp = environment !== 'development'
      ? WarpFactory.forMainnet({ inMemory: true, dbLocation: '.art-by-city' })
      : WarpFactory.forLocal()
    this.warp = this.warp.use(new DeployPlugin())
    this.legacy = new ArtByCityLegacy(this.arweave, this.config)
    this.curations = new ArtByCityCurations(
      this.arweave,
      this.warp,
      this.config
    )
    this.usernames = new ArtByCityUsernames(
      this.warp,
      this.config.contracts.usernames
    )
    this.arfs = new ArFSClient(this.arweave)
    this.transactions = new TransactionsModule(this.arweave)
    this.publications = new ArtByCityPublications(
      this.arweave,
      this.arfs,
      this.config
    )
    this.following = new ArtByCityFollowing(this.config, this.warp)
  }
}
