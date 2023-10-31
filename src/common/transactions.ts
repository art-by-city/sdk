import axios from 'axios'

// const bundlerBase = `https://node2.irys.xyz`
const bundlerBase = `localhost:1984`

export default class TransactionsModule {
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
}
