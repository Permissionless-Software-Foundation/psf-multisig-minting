/*
  Read signed messages
*/

const WalletService = require('../lib/adapters/wallet-consumer')

const { Command, flags } = require('@oclif/command')
const EncryptLib = require('bch-encrypt-lib/index')
const MessagesLib = require('bch-message-lib/index')
const Read = require('p2wdb/index').Read

class MsgRead extends Command {
  constructor (argv, config) {
    super(argv, config)

    this.walletService = new WalletService()
    this.encryptLib = new EncryptLib({
      bchjs: this.walletService.walletUtil.bchjs
    })
    this.messagesLib = new MessagesLib({
      bchjs: this.walletService.walletUtil.bchjs
    })
    this.Read = Read
    this.bchjs = this.walletService.walletUtil.bchjs
  }

  async run () {
    try {
      const { flags } = this.parse(MsgRead)

      // Validate input flags
      this.validateFlags(flags)
      const filename = `${__dirname.toString()}/../../.wallets/${flags.name
        }.json`

      const result = await this.msgRead(filename, flags.txid)

      return result
    } catch (error) {
      console.log('Error in msg-read.js/run(): ', error.message)

      return 0
    }
  }

  // Check for messages
  async msgRead (filename, txid) {
    try {
      // Input validation
      if (!filename || typeof filename !== 'string') {
        throw new Error('filename is required.')
      }

      // Load the wallet file.
      const walletJSON = require(filename)
      const walletData = walletJSON.wallet
      // p2wdb config
      const p2wdbConfig = {
        wif: walletData.privateKey
      }
      this.read = new this.Read(p2wdbConfig)
      // get tx data
      const txDataResult = await this.bchjs.RawTransactions.getRawTransaction(
        [txid],
        true
      )
      const txData = txDataResult[0]
      // get ipfs hash from tx OP_RETURN
      const hash = this.getHashFromTx(txData)

      // get hash data from p2wd
      const hashData = await this.read.getByHash(hash)

      const encryptedStr = hashData.value.data
      const encryptedObj = JSON.parse(encryptedStr)
      const encryptedData = encryptedObj.data.data

      // decrypt message
      const messageHex = await this.encryptLib.encryption.decryptFile(walletData.privateKey, encryptedData)
      const buf = Buffer.from(messageHex, 'hex')
      const decryptedMsg = buf.toString('utf8')
      console.log('Message :', decryptedMsg)

      return decryptedMsg
    } catch (error) {
      console.log('Error in msgRead()', error)
      throw error
    }
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
        const msg = this.messagesLib.memo.decodeTransaction(asm, '-21101')

        if (msg) {
          // Filter the code to see if it contains an IPFS hash And Subject.
          const data = this.messagesLib.memo.filterMSG(msg, 'MSG IPFS')
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
      console.log('Error in getHashFromTx()', error)
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
