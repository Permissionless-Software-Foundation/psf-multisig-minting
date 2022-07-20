/*
  Cryptographically sign a message.
*/

// Public npm libraries
const { Command, flags } = require('@oclif/command')

// Local libraries
const WalletUtil = require('../lib/wallet-util')

class MsgSign extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
  }

  async run () {
    try {
      const { flags } = this.parse(MsgSign)

      // Validate input flags
      this.validateFlags(flags)

      // Sign the message
      const sigObj = await this.sign(flags)
      // console.log('sig: ', sig)

      console.log(`\nBCH address: \n${sigObj.bchAddr}\n`)
      console.log(`Clear-text message: \n${sigObj.msg}\n`)
      console.log(`Signature: \n${sigObj.signature}\n`)

      return true
    } catch (err) {
      console.log('Error in msg-sign.js/run(): ', err.message)

      return 0
    }
  }

  // async sign (filename, sendAddrIndex, message) {
  async sign (flags) {
    try {
      // Instantiate the wallet.
      const wallet = await this.walletUtil.instanceWallet(flags.name)
      // console.log(`walletInfo: ${JSON.stringify(wallet.walletInfo, null, 2)}`)

      this.bchjs = wallet.bchjs

      const privKeyWIF = wallet.walletInfo.privateKey

      const signature = this.bchjs.BitcoinCash.signMessageWithPrivKey(
        privKeyWIF,
        flags.msg
      )

      const outObj = {
        signature,
        bchAddr: wallet.walletInfo.cashAddress,
        msg: flags.msg
      }

      return outObj
    } catch (err) {
      console.log('Error in sign().')
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

    const msg = flags.msg
    if (!msg || msg === '') {
      throw new Error('You must specify a cleartext message to sign with the -m flag.')
    }

    return true
  }
}

MsgSign.description = `Cryptographically sign a message.

Generate a signature from a clear-text message and the private key of your wallet.
The system verifying the signature will also need the BCH address of the walllet.
`

MsgSign.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' }),
  msg: flags.string({
    char: 'm',
    description: 'Cleartext message to sign'
  })
}

module.exports = MsgSign
