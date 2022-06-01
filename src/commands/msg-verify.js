/*
  Cryptographically verify a signed message.
*/

// Public npm libraries
const { Command, flags } = require('@oclif/command')
const BchWallet = require('minimal-slp-wallet/index')

// Local libraries
const WalletUtil = require('../lib/wallet-util')

class MsgVerify extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.wallet = new BchWallet(undefined, { noUpdate: true, interface: 'consumer-api' })
    this.bchjs = this.wallet.bchjs
  }

  async run () {
    try {
      const { flags } = this.parse(MsgVerify)

      // Validate input flags
      this.validateFlags(flags)

      const result = this.verifySig(flags)
      // console.log('result: ', result)

      console.log(`\nSignature is valid: ${result}`)

      return true
    } catch (err) {
      console.log('Error in msg-sign.js/run(): ', err.message)

      return 0
    }
  }

  // Verify the signature is valid.
  verifySig (flags) {
    try {
      const result = this.bchjs.BitcoinCash.verifyMessage(
        flags.bchAddr,
        flags.sig,
        flags.msg
      )

      return result
    } catch (err) {
      console.log('Error in verifySig().')
      throw err
    }
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const bchAddr = flags.bchAddr
    if (!bchAddr || bchAddr === '') {
      throw new Error('You must specify the BCH address of the signer with the -b flag.')
    }

    const msg = flags.msg
    if (!msg || msg === '') {
      throw new Error('You must specify the cleartext message used to generate the signature with the -m flag.')
    }

    const sig = flags.sig
    if (!sig || sig === '') {
      throw new Error('You must specify the signature with the -s flag.')
    }

    return true
  }
}

MsgVerify.description = `Verify a signed message

Verify the authenticity of a signed message.
`

MsgVerify.flags = {
  bchAddr: flags.string({ char: 'b', description: 'BCH address of signer.' }),

  msg: flags.string({
    char: 'm',
    description: 'Cleartext message used to generate the signature.'
  }),

  sig: flags.string({
    char: 's',
    description: 'Signature to verify.'
  })
}

module.exports = MsgVerify
