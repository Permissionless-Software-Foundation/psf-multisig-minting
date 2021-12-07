const WalletService = require('../lib/adapters/wallet-consumer')

const { Command, flags } = require('@oclif/command')

class MsgSend extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletService = new WalletService()
  }

  async run () {
    try {
      const { flags } = this.parse(MsgSend)

      // Validate input flags
      this.validateFlags(flags)

      const result = await this.msgSend(flags.bchAddress)

      return result
    } catch (error) {
      console.log('Error in p2wdb-write.js/run(): ', error.message)

      return 0
    }
  }

  async msgSend (bchAddress) {
    try {
      const pubKey = await this.walletService.getPubKey(bchAddress)
      console.log(pubKey)
      return pubKey
    } catch (error) {
      console.log('Error in msgSend()', error.message)
      throw error
    }
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const addr = flags.bchAddress
    if (!addr || addr === '') {
      throw new Error('You must specify a bch address with the -b flag.')
    }

    return true
  }
}

MsgSend.description = 'Send encrypted messages'

MsgSend.flags = {
  bchAddress: flags.string({ char: 'b', description: 'BCH Address' })
}

module.exports = MsgSend
