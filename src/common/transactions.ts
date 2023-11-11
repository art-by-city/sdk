import ArDB from 'ardb'
import ArdbTransaction from 'ardb/lib/models/transaction'
import Arweave from 'arweave'
import axios from 'axios'

const bundlerBase = `https://node2.irys.xyz`

export default class TransactionsModule {
  protected readonly ardb!: ArDB
  private readonly gatewayRoot!: string

  constructor(arweave: Arweave) {
    this.ardb = new ArDB(arweave)
    const { protocol, host, port } = arweave.api.getConfig()
    this.gatewayRoot = `${protocol}://${host}:${port}`
  }

  async dispatch(data: Buffer) {
    const { status, statusText } = await axios.post(
      `${bundlerBase}/tx`,
      data,
      { headers: { 'Content-Type': 'application/octet-stream' }}
    )

    if (status >= 400) {
      throw new Error(`Error dispatching tx: ${status} ${statusText}`)
    }
  }

  async get(id: string): Promise<ArdbTransaction | null> {
    const txs = await this.ardb
      .search('transactions')
      .ids([ id ])
      .sort('HEIGHT_DESC')
      .find() as ArdbTransaction[]

    return txs[0] || null
  }

  async getData<T = any>(id: string): Promise<T> {
    const {
      data,
      status,
      statusText
    } = await axios.get<T>(`${this.gatewayRoot}/${id}`)

    if (status >= 400) {
      throw new Error(`Error fetching tx data: ${status} ${statusText}`)
    }

    return data
  }
}
