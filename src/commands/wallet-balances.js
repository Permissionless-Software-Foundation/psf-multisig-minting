/*
  Update the balances of a wallet.
*/

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')
const collect = require('collect.js')
const Conf = require('conf')
const fs = require('fs')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const WalletConsumer = require('../lib/adapters/wallet-consumer')

const { Command, flags } = require('@oclif/command')

class WalletBalances extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.fs = fs
    this.walletUtil = new WalletUtil()
    this.walletService = new WalletConsumer()
    this.BchWallet = BchWallet
    this.conf = new Conf()
  }

  async run () {
    try {
      const { flags } = this.parse(WalletBalances)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${
        flags.name
      }.json`

      // Get the wallet with updated UTXO data.
      const walletData = await this.getBalances(filename)
      // console.log(
      //   `walletData.utxos.utxoStore: ${JSON.stringify(
      //     walletData.utxos.utxoStore,
      //     null,
      //     2,
      //   )}`,
      // )

      // Display wallet balances on the screen.
      this.displayBalance(walletData, flags)

      return true
    } catch (err) {
      console.log('Error in run(): ', err)

      return false
    }
  }

  // Generate a new wallet instance and update it's balance. This function returns
  // a handle to an instance of the wallet library.
  // This function is called by other commands in this app.
  async getBalances (filename) {
    try {
      // Load the wallet file.
      const walletJSON = require(filename)
      const walletData = walletJSON.wallet

      const advancedConfig = this.walletUtil.getRestServer()
      this.bchWallet = new this.BchWallet(walletData.mnemonic, advancedConfig)
      // console.log('bchWallet: ', this.bchWallet)

      // Wait for the wallet to initialize and retrieve UTXO data from the
      // blockchain.
      await this.bchWallet.walletInfoPromise

      // If UTXOs fail to update, try one more time.
      if (!this.bchWallet.utxos.utxoStore) {
        await this.bchWallet.getUtxos()

        // Throw an error if UTXOs are still not updated.
        if (
          !this.bchWallet.utxos.utxoStore ||
          this.bchWallet.utxos.utxoStore.success === false
        ) {
          throw new Error('UTXOs failed to update. Try again.')
        }
      }

      // console.log(
      //   `this.bchWallet.utxos.utxoStore: ${JSON.stringify(
      //     this.bchWallet.utxos.utxoStore,
      //     null,
      //     2
      //   )}`
      // )

      // Loop through each BCH UTXO and add up the balance.
      let satBalance = 0
      for (let i = 0; i < this.bchWallet.utxos.utxoStore.bchUtxos.length; i++) {
        const thisUtxo = this.bchWallet.utxos.utxoStore.bchUtxos[i]

        satBalance += thisUtxo.value
      }
      const bchBalance = this.bchWallet.bchjs.BitcoinCash.toBitcoinCash(
        satBalance
      )
      this.bchWallet.satBalance = satBalance
      this.bchWallet.bchBalance = bchBalance

      return this.bchWallet
    } catch (err) {
      console.log('Error in getBalances()')
      throw err
    }
  }

  // Take the updated wallet data and display it on the screen.
  displayBalance (walletData, flags = {}) {
    try {
      // Loop through each BCH UTXO and add up the balance.
      // let bchBalance = 0
      // for (let i = 0; i < walletData.utxos.utxoStore.bchUtxos.length; i++) {
      //   const thisUtxo = walletData.utxos.utxoStore.bchUtxos[i]
      //
      //   bchBalance += thisUtxo.value
      // }
      // const coinBalance = walletData.bchjs.BitcoinCash.toBitcoinCash(bchBalance)
      console.log(
        `BCH balance: ${walletData.satBalance} satoshis or ${walletData.bchBalance} BCH`
      )

      // console.log(
      //   'walletData.utxos.utxoStore.slpUtxos.type1.tokens: ',
      //   walletData.utxos.utxoStore.slpUtxos.type1.tokens
      // )

      // Combine token UTXOs
      const tokenUtxos = walletData.utxos.utxoStore.slpUtxos.type1.tokens.concat(
        walletData.utxos.utxoStore.slpUtxos.group.tokens,
        walletData.utxos.utxoStore.slpUtxos.nft.tokens
      )

      // Print out SLP Type1 tokens
      console.log('\nTokens:')
      const tokens = this.getTokenBalances(
        // walletData.utxos.utxoStore.slpUtxos.type1.tokens
        tokenUtxos
      )
      for (let i = 0; i < tokens.length; i++) {
        const thisToken = tokens[i]
        console.log(`${thisToken.ticker} ${thisToken.qty} ${thisToken.tokenId}`)
      }

      // Print out minting batons
      const mintBatons = walletData.utxos.utxoStore.slpUtxos.type1.mintBatons.concat(
        walletData.utxos.utxoStore.slpUtxos.group.mintBatons
      )
      if (mintBatons.length > 0) {
        console.log('\nMinting Batons: ')
        // console.log(`walletData.utxos.utxoStore: ${JSON.stringify(walletData.utxos.utxoStore, null, 2)}`)

        for (let i = 0; i < mintBatons.length; i++) {
          const thisBaton = mintBatons[i]

          let type = 'Fungible'
          if (thisBaton.tokenType === 129) type = 'Group'

          console.log(`${thisBaton.ticker} (${type}) ${thisBaton.tokenId}`)
        }
      }

      // If verbose flag is set, display UTXO information.
      if (flags.verbose) {
        console.log(
          `\nUTXO information:\n${JSON.stringify(
            walletData.utxos.utxoStore,
            null,
            2
          )}`
        )
      }

      return true
    } catch (err) {
      console.error('Error in displayBalance()')
      throw err
    }
  }

  // Add up the token balances.
  // At the moment, minting batons, NFTs, and group tokens are not suported.
  getTokenBalances (tokenUtxos) {
    // console.log('tokenUtxos: ', tokenUtxos)

    const tokens = []
    const tokenIds = []

    // Summarized token data into an array of token UTXOs.
    for (let i = 0; i < tokenUtxos.length; i++) {
      const thisUtxo = tokenUtxos[i]

      const thisToken = {
        ticker: thisUtxo.ticker,
        tokenId: thisUtxo.tokenId,
        qty: parseFloat(thisUtxo.qtyStr)
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
  name: flags.string({ char: 'n', description: 'Name of wallet' }),
  verbose: flags.boolean({
    char: 'v',
    description: 'Show verbose UTXO information'
  })
}

module.exports = WalletBalances
