/*
  This command is used to retrieve the transaction history for a token.
  This is more informative for NFTs than it is for fungible tokens.
*/

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')
const { Command, flags } = require('@oclif/command')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const axios = require('axios')
// const WalletBalances = require('./wallet-balances')

class TokenTxHistory extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.BchWallet = BchWallet
    this.axios = axios
    // this.walletBalances = new WalletBalances()
  }

  async run () {
    try {
      const { flags } = this.parse(TokenTxHistory)
      // console.log('flags: ', flags)

      // Validate input flags
      this.validateFlags(flags)

      const txData = await this.getTxHistory(flags)
      // console.log('tokenData: ', tokenData)

      this.displayTxHistory(txData)

      return true
    } catch (err) {
      console.log('Error in token-tx-history.js/run(): ', err.message)

      return 0
    }
  }

  displayTxHistory (txData) {
    console.log(`${JSON.stringify(txData, null, 2)}`)

    return true
  }

  // Get the genesis data and IPFS URLs for mutable and immutable data, if available.
  async getTxHistory (flags) {
    const tokenId = flags.tokenId

    const server = this.walletUtil.getRestServer()
    const wallet = new this.BchWallet(undefined, { restURL: server.restURL, interface: server.interface, noUpdate: true })

    const tokenData = await wallet.ar.getTokenData(tokenId, true)

    return tokenData.genesisData.txs
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    const tokenId = flags.tokenId
    if (!tokenId || tokenId === '') {
      throw new Error('You must specify a token ID with the -t flag')
    }

    return true
  }
}

TokenTxHistory.description = `Get transaction history for a token

Retrieves the transaction history for a token. This is every transaction that
has involved the token. The data is more informative for an NFT than it is for
a fungible token.
`

TokenTxHistory.flags = {
  tokenId: flags.string({ char: 't', description: 'The ID of the token to lookup' })
}

module.exports = TokenTxHistory
