import { DataItem, createData } from 'arbundles'
import { ArweaveSigner, Tag } from 'arbundles'

export default class DataItemFactory {
  constructor(
    private readonly signer: ArweaveSigner //| InjectedArweaveSigner
  ) {}

  async createAndSign(
    data: string | Uint8Array,
    tags?: Tag[]
  ): Promise<DataItem> {
    // if (this.signer instanceof InjectedArweaveSigner) {
    //   const signed = await window.arweaveWallet.signDataItem({ data, tags })
    //   const dataItem = new DataItem(Buffer.from(signed))
      
    //   // NB: ArConnect requires the above method of signing DataItem, but they
    //   //     fail arbundle's .isSigned() check when re-instantiated because
    //   //     ._id isn't set.  So we set it by assigning .rawId to itself.
    //   // eslint-disable-next-line no-self-assign
    //   dataItem.rawId = dataItem.rawId

    //   return dataItem
    // }
    
    const dataItem = createData(data, this.signer, { tags })
    await dataItem.sign(this.signer)
    
    return dataItem
  }
}
