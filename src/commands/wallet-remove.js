'use strict'

const fs = require('fs').promises

const { Command, flags } = require('@oclif/command')

class WalletRemove extends Command {
  async run () {
    const { flags } = this.parse(WalletRemove)

    // Validate input flags
    this.validateFlags(flags)

    // const filename = `${__dirname.toString()}/../../.wallets/${flags.name}.json`
    const filename = this.getFilePath(flags.name)

    return this.removeWallet(filename)
  }

  getFilePath (walletName) {
    const filename = `${__dirname.toString()}/../../.wallets/${walletName}.json`
    return filename
  }

  async removeWallet (filename) {
    await fs.rm(filename)

    return true
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

WalletRemove.description = 'Remove an existing wallet.'

WalletRemove.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' })
}

module.exports = WalletRemove
