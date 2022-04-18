/*
  Read e2e encrypted messages
*/

// Global npm libraries
const { Command, flags } = require('@oclif/command')
const EncryptLib = require('bch-encrypt-lib/index')
const Read = require('p2wdb/index').Read

// Local libraries
const WalletService = require('../lib/adapters/wallet-consumer')
const WalletUtil = require('../lib/wallet-util')

class MsgRead extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies
    this.walletService = new WalletService()
    this.encryptLib = new EncryptLib({
      bchjs: this.walletService.walletUtil.bchjs
    })
    this.Read = Read
    this.bchjs = this.walletService.walletUtil.bchjs
    this.walletUtil = new WalletUtil()
  }

  async run () {
    try {
      const { flags } = this.parse(MsgRead)

      // Validate input flags
      this.validateFlags(flags)

      // const filename = `${__dirname.toString()}/../../.wallets/${
      //   flags.name
      // }.json`

      // Instatiate all the libraries orchestrated by this function.
      await this.instanceLibs(flags)

      const result = await this.msgRead(flags)
      console.log(`Message:\n${result}`)

      return result
    } catch (error) {
      console.log('Error in msg-read.js/run(): ', error.message)

      return 0
    }
  }

  // Check for messages
  async msgRead (flags) {
    try {
      // Input validation
      if (!flags.name || typeof flags.name !== 'string') {
        throw new Error('Wallet name is required.')
      }

      const { txid } = flags

      // Get TX Data
      const txDataResult = await this.bchWallet.getTxData([txid])
      const txData = txDataResult[0]
      // console.log(`txData: ${JSON.stringify(txData, null, 2)}`)

      // get ipfs hash from tx OP_RETURN
      const hash = this.getHashFromTx(txData)

      // Get the encrypted message from P2WDB and decrypt it.
      const decryptedMsg = await this.getAndDecrypt(hash)

      return decryptedMsg
    } catch (error) {
      console.log('Error in msgRead()')
      throw error
    }
  }

  // Retrieve the encrypted data from the P2WDB and decrypt it.
  async getAndDecrypt (hash) {
    // get hash data from p2wd
    const hashData = await this.read.getByHash(hash)
    // console.log(`hashData: ${JSON.stringify(hashData, null, 2)}`)

    const encryptedStr = hashData.value.data
    const encryptedObj = JSON.parse(encryptedStr)
    const encryptedData = encryptedObj.data.data

    // decrypt message
    const messageHex = await this.encryptLib.encryption.decryptFile(
      this.bchWallet.walletInfo.privateKey,
      encryptedData
    )
    // console.log(`messageHex: ${messageHex}`)

    const buf = Buffer.from(messageHex, 'hex')
    const decryptedMsg = buf.toString('utf8')
    // console.log('Message :', decryptedMsg)

    return decryptedMsg
  }

  // Instatiate the various libraries used by msgSend(). These libraries are
  // encasulated in the 'this' object.
  async instanceLibs (flags) {
    const { name } = flags

    // Instantiate minimal-slp-wallet.
    this.bchWallet = await this.walletUtil.instanceWallet(name)
    const walletData = this.bchWallet.walletInfo

    // Instantiate the bch-message-lib library.
    this.msgLib = this.walletUtil.instanceMsgLib(this.bchWallet)

    // Instatiate the P2WDB Write library.
    const p2wdbConfig = {
      wif: walletData.privateKey
    }
    this.read = new this.Read(p2wdbConfig)

    return true
  }

  // decode and get transaction hash from OP_RETURN
  getHashFromTx (txData) {
    try {
      // Input validation
      if (!txData) {
        throw new Error('txData object is required.')
      }
      let hash = ''

      // Loop through all the vout entries in this transaction.
      for (let j = 0; j < txData.vout.length; j++) {
        // for (let j = 0; j < 5; j++) {
        const thisVout = txData.vout[j]
        // console.log(`thisVout: ${JSON.stringify(thisVout,null,2)}`)

        // Assembly code representation of the transaction.
        const asm = thisVout.scriptPubKey.asm
        // console.log(`asm: ${asm}`)

        // Decode the transactions assembly code.
        const msg = this.msgLib.memo.decodeTransaction(asm, '-21101')

        if (msg) {
          // Filter the code to see if it contains an IPFS hash And Subject.
          const data = this.msgLib.memo.filterMSG(msg, 'MSG IPFS')
          if (data && data.hash) {
            hash = data.hash
          }
        }
      }

      if (!hash) {
        throw new Error('Message not found!')
      }
      return hash
    } catch (error) {
      console.log('Error in getHashFromTx()')
      throw error
    }
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const txid = flags.txid
    const name = flags.name

    if (!txid || txid === '') {
      throw new Error('You must specify a txid with the -t flag.')
    }
    if (!name || name === '') {
      throw new Error('You must specify a wallet with the -n flag.')
    }
    return true
  }
}

MsgRead.description = 'Read signed messages'

MsgRead.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' }),
  txid: flags.string({ char: 't', description: 'Transaction ID' })
}

module.exports = MsgRead
