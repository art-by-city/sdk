import { Contract, Warp } from 'warp-contracts'

export default class BaseContractProvider<ContractState> {
  constructor(
    private readonly warp: Warp,
    public readonly contractId: string
  ) {}

  get contract(): Contract<ContractState> {
    return this.warp.contract<ContractState>(this.contractId)
  }
}
