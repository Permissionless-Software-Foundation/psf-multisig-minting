/*
  This command is used to traverse an HD wallet and sweep any BCH and tokens
  to a given wallet. The receiving wallet must have some BCH to pay for
  transaction fees.
*/

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')
const Conf = require('conf')
const BchTokenSweep = require('bch-token-sweep/index')
const { Command, flags } = require('@oclif/command')

// Constants
// const EMTPY_ADDR_CUTOFF = 3

class WalletSweep extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies
    this.BchWallet = BchWallet
    this.conf = new Conf()
    this.BchTokenSweep = BchTokenSweep
  }

  async run () {
    try {
      const { flags } = this.parse(WalletSweep)

      // Ensure flags meet qualifiying critieria.
      this.validateFlags(flags)

      const receiverWif = await this.getReceiverWif(flags)
      // console.log(`receiverWif: ${receiverWif}`)

      if (flags.wif) {
        // Sweep a single WIF private key
        const txid = await this.sweepWif(flags, receiverWif)
        console.log('txid: ', txid)
      } else {
        // Sweep a series of WIF private keys generated from the mnemonic
        console.log('Sweeping mnemonic')
      }

      return true
    } catch (err) {
      // if (err.message) console.log(err.message)
      // else console.log('Error in .run: ', err)
      console.log('Error in scan-funds.js/run: ', err)
      throw err
    }
  }

  // Sweep a single WIF.
  async sweepWif (flags, receiverWif) {
    try {
      const sweeper = new this.BchTokenSweep(
        flags.wif,
        receiverWif,
        this.bchWallet
      )
      await sweeper.populateObjectFromNetwork()

      const hex = await sweeper.sweepTo(this.bchWallet.walletInfo.slpAddress)
      // return hex

      const txid = await this.bchWallet.ar.sendTx(hex)

      return txid
    } catch (err) {
      console.error('Error in sweepWif()')
      throw err
    }
  }

  // Instantiate the minimal-slp-wallet and get the WIF for the receiving wallet.
  async getReceiverWif (flags) {
    try {
      const filename = `${__dirname.toString()}/../../.wallets/${
        flags.name
      }.json`

      // Load the wallet file.
      const walletJSON = require(filename)
      const walletData = walletJSON.wallet

      // Get the currently selected REST server from the config.
      const restServer = this.conf.get('restServer')
      console.log(`restServer: ${restServer}`)

      // Configure and instantiate the minimal-slp-wallet library.
      const advancedConfig = {
        interface: 'consumer-api',
        restURL: restServer
      }
      this.bchWallet = new this.BchWallet(walletData.mnemonic, advancedConfig)

      // Wait for the wallet to initialize and retrieve UTXO data from the
      // blockchain.
      await this.bchWallet.walletInfoPromise

      // console.log(`walletInfo: ${JSON.stringify(this.bchWallet.walletInfo, null, 2)}`)

      return this.bchWallet.walletInfo.privateKey
    } catch (err) {
      console.error('Error in getReceiverWif()')
      throw err
    }
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    const mnemonic = flags.mnemonic
    const wif = flags.wif
    const name = flags.name

    if (!name) {
      throw new Error('Name of receiving wallet must be included.')
    }

    if (!wif && !mnemonic) {
      throw new Error('Either a WIF private key, or a 12-word mnemonic must be supplied.')
    }

    // Exit if number of mnemonic words is not 12.
    if (mnemonic && mnemonic.split(' ').length !== 12) {
      throw new Error('You must specify a mnemonic phrase of 12 words.')
    }

    if (wif && (wif[0] !== 'K' && wif[0] !== 'L')) {
      throw new Error('WIF private key must start with the letter L or K.')
    }

    // Specify default value if none is provided.
    // Convert the string to an integer.
    if (flags.derivation === undefined) {
      flags.derivation = 245
    } else {
      flags.derivation = parseInt(flags.derivation)
    }

    return true
  }
}

WalletSweep.description = `Sweep funds from one wallet into another

Sweep funds from a single private key (WIF) or a whole HD wallet (mnemonic)
into another wallet. Works for both BCH and tokens.

If the target wallet does not have enough funds to pay transaction fees, fees
are paid from the receiving wallet. In the case of a mnemonic, a derivation path
can be specified.

Either a WIF or a mnemonic must be specified.
`

WalletSweep.flags = {
  name: flags.string({
    char: 'n',
    description: 'name of receiving wallet'
  }),

  mnemonic: flags.string({
    char: 'm',
    description: '12-word mnemonic phrase, wrapped in quotes'
  }),

  wif: flags.string({
    char: 'w',
    description: 'WIF private key controlling funds of a single address'
  }),

  derivation: flags.string({
    char: 'd',
    description: 'Derivation path. Will default to 245 if not specified. Common values are 245, 145, and 0'
  })
}

module.exports = WalletSweep
