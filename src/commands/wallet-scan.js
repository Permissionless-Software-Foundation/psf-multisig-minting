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
      "m/44'/145'/0'/0", // BCH BIP 44 standard
      "m/44'/0'/0'/0", // Bitcoin.com wallet
      "m/44'/245'/0'/0" // SLP BIP44 standard
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
        restURL: restServer
      }
      this.bchWallet = new this.BchWallet(undefined, advancedConfig)
      await this.bchWallet.walletInfoPromise
      this.bchjs = this.bchWallet.bchjs

      await this.scanDerivationPaths()
    } catch (err) {
      // if (err.message) console.log(err.message)
      // else console.log('Error in .run: ', err)
      console.log('Error in scan-funds.js/run: ', err)
      throw err
    }
  }

  // Primary function of this library that orchestrates the other functions
  // to scan the array of derivation paths.
  async scanDerivationPaths () {
    try {
      // Initialize the HD wallet 'node'
      const rootSeed = await this.bchjs.Mnemonic.toSeed(flags.mnemonic)
      const masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)

      // Loop through each derivation path.
      for (let i = 0; i < this.derivationPaths.length; i++) {
        const thisDerivationPath = this.derivationPaths[i]

        const addressesWithHistory = await this.scanDerivationPath(masterHDNode, thisDerivationPath)
        console.log('addressesWithHistory: ', addressesWithHistory)
      }

      // Loop through each derivation in the array.
      // this.derivePathes.forEach(derivePath => {
      //   // Scan each derivation path for addresses with a transaction history.
      //   this.scanDerivationPath(masterHDNode, derivePath).then(
      //     addressesWithHistory => {
      //       if (addressesWithHistory.length === 0) {
      //         console.log(`No history found on derivation path ${derivePath}`)
      //       } else {
      //         // Display each address found with a transaction history.
      //         addressesWithHistory.forEach(element => {
      //           console.log(
      //             `${element.address} - confirmed balance: ${element.balance.confirmed} unconfirmed balance: ${element.balance.unconfirmed}`
      //           )
      //         })
      //       }
      //     }
      //   )
      // })
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
      console.log(`Scanning derivation path ${derivePath}...`)

      const addressesWithHistory = []

      // Scan 20 addresses for balances.
      let limit = 20
      for (let index = 0; index <= limit; index++) {
        const derivedChildPath = `${derivePath}/${index}`
        console.log(`derivedChildPath: ${derivedChildPath}`)

        // Generate a BCH address.
        const derivedChildAddress = this.deriveAddress(
          masterHDNode,
          derivedChildPath
        )
        console.log(`Scanning ${derivedChildPath} at address ${derivedChildAddress}`)

        // Check for a transaction history for the address.
        const historyBalanceData = await this.addressHasTransactionHistoryBalance(
          derivedChildAddress
        )
        console.log(`historyBalanceData: ${JSON.stringify(historyBalanceData, null, 2)}`)

        // If a history is found, increase the limit by another 20 addresses.
        if (historyBalanceData.hasHistory) {
          addressesWithHistory.push({
            address: derivedChildAddress,
            balance: historyBalanceData.balance
          })
          limit += 20
        }
      }

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

  // Generates a child HDNode from masterHDNode using derivePath.
  // Returns the BCH address for that child HDNode.
  // old
  // generateDerivedAddress (masterHDNode, derivePath) {
  //   try {
  //     const derivedHDNode = this.bchjs.HDNode.derivePath(
  //       masterHDNode,
  //       derivePath
  //     )
  //     return this.bchjs.HDNode.toCashAddress(derivedHDNode)
  //   } catch (err) {
  //     console.log('Error in generateDerivedAddress()')
  //     throw err
  //   }
  // }

  // Queries ElectrumX for transaction history of address, if existed, gets
  // address balance too.
  async addressHasTransactionHistoryBalance (address) {
    try {
      // let balance = { confirmed: 0, unconfirmed: 0 }
      let balance = 0

      // Get transaction history for the address.
      // const transactions = await this.bchjs.Electrumx.transactions(
      //   address
      // ).catch(err => {
      //   console.log(err)
      // })
      const transactions = await this.bchWallet.getTransactions(address)
      // console.log(`transactions: ${JSON.stringify(transactions, null, 2)}`)

      let hasHistory = false
      if (transactions && transactions.length) {
        // hasHistory =
        //   transactions.success && transactions.transactions.length > 0
        hasHistory = true
      }
      console.log(`hasHistory: ${hasHistory}`)

      // If a transaction history is detected, get the balance for the address.
      if (hasHistory) {
        // const balanceData = await this.BCHJS.Electrumx.balance(address).catch(
        //   err => {
        //     console.log(err)
        //   }
        // )

        const balanceData = await this.bchWallet.getBalance(address)
        console.log(`balanceData: ${JSON.stringify(balanceData, null, 2)}`)

        balance = balanceData
      }

      return { hasHistory: hasHistory, balance: balance }
    } catch (err) {
      console.log('Error in addressHasTransactionHistoryBalance()')
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
flag is used to pass it a mnemonic phrase.

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
