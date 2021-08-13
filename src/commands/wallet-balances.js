/*

*/

'use strict'

// Public NPM libraries
// const BCHJS = require('@psf/bch-js')
const BchWallet = require('minimal-slp-wallet/index')
const collect = require('collect.js')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const WalletService = require('../lib/adapters/wallet-service')

const { Command, flags } = require('@oclif/command')

const fs = require('fs')

class WalletBalances extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    // this.bchjs = new BCHJS()

    this.fs = fs
    this.walletUtil = new WalletUtil()
  }

  async run () {
    try {
      const { flags } = this.parse(WalletBalances)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${
        flags.name
      }.json`

      return this.getBalances(filename)
    } catch (err) {
      if (err.message) console.log(err.message)
      else console.log('Error in create-wallet.js/run(): ', err)

      return 0
    }
  }

  // Create a new wallet file.
  async getBalances (filename, desc) {
    try {
      const walletJSON = require(filename)
      const walletData = walletJSON.wallet

      // Configure the minimal-slp-wallet library.
      const walletService = new WalletService()
      const advancedConfig = {
        interface: 'json-rpc',
        jsonRpcWalletService: walletService
      }

      this.bchWallet = new BchWallet(walletData.mnemonic, advancedConfig)
      // console.log('bchWallet: ', this.bchWallet)
      await this.bchWallet.walletInfoPromise

      // console.log(
      //   'bchWallet.utxos.utxoStore: ',
      //   JSON.stringify(this.bchWallet.utxos.utxoStore, null, 2),
      // )

      // Loop through each BCH UTXO and add up the balance.
      let bchBalance = 0
      for (let i = 0; i < this.bchWallet.utxos.utxoStore.bchUtxos.length; i++) {
        const thisUtxo = this.bchWallet.utxos.utxoStore.bchUtxos[i]

        bchBalance += thisUtxo.value
      }
      const coinBalance =
        this.bchWallet.bchjs.BitcoinCash.toBitcoinCash(bchBalance)
      console.log(`BCH balance: ${bchBalance} satoshis or ${coinBalance} BCH`)

      // Print out SLP Type1 tokens
      console.log('\nTokens:')
      const tokens = this.getTokenBalances(
        this.bchWallet.utxos.utxoStore.slpUtxos.type1.tokens
      )
      for (let i = 0; i < tokens.length; i++) {
        const thisToken = tokens[i]
        console.log(`${thisToken.ticker} ${thisToken.qty} ${thisToken.tokenId}`)
      }
    } catch (err) {
      if (err.code !== 'EEXIT') console.log('Error in createWallet().')
      throw err
    }
  }

  // Add up the token balances.
  // At the moment, minting batons, NFTs, and group tokens are not suported.
  getTokenBalances (tokenUtxos) {
    try {
      // console.log('tokenUtxos: ', tokenUtxos)

      const tokens = []
      const tokenIds = []

      // Summarized token data into an array of token UTXOs.
      for (let i = 0; i < tokenUtxos.length; i++) {
        const thisUtxo = tokenUtxos[i]

        const thisToken = {
          ticker: thisUtxo.tokenTicker,
          tokenId: thisUtxo.tokenId,
          qty: parseFloat(thisUtxo.tokenQty)
        }

        tokens.push(thisToken)

        tokenIds.push(thisUtxo.tokenId)
      }

      // Create a unique collection of tokenIds
      const collection = collect(tokenIds)
      let unique = collection.unique()
      unique = unique.toArray()

      // Add up any duplicate entries.
      // The finalTokenData array contains unique objects, one for each token,
      // with a total quantity of tokens for the entire wallet.
      const finalTokenData = []
      for (let i = 0; i < unique.length; i++) {
        const thisTokenId = unique[i]

        const thisTokenData = {
          tokenId: thisTokenId,
          qty: 0
        }

        // Add up the UTXO quantities for the current token ID.
        for (let j = 0; j < tokens.length; j++) {
          const thisToken = tokens[j]

          if (thisTokenId === thisToken.tokenId) {
            thisTokenData.ticker = thisToken.ticker
            thisTokenData.qty += thisToken.qty
          }
        }

        finalTokenData.push(thisTokenData)
      }

      return finalTokenData
    } catch (err) {
      console.error('Error in getTokenBalances()')
      throw err
    }
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const name = flags.name
    if (!name || name === '') {
      throw new Error('You must specify a wallet with the -n flag.')
    }

    return true
  }
}

WalletBalances.description = 'Display the balances of the wallet'

WalletBalances.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' })
}

module.exports = WalletBalances
