import { DataItem, createData } from 'arbundles'
import { Tag } from 'warp-contracts'
import { ArweaveSigner } from 'warp-arbundles'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy'

export default class DataItemFactory {
  constructor(private readonly signer: ArweaveSigner | InjectedArweaveSigner) {}

  async createAndSign(
    data: string | Uint8Array,
    tags?: Tag[]
  ): Promise<DataItem> {
    if (this.signer instanceof InjectedArweaveSigner) {
      const signed = await window.arweaveWallet.signDataItem({ data, tags })

      return new DataItem(Buffer.from(signed))
    }
    
    const dataItem = createData(data, this.signer, { tags })
    await dataItem.sign(this.signer)
    
    return dataItem
  }
}
