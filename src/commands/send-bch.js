/*
  Sends a quantity of BCH.
*/

'use strict'

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const WalletService = require('../lib/adapters/wallet-service')

const {Command, flags} = require('@oclif/command')

class SendBch extends Command {
  constructor(argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.BchWallet = BchWallet
  }

  async run() {
    try {
      const {flags} = this.parse(SendBch)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${
        flags.name
      }.json`

      const result = await this.sendBch(filename, flags)
      // console.log('result: ', result)

      if (!result.success) {
        console.log('Error sending BCH: ', result)
        return 0
      }

      const txid = result.txid

      console.log(`TXID: ${txid}`)
      console.log('\nView this transaction on a block explorer:')
      console.log(`https://explorer.bitcoin.com/bch/tx/${txid}`)

      return txid
    } catch (err) {
      if (err.message) console.log(err.message)
      else console.log('Error in send-bch.js/run(): ', err)

      return 0
    }
  }

  // Send BCH from the wallet implied by filename, and with the settings saved
  // in the flags object.
  async sendBch(filename, flags) {
    try {
      // Input validation
      if (!filename || typeof filename !== 'string') {
        throw new Error('filename required.')
      }

      // Load the wallet file.
      const walletJSON = require(filename)
      const walletData = walletJSON.wallet

      // Configure the minimal-slp-wallet library.
      const walletService = new WalletService()
      const advancedConfig = {
        interface: 'json-rpc',
        jsonRpcWalletService: walletService,
      }

      // Wait for the wallet to be created.
      this.bchWallet = new this.BchWallet(walletData.mnemonic, advancedConfig)
      await this.bchWallet.walletInfoPromise

      // Loop through each BCH UTXO and add up the balance.
      let bchBalance = 0
      for (let i = 0; i < this.bchWallet.utxos.utxoStore.bchUtxos.length; i++) {
        const thisUtxo = this.bchWallet.utxos.utxoStore.bchUtxos[i]

        bchBalance += thisUtxo.value
      }
      const coinBalance =
        this.bchWallet.bchjs.BitcoinCash.toBitcoinCash(bchBalance)
      // console.log(`BCH balance: ${bchBalance} satoshis or ${coinBalance} BCH`)

      if (coinBalance < flags.qty)
        throw new Error(
          `Insufficient funds. You are trying to send ${flags.qty} BCH, but the wallet only has ${coinBalance} BCH`,
        )

      const receivers = [
        {
          address: flags.sendAddr,
          amountSat: this.bchWallet.bchjs.BitcoinCash.toSatoshi(flags.qty),
        },
      ]

      const txid = await this.bchWallet.send(receivers)
      return txid
    } catch (err) {
      console.error('Error in sendBch()')
      throw err
    }
  }
  //
  // // Create a new wallet file.
  // async createWallet(filename, desc) {
  //   try {
  //     if (!filename || typeof filename !== 'string') {
  //       throw new Error('filename required.')
  //     }
  //
  //     if (!desc) desc = ''
  //
  //     // Configure the minimal-slp-wallet library to use the JSON RPC over IPFS.
  //     const walletService = new WalletService()
  //     const advancedConfig = {
  //       interface: 'json-rpc',
  //       jsonRpcWalletService: walletService,
  //       noUpdate: true,
  //     }
  //
  //     // Wait for the wallet to be created.
  //     this.bchWallet = new this.BchWallet(undefined, advancedConfig)
  //     await this.bchWallet.walletInfoPromise
  //
  //     // console.log('bchWallet.walletInfo: ', this.bchWallet.walletInfo)
  //
  //     // Create the initial wallet JSON object.
  //     const walletData = {
  //       wallet: this.bchWallet.walletInfo,
  //     }
  //     walletData.wallet.description = desc
  //
  //     // Write out the basic information into a json file for other apps to use.
  //     await this.walletUtil.saveWallet(filename, walletData)
  //
  //     return walletData.wallet
  //   } catch (err) {
  //     if (err.code !== 'EEXIT') console.log('Error in createWallet().')
  //     throw err
  //   }
  // }

  // Validate the proper flags are passed in.
  validateFlags(flags) {
    // Exit if wallet not specified.
    const name = flags.name
    if (!name || name === '') {
      throw new Error('You must specify a wallet with the -n flag.')
    }

    const qty = flags.qty
    if (isNaN(Number(qty))) {
      throw new TypeError(
        'You must specify a quantity in BCH with the -q flag.',
      )
    }

    const sendAddr = flags.sendAddr
    if (!sendAddr || sendAddr === '') {
      throw new Error('You must specify a send-to address with the -a flag.')
    }

    return true
  }
}

SendBch.description = 'Send BCH'

SendBch.flags = {
  name: flags.string({char: 'n', description: 'Name of wallet'}),
  qty: flags.string({char: 'q', description: 'Quantity in BCH'}),
  sendAddr: flags.string({char: 'a', description: 'Cash address to send to'}),
}

module.exports = SendBch
