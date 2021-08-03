/*
  Update the wallet balance, including BCH and tokens.
*/

'use strict'

// Public NPM libraries
// const BCHJS = require('@psf/bch-js')
const Conf = require('conf')

// Local libraries
const WalletUtil = require('../lib/wallet-util')

const { Command, flags } = require('@oclif/command')

const fs = require('fs')

class WalletUpdate extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    // this.bchjs = new BCHJS()
    this.fs = fs
    this.walletUtil = new WalletUtil()
    this.conf = new Conf()
  }

  async run () {
    try {
      const { flags } = this.parse(WalletUpdate)

      // Validate input flags
      this.validateFlags(flags)

      const filename = `${__dirname.toString()}/../../.wallets/${
        flags.name
      }.json`

      return this.updateWallet(filename)
    } catch (err) {
      if (err.message) console.log(err.message)
      else console.log('Error in create-wallet.js/run(): ', err)

      return 0
    }
  }

  async updateWallet (filename) {
    try {
      const serviceId = this.conf.get('selectedService')
      console.log(`serviceId: ${serviceId}`)
    } catch (err) {
      console.error('Error in updateWallet()')
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

WalletUpdate.description = 'Generate a new HD Wallet.'

WalletUpdate.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' })
}

module.exports = WalletUpdate
