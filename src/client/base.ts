import Arweave from 'arweave'
import { LoggerFactory, Warp, WarpFactory } from 'warp-contracts'
import { DeployPlugin } from 'warp-contracts-plugin-deploy'

import ArtByCityLegacy from '../legacy'
import { ArtByCityConfig } from '../config'
import { ArtByCityCurations } from '../curation'

export default class ArtByCity {
  public readonly arweave!: Arweave
  public readonly warp!: Warp
  public readonly legacy!: ArtByCityLegacy
  public readonly config!: ArtByCityConfig
  public readonly curations!: ArtByCityCurations

  constructor(arweave?: Arweave, config?: Partial<ArtByCityConfig>) {
    const environment = config?.environment || 'production'

    const usernamesContractId = config?.contracts?.usernames
      ? config.contracts.usernames
      : environment === 'production'
        ? 'BaAP2wyqSiF7Eqw3vcBvVss3C0H8i1NGQFgMY6nGpnk'
        : 'UHPC-7wenVg-JyS81EXKCnLlKvjSbfrIsnWt1F8hueg'

    const ownableCurationContractId = config?.contracts?.curation?.ownable
      ? config.contracts.curation.ownable
      : 'dPAv4JO4gLCZDlO464GGAUo-K6pUHFJsyjMPYV91Smk'

    const whitelistCurationContractId = config?.contracts?.curation?.whitelist
      ? config.contracts.curation.whitelist
      : 'Dv9zE2I3YqouYh1GJ_JkBlQtf0a19fX3L9A7QzKJmgw'

    const collaborativeCurationContractId =
      config?.contracts?.curation?.collaborative
        ? config.contracts.curation.collaborative
        : '8VDyl_fFYn2zosAcb0-u_P4VvJi6Ucc4QRyZdusV3Sk'

    const collaborativeWhitelistCurationContractId =
      config?.contracts?.curation?.collaborativeWhitelist
        ? config.contracts.curation.collaborativeWhitelist
        : 'eD4Dm458zE14NIF2Ip2tgu9O1GVaPjLeyUyf6Azehts'

    this.config = {
      environment,
      contracts: {
        usernames: usernamesContractId,
        curation: {
          ownable: ownableCurationContractId,
          whitelist: whitelistCurationContractId,
          collaborative: collaborativeCurationContractId,
          collaborativeWhitelist: collaborativeWhitelistCurationContractId
        }
      },
      cache: {
        type: config?.cache?.type === 'disabled' ? 'disabled' : 'memcache'
      }
    }
    
    LoggerFactory.INST.logLevel(
      environment !== 'development' ? 'fatal' : 'error'
    )
    this.arweave = arweave || Arweave.init({})
    this.warp = environment !== 'development'
      ? WarpFactory.forMainnet({ inMemory: true, dbLocation: '.art-by-city' })
      : WarpFactory.forLocal()
    this.warp = this.warp.use(new DeployPlugin())
    this.legacy = new ArtByCityLegacy(this.arweave, this.warp, this.config)
    this.curations = new ArtByCityCurations(
      this.arweave,
      this.warp,
      this.config
    )
  }
}
