/*
  Create a JSON file for the purpose of spending a minting baton. Encrypt the
  file and send it to the BCH address of an aggregator.
*/

'use strict'

// Global npm libraries
const fs = require('fs').promises
const { Command, flags } = require('@oclif/command')

// Local libraries
const MsgSend = require('./msg-send')

class SendSpendFile extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.fs = fs
    this.msgSend = new MsgSend()
  }

  async run () {
    try {
      const { flags } = this.parse(SendSpendFile)

      // Validate input flags
      this.validateFlags(flags)

      const spendFileObj = await this.createSpendFile(flags)

      await this.sendSpendFile(flags, spendFileObj)

      return true
    } catch (err) {
      console.log(err)
      return 0
    }
  }

  // Send an encrypted spend file to a BCH address.
  async sendSpendFile (flags, spendFileObj) {
    try {
      const sendFlags = {
        name: flags.name,
        bchAddress: flags.address,
        subject: `spend file: ${spendFileObj.currentAddress}`,
        message: JSON.stringify(spendFileObj, null, 2)
      }

      const txid = await this.msgSend.msgSend(sendFlags)
      console.log(`File sent with TXID: ${txid}`)

      return txid
    } catch (err) {
      console.error('Error in sendSpendFile()')
      throw err
    }
  }

  // Generate a 'spend file' object, which contains the information needed to
  // spend the minting baton from the multisignature wallet.
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
        currentAddress: oldWallet.wallet.cashAddress,
        newPublicKey: newWallet.wallet.publicKey,
        newAddress: newWallet.wallet.cashAddress
      }

      // const outFilename = `${__dirname.toString()}/../../spend-file-${
      //   flags.name
      // }.json`
      // await this.fs.writeFile(outFilename, JSON.stringify(spendFileObj, null, 2))
      //
      // console.log(`spend-file-${flags.name}.json created.`)

      return spendFileObj
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

    const address = flags.address
    if (!address || address === '') {
      throw new Error('You must specify an address to send the file to with the -a flag.')
    }

    return true
  }
}

SendSpendFile.description = `Generate a spend file for minting new tokens

This command generates a spend-file-<wallet name>.json file, which can be
submitted to the minting council for the purpose of minting new tokens with
a multisignature wallet.

- The -n flag specifies the current wallet that is used in the multisignature
wallet, which is currently holding the minting baton.

- The -m flag specifies a new wallet, which will be part of a new multisignature
wallet, which is where the minting baton will be tranfered to after the minting
transaction is broadcasted.
`

SendSpendFile.flags = {
  name: flags.string({ char: 'n', description: 'Name of current wallet' }),
  newWallet: flags.string({ char: 'm', description: 'Name of new wallet' }),
  address: flags.string({ char: 'a', description: 'BCH Address to send file to' })
}

module.exports = SendSpendFile
