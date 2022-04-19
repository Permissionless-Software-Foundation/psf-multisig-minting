/*
  Create a JSON file for the purpose of spending a minting baton
*/

'use strict'

const fs = require('fs').promises
// const shelljs = require('shelljs')
// const Table = require('cli-table')

const { Command, flags } = require('@oclif/command')

class CreateSpendFile extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    // this.shelljs = shelljs
    this.fs = fs
  }

  async run () {
    try {
      const { flags } = this.parse(CreateSpendFile)

      // Validate input flags
      this.validateFlags(flags)

      await this.createSpendFile(flags)

      return true
    } catch (err) {
      console.log(err)
      return 0
    }
  }

  async createSpendFile (flags) {
    try {
      const filename1 = `${__dirname.toString()}/../../.wallets/${
        flags.name
      }.json`
      const filename2 = `${__dirname.toString()}/../../.wallets/${
        flags.newWallet
      }.json`

      const oldWallet = require(filename1)
      // console.log('oldWallet: ', oldWallet)
      const newWallet = require(filename2)
      // console.log('newWallet: ', newWallet)

      const spendFileObj = {
        currentPublicKey: oldWallet.wallet.publicKey,
        currentPrivateKey: oldWallet.wallet.privateKey,
        newPublicKey: newWallet.wallet.publicKey,
        newAddress: newWallet.wallet.cashAddress
      }

      const outFilename = `${__dirname.toString()}/../../spend-file-${
        flags.name
      }.json`
      await this.fs.writeFile(outFilename, JSON.stringify(spendFileObj, null, 2))

      console.log(`spend-file-${flags.name}.json created.`)

      return true
    } catch (err) {
      console.error('Error in createSpendFile()')
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

    const newWallet = flags.newWallet
    if (!newWallet || newWallet === '') {
      throw new Error('You must specify a *new* wallet with the -m flag.')
    }

    return true
  }
}

CreateSpendFile.description = `Generate a spend file for minting new tokens

This command generates a spend-file-<wallet name>.json file, which can be
submitted to the minting council for the purpose of minting new tokens with
a multisignature wallet.

- The -n flag specifies the current wallet that is used in the multisignature
wallet, which is currently holding the minting baton.

- The -m flag specifies a new wallet, which will be part of a new multisignature
wallet, which is where the minting baton will be tranfered to after the minting
transaction is broadcasted.
`

CreateSpendFile.flags = {
  name: flags.string({ char: 'n', description: 'Name of current wallet' }),
  newWallet: flags.string({ char: 'm', description: 'Name of new wallet' })
}

module.exports = CreateSpendFile
