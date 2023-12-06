import { Bundle, bundleAndSignData, DataItem } from 'arbundles'
import ArDB from 'ardb'
import ArdbTransaction from 'ardb/lib/models/transaction'
import Arweave from 'arweave'
import axios from 'axios'
import { ArweaveSigner } from 'warp-arbundles'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy'

import { MemoryCache } from '../cache'

const irysNode2 = `https://node2.irys.xyz`

export default class TransactionsModule {
  protected readonly ardb!: ArDB
  private readonly gatewayRoot!: string

  private readonly txCache = new MemoryCache<ArdbTransaction>()

  constructor(
    private readonly arweave: Arweave,
    private readonly cacheEnabled: boolean = true
  ) {
    this.ardb = new ArDB(arweave)
    const { protocol, host, port } = arweave.api.getConfig()
    this.gatewayRoot = `${protocol}://${host}:${port}`
  }

  async dispatch(
    item: DataItem,
    signer: ArweaveSigner | InjectedArweaveSigner
  ) {
    await item.sign(signer)

    if (this.gatewayRoot === 'http://localhost:1984') {
      // NB: post to arlocal
      const bundle = await bundleAndSignData(
        [item as DataItem],
        signer
      )

      const tx = await this.arweave.createTransaction({
        data: bundle.getRaw()
      })

      tx.addTag('Bundle-Format', 'binary')
      tx.addTag('Bundle-Version', '2.0.0')
      tx.addTag('Protocol', 'ArtByCity')
      tx.addTag('Client', '@artbycity/sdk')

      await this.arweave.transactions.sign(
        tx,
        signer instanceof ArweaveSigner
          /* @ts-expect-error signer types */
          ? signer.jwk
          : 'use_wallet'
      )

      await this.arweave.transactions.post(tx)
    } else {
      // NB: Dispatch with irys when using mainnet
      const { status, statusText } = await axios.post(
        `${irysNode2}/tx`,
        item.getRaw(),
        { headers: { 'Content-Type': 'application/octet-stream' }}
      )
  
      if (status >= 400) {
        throw new Error(`Error dispatching tx: ${status} ${statusText}`)
      }
    }
  }

  async get(
    id: string,
    useCache: boolean = true
  ): Promise<ArdbTransaction | null> {
    if (this.cacheEnabled && useCache) {
      const cached = this.txCache.get(id)
      if (cached) { return cached }
    }

    const txs = await this.ardb
      .search('transactions')
      .ids([ id ])
      .sort('HEIGHT_DESC')
      .find() as ArdbTransaction[]

    const tx = txs.at(0) || null

    if (tx && this.cacheEnabled && useCache) {
      this.txCache.put(id, tx)
    }

    return tx
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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
