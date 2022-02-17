/*
  Send an e2e encrypted message to another BCH address.
*/

// Global npm libraries
const { Command, flags } = require('@oclif/command')
const EncryptLib = require('bch-encrypt-lib/index')
const eccrypto = require('eccrypto-js')
const Write = require('p2wdb/index').Write

// Local libraries
const WalletService = require('../lib/adapters/wallet-consumer')
const WalletUtil = require('../lib/wallet-util')

class MsgSend extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletService = new WalletService()
    this.encryptLib = new EncryptLib({
      bchjs: this.walletService.walletUtil.bchjs
    })
    this.eccrypto = eccrypto
    this.Write = Write
    this.walletUtil = new WalletUtil()
  }

  async run () {
    try {
      const { flags } = this.parse(MsgSend)

      // Validate input flags
      this.validateFlags(flags)
      // const filename = `${__dirname.toString()}/../../.wallets/${
      //   flags.name
      // }.json`

      const result = await this.msgSend(flags)

      return result
    } catch (error) {
      console.log('Error in msg-send.js/run(): ', error.message)

      return 0
    }
  }

  // Instatiate the various libraries used by msgSend(). These libraries are
  // encasulated in the 'this' object.
  async instanceLibs (flags) {
    const { bchAddress, message, subject, name } = flags

    // Instantiate minimal-slp-wallet.
    this.bchWallet = await this.walletUtil.instanceWallet(name)
    const walletData = this.bchWallet.walletInfo

    // Instantiate the bch-message-lib library.
    this.msgLib = this.walletUtil.instanceMsgLib(this.bchWallet)

    // Instatiate the P2WDB Write library.
    const p2wdbConfig = {
      wif: walletData.privateKey
    }
    this.write = new this.Write(p2wdbConfig)

    return true
  }

  // Encrypt the message and upload it to the P2WDB.
  async encryptAndUpload (flags) {
    const { bchAddress, message, subject, name } = flags

    // Get public Key for reciever from the blockchain.
    const pubKey = await this.walletService.getPubKey(bchAddress)
    const publicKey = pubKey.pubkey.publicKey
    console.log(`publicKey: ${JSON.stringify(publicKey, null, 2)}`)

    // Encrypt the message using the recievers public key.
    const encryptedMsg = await this.encryptMsg(publicKey, message)
    console.log(`encryptedMsg: ${JSON.stringify(encryptedMsg, null, 2)}`)

    // Upload the encrypted message to the P2WDB.
    const appId = 'psf-bch-wallet'
    const data = {
      now: new Date(),
      data: encryptedMsg
    }

    const result = await this.write.postEntry(data, appId)
    console.log(`Data about P2WDB write: ${JSON.stringify(result, null, 2)}`)

    const hash = result.hash

    // Return the hash used to uniquly identify this entry in the P2WDB.
    return hash
  }

  // Generate and broadcast a PS001 message signal.
  async sendMsgSignal (flags, hash) {
    const { bchAddress, message, subject, name } = flags

    // Wait a couple seconds to let the indexer update its UTXO state.
    await this.bchWallet.bchjs.Util.sleep(2000)

    // Update the UTXO store in the wallet.
    await this.bchWallet.getUtxos()

    // Sign Message
    const txHex = await this.signalMessage(hash, bchAddress, subject)

    // Broadcast Transaction
    const txidStr = await this.bchWallet.ar.sendTx(txHex)
    console.log(`Transaction ID : ${JSON.stringify(txidStr, null, 2)}`)

    return txidStr
  }

  // Primary function that orchistrates the workflow of sending an E2E encrypted
  // message to a BCH address.
  async msgSend (flags) {
    try {
      const { bchAddress, message, subject, name } = flags

      // Instatiate all the libraries orchestrated by this function.
      await this.instanceLibs(flags)

      // Encrypt the message and upload it to the P2WDB.
      const hash = await this.encryptAndUpload(flags)

      // Broadcast a PS001 signal on the blockchain, to signal the recipient
      // that they have a message waiting.
      const txid = await this.sendMsgSignal(flags, hash)

      return txid
    } catch (error) {
      console.log('Error in msgSend()')
      throw error
    }
  }

  // Encrypt a message using encryptLib
  async encryptMsg (pubKey, msg) {
    try {
      if (!pubKey || typeof pubKey !== 'string') {
        throw new Error('pubKey must be a string')
      }
      if (!msg || typeof msg !== 'string') {
        throw new Error('msg must be a string')
      }
      const buff = Buffer.from(msg)
      const hex = buff.toString('hex')

      const encryptedStr = await this.encryptLib.encryption.encryptFile(
        pubKey,
        hex
      )
      // console.log(`encryptedStr: ${JSON.stringify(encryptedStr, null, 2)}`)
      return encryptedStr
    } catch (error) {
      console.log('Error in encryptMsg()')
      throw error
    }
  }

  // Generate a PS001 signal message to write to the blockchain.
  // https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps001-media-sharing.md
  async signalMessage (hash, bchAddress, subject) {
    try {
      if (!hash || typeof hash !== 'string') {
        throw new Error('hash must be a string')
      }
      if (!bchAddress || typeof bchAddress !== 'string') {
        throw new Error('bchAddress must be a string')
      }
      if (!subject || typeof subject !== 'string') {
        throw new Error('subject must be a string')
      }

      // Generate the hex transaction containing the PS001 message signal.
      const txHex = await this.msgLib.memo.writeMsgSignal(
        hash,
        [bchAddress],
        subject
      )

      if (!txHex) {
        throw new Error('Could not build a hex transaction')
      }

      return txHex
    } catch (error) {
      console.log('Error in signalMessage')
      throw error
    }
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const addr = flags.bchAddress
    const message = flags.message
    const name = flags.name
    const subject = flags.subject

    if (!addr || addr === '') {
      throw new Error('You must specify a bch address with the -b flag.')
    }
    if (!message || message === '') {
      throw new Error('You must specify the message to send with the -m flag.')
    }
    if (!subject || subject === '') {
      throw new Error('You must specify the message subject with the -s flag.')
    }
    if (!name || name === '') {
      throw new Error('You must specify a wallet with the -n flag.')
    }
    return true
  }
}

MsgSend.description = 'Send encrypted messages'

MsgSend.flags = {
  bchAddress: flags.string({ char: 'b', description: 'BCH Address' }),
  message: flags.string({ char: 'm', description: 'Message to send' }),
  subject: flags.string({ char: 's', description: 'Message Subject' }),
  name: flags.string({ char: 'n', description: 'Name of wallet' })
}

module.exports = MsgSend
