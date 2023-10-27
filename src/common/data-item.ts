import { DataItem, Tag, createData, getSignatureAndId } from 'arbundles'
import { ArweaveSigner } from 'warp-arbundles'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-deploy'

export default class DataItemFactory {
  constructor(private readonly signer: ArweaveSigner | InjectedArweaveSigner) {}

  async create(data: string | Uint8Array, tags: Tag[]): Promise<DataItem> {
    const dataItem = createData(data, this.signer, { tags })

    const { signature } = await getSignatureAndId(dataItem, this.signer)
    dataItem.getRaw().set(signature, 2)

    return dataItem
  }
}
