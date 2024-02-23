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
      const dataItem = new DataItem(Buffer.from(signed))
      
      // NB: ArConnect requires the above method of signing DataItem, but they
      //     fail arbundle's .isSigned() check when re-instantiated because
      //     ._id isn't set.  So we set it by assigning .rawId to itself.
      dataItem.rawId = dataItem.rawId

      return dataItem
    }
    
    const dataItem = createData(data, this.signer, { tags })
    await dataItem.sign(this.signer)
    
    return dataItem
  }
}
