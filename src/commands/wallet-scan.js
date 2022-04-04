/*
  This command is used to scan a wallet to see if holds any BCH.

  Since many wallets implement different standards around derivation paths,
  this command scans several common derivation paths.

  Scans first 20 addresses of each derivation path for tx history and balance.
  If any of them had a history, scans the next 20, until it reaches a batch of 20
  addresses with no history.

  derivation settings:
  145 - BIP44 standard path for Bitcoin Cash
  245 - BIP44 standard path for SLP tokens
  0 - Used by common software like the Bitcoin.com wallet and Honest.cash

  TODO:
  - Currently makes one API call to Electrumx API endpoint per address. This
  command would be greatly improved if the bulk endpoint was used to retrieve
  20 addresses at a time.
*/

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')
const Conf = require('conf')

const { Command, flags } = require('@oclif/command')

class ScanMnemonic extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies
    this.BchWallet = BchWallet
    this.conf = new Conf()

    // An array of common derivation paths used by BCH wallets.
    this.derivationPaths = [
      "m/44'/245'/0'/0", // SLP BIP44 standard
      "m/44'/145'/0'/0", // BCH BIP 44 standard
      "m/44'/0'/0'/0" // Bitcoin.com wallet
    ]
  }

  async run () {
    try {
      const { flags } = this.parse(ScanMnemonic)

      // Ensure flags meet qualifiying critieria.
      this.validateFlags(flags)

      // Get the currently selected REST server from the config.
      const restServer = this.conf.get('restServer')
      console.log(`restServer: ${restServer}`)

      // Configure the minimal-slp-wallet library.
      const advancedConfig = {
        interface: 'consumer-api',
        restURL: restServer,
        noUpdate: true
      }
      this.bchWallet = new this.BchWallet(undefined, advancedConfig)
      await this.bchWallet.walletInfoPromise
      this.bchjs = this.bchWallet.bchjs

      await this.scanDerivationPaths(flags)

      return true
    } catch (err) {
      if (err.message) console.log(err.message)
      else console.log('Error in .run: ', err)
      // console.log('Error in scan-funds.js/run: ', err)
      throw err
    }
  }

  // Primary function of this library that orchestrates the other functions
  // to scan the array of derivation paths.
  async scanDerivationPaths (flags) {
    try {
      // Initialize the HD wallet 'node'
      const rootSeed = await this.bchjs.Mnemonic.toSeed(flags.mnemonic)
      const masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)

      let finalReport = '\nFinal Report:'

      // Loop through each derivation path.
      for (let i = 0; i < this.derivationPaths.length; i++) {
        const thisDerivationPath = this.derivationPaths[i]

        const addressesWithHistory = await this.scanDerivationPath(masterHDNode, thisDerivationPath)
        // console.log('addressesWithHistory: ', addressesWithHistory)

        let result
        if (addressesWithHistory.length) {
          let total = 0
          addressesWithHistory.map(x => {
            total = total + x.balance
            return x
          })

          const totalBch = this.bchjs.BitcoinCash.toBitcoinCash(total)

          result = `Derivation path ${thisDerivationPath} has a transaction history and currently controls ${totalBch} BCH (${total} satoshis).`
        } else {
          result = `Derivation path ${thisDerivationPath} does not have any transaction history.`
        }
        console.log(result)
        finalReport = finalReport + '\n' + result
      }

      console.log(finalReport)
    } catch (err) {
      console.error('Error in scanDerivationPaths()')
      throw err
    }
  }

  // Scans the derivePath children in groups of 20 addresses, until one group
  // has no history.
  // Returns an array of objects. Each object contains an addresses with a
  // transaction history and balance.
  async scanDerivationPath (masterHDNode, derivePath) {
    try {
      console.log(`\nScanning derivation path ${derivePath}...`)

      const addressesWithHistory = []

      // Gap limit. BIP standard is 20
      const GAP = 3

      // Scan 20 addresses for balances.
      let limit = GAP
      for (let index = 0; index <= limit; index++) {
        const derivedChildPath = `${derivePath}/${index}`
        // console.log(`derivedChildPath: ${derivedChildPath}`)

        // Generate a BCH address.
        const derivedChildAddress = this.deriveAddress(
          masterHDNode,
          derivedChildPath
        )
        console.log(`Scanning ${derivedChildPath} at address ${derivedChildAddress}`)

        // Check for a transaction history for the address.
        const historyBalanceData = await this.addrTxHistory(
          derivedChildAddress
        )
        // console.log(`historyBalanceData: ${JSON.stringify(historyBalanceData, null, 2)}`)

        // If a history is found, increase the limit by 20 addresses.
        if (historyBalanceData.hasHistory) {
          console.log(`  TX History found for ${derivedChildAddress}`)

          addressesWithHistory.push({
            address: derivedChildAddress,
            balance: historyBalanceData.balance
          })
          limit = index + GAP
        }
      }

      // console.log(`addressesWithHistory: ${JSON.stringify(addressesWithHistory, null, 2)}`)

      return addressesWithHistory
    } catch (err) {
      console.log('Error in scanDerivationPath()')
      throw err
    }
  }

  // Generates a BCH address from the HD node and the derivation path.
  // Returns a string containing the BCH address.
  deriveAddress (masterHDNode, derivePath) {
    try {
      const derivedHDNode = this.bchjs.HDNode.derivePath(
        masterHDNode,
        derivePath
      )

      return this.bchjs.HDNode.toCashAddress(derivedHDNode)
    } catch (err) {
      console.log('Error in deriveAddress()')
      throw err
    }
  }

  // Queries ElectrumX for transaction history of address, if existed, gets
  // address balance too.
  async addrTxHistory (address) {
    try {
      let balance = 0

      const transactions = await this.bchWallet.getTransactions(address)
      // console.log(`transactions: ${JSON.stringify(transactions, null, 2)}`)

      let hasHistory = false
      if (transactions && transactions.length) {
        hasHistory = true
      }
      // console.log(`hasHistory: ${hasHistory}`)

      // If a transaction history is detected, get the balance for the address.
      if (hasHistory) {
        const balanceData = await this.bchWallet.getBalance(address)
        // console.log(`balanceData: ${JSON.stringify(balanceData, null, 2)}`)

        balance = balanceData
      }

      return { hasHistory: hasHistory, balance: balance }
    } catch (err) {
      console.log('Error in addrTxHistory()')
      throw err
    }
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if mnemonic phrase not specified.
    const mnemonic = flags.mnemonic
    if (!mnemonic || mnemonic === '') {
      throw new Error('You must specify a mnemonic phrase with the -m flag.')
    }

    // Exit if number of mnemonic words is not 12.
    if (mnemonic.split(' ').length !== 12) {
      throw new Error('You must specify a mnemonic phrase of 12 words.')
    }

    return true
  }
}

ScanMnemonic.description = `Scans first 20 addresses of each derivation path for
history and balance of the given mnemonic. If any of them had a history, scans
the next 20, until it reaches a batch of 20 addresses with no history. The -m
flag is used to pass it a mnemonic phrase. Be sure to enclose the words in
quotes.

This command is handy for people who maintain multiple wallets. This allows easy
scanning to see if a mnemonic holds any funds on any of the commonly used
derivation paths.

Derivation pathes used:
145 - BIP44 standard path for Bitcoin Cash
245 - BIP44 standard path for SLP tokens
0 - Used by common software like the Bitcoin.com wallet and Honest.cash
`

ScanMnemonic.flags = {
  mnemonic: flags.string({
    char: 'm',
    description: 'mnemonic phrase to generate addresses, wrapped in quotes'
  })
}

module.exports = ScanMnemonic
