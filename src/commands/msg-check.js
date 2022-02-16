/*
  Check for received messages in a wallet
*/

// Global npm libraries
const { Command, flags } = require('@oclif/command')
const EncryptLib = require('bch-encrypt-lib/index')
const MessagesLib = require('bch-message-lib/index')
const Write = require('p2wdb/index').Write
const Table = require('cli-table')
const BchWallet = require('minimal-slp-wallet/index')

// Local npm libraries
const WalletService = require('../lib/adapters/wallet-consumer')
const WalletUtil = require('../lib/wallet-util')

class MsgCheck extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies
    this.walletService = new WalletService()
    this.walletUtil = new WalletUtil()
    this.encryptLib = new EncryptLib({
      bchjs: this.walletService.walletUtil.bchjs
    })
    // this.messagesLib = new MessagesLib({
    //   bchjs: this.walletService.walletUtil.bchjs
    // })
    this.Write = Write
    this.Table = Table
  }

  async run () {
    try {
      const { flags } = this.parse(MsgCheck)

      // Validate input flags
      this.validateFlags(flags)
      const filename = `${__dirname.toString()}/../../.wallets/${
        flags.name
      }.json`

      const result = await this.msgCheck(filename, flags)

      return result
    } catch (error) {
      console.log('Error in msg-check.js/run(): ', error.message)

      return 0
    }
  }

  // Check for messages
  async msgCheck (filename) {
    try {
      // Input validation
      if (!filename || typeof filename !== 'string') {
        throw new Error('filename is required.')
      }

      this.bchWallet = await this.walletUtil.instanceWallet(filename)

      const cashAddress = this.bchWallet.walletInfo.cashAddress

      // Instantiate the bch-message-lib
      this.msgLib = new MessagesLib({ wallet: this.bchWallet })

      // Get message signals from the blockchain.
      const messages = await this.msgLib.memo.readMsgSignal(cashAddress)
      // console.log('message: ', messages)

      // Filter out sent messages, so user only sees recieved messages.
      const receiveMessages = this.filterMessages(cashAddress, messages)
      if (!receiveMessages.length) {
        console.log('No Messages Found!')
        return false
      }

      // Display the messages on the screen.
      this.displayTable(receiveMessages)

      return true
    } catch (error) {
      console.log('Error in msgCheck()', error)
      throw error
    }
  }

  // Display table in a table on the command line using cli-table.
  displayTable (data) {
    const table = new Table({
      head: ['Subject', 'Transaction ID'],
      colWidths: [25, 80]
    })

    for (let i = 0; i < data.length; i++) {
      const _data = [data[i].subject, data[i].txid]
      table.push(_data)
    }

    const tableStr = table.toString()

    // Cut down on screen spam when running unit tests.
    console.log(tableStr)

    return tableStr
  }

  // Ignores send messages
  // returns only received messages
  filterMessages (bchAddress, messages) {
    try {
      if (!bchAddress || typeof bchAddress !== 'string') {
        throw new Error('bchAddress must be a string.')
      }
      if (!Array.isArray(messages)) {
        throw new Error('messages must be an array.')
      }
      const filtered = []

      for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        if (message.sender !== bchAddress) {
          filtered.push(message)
        }
      }
      return filtered
    } catch (error) {
      console.log('Error in filterMessages()', error)
      throw error
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

MsgCheck.description = 'Check signed messages'

MsgCheck.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' })
}

module.exports = MsgCheck
