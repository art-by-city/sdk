import BaseContractProvider from '../common/contract'
import { CurationContractStates } from './'

export default class Curation<State = CurationContractStates>
  extends BaseContractProvider<State>
{}
