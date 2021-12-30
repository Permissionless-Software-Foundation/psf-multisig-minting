const WalletService = require('../lib/adapters/wallet-consumer')

const { Command, flags } = require('@oclif/command')
const EncryptLib = require('bch-encrypt-lib')
const MessagesLib = require('bch-message-lib')

const eccrypto = require('eccrypto-js')
const Write = require('p2wdb/index').Write
// const Conf = require('conf')

class MsgSend extends Command {
  constructor (argv, config) {
    super(argv, config)
    // Encapsulate dependencies.
    // this.conf = new Conf()
    // this.restServer = this.conf.get('restServer')
    // console.log(`restServer: ${this.restServer}`)

    this.walletService = new WalletService()
    this.encryptLib = new EncryptLib({ bchjs: this.walletService.walletUtil.bchjs })
    this.messagesLib = new MessagesLib({ bchjs: this.walletService.walletUtil.bchjs })
    this.eccrypto = eccrypto
    this.Write = Write
  }

  async run () {
    try {
      const { flags } = this.parse(MsgSend)

      // Validate input flags
      this.validateFlags(flags)

      const result = await this.msgSend(flags)

      return result
    } catch (error) {
      console.log('Error in msg-send.js/run(): ', error.message)

      return 0
    }
  }

  async msgSend ({ bchAddress, message, name, subject }) {
    try {
      const filename = `${__dirname.toString()}/../../.wallets/${name
        }.json`

      // Load the wallet file.
      const walletJSON = require(filename)
      const walletData = walletJSON.wallet

      // p2wdb config
      const p2wdbConfig = {
        wif: walletData.privateKey
      }
      const write = new this.Write(p2wdbConfig)

      // Get public Key
      const pubKey = await this.walletService.getPubKey(bchAddress)
      const publicKey = pubKey.pubkey.publicKey
      console.log(`publicKey: ${JSON.stringify(publicKey, null, 2)}`)

      // const encryptedMsg = await this.bchEncryptMsg(publicKey, message)
      const encryptedMsg = await this.encryptMsg(publicKey, message)
      console.log(`encryptedMsg: ${JSON.stringify(encryptedMsg, null, 2)}`)

      // Write into p2wdb
      const appId = 'psf-bch-wallet'
      const data = {
        now: new Date(),
        data: encryptedMsg
      }

      const result = await write.postEntry(data, appId)
      console.log(`Data about P2WDB write: ${JSON.stringify(result, null, 2)}`)

      const hash = result.hash

      // Sign Message
      const txHex = await this.signalMessage(
        walletData.privateKey,
        hash,
        bchAddress,
        subject
      )
      // Broadcast Transaction
      const txidStr = await this.messagesLib.bchjs.RawTransactions.sendRawTransaction(txHex)
      console.log(`Transaction ID : ${JSON.stringify(txidStr, null, 2)}`)
      return txidStr
    } catch (error) {
      console.log('Error in msgSend()', error.message)
      throw error
    }
  }

  // Encrypt using eccrypto
  async encryptMsg (pubKey, msg) {
    try {
      // Encrypt the message with the public key.
      const pubKeyBuf = Buffer.from(pubKey, 'hex')
      const bufferedMessage = Buffer.from(msg, 'hex')

      const structuredEj = await this.eccrypto.encrypt(pubKeyBuf, bufferedMessage)
      // console.log(`structuredEj: ${JSON.stringify(structuredEj, null, 2)}`)

      // Serialize the encrypted data object
      const encryptedEj = Buffer.concat([
        structuredEj.ephemPublicKey,
        structuredEj.iv,
        structuredEj.ciphertext,
        structuredEj.mac
      ])

      const encryptedStr = encryptedEj.toString('hex')

      return encryptedStr
    } catch (error) {
      console.log('Error in encryptMsg()', error)
      throw error
    }
  }

  // Encrypt using encryptLib
  async bchEncryptMsg (pubKey, msg) {
    try {
      const buff = Buffer.from(msg)
      const hex = buff.toString('hex')

      const encryptedStr = await this.encryptLib.encryption.encryptFile(pubKey, hex)
      console.log(`encryptedStr: ${JSON.stringify(encryptedStr, null, 2)}`)
    } catch (error) {
      console.log('Error in bchEncryptMsg()', error)
      throw error
    }
  }

  async signalMessage (privateKey, hash, bchAddress, subject) {
    try {
      const txHex = await this.messagesLib.memo.writeMsgSignal(
        privateKey,
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
