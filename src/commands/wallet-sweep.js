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

// Local libraries
const WalletUtil = require('../lib/wallet-util')

// Constants
// const EMTPY_ADDR_CUTOFF = 3

class WalletSweep extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies
    this.BchWallet = BchWallet
    this.conf = new Conf()
    this.BchTokenSweep = BchTokenSweep
    this.walletUtil = new WalletUtil()

    // Gap limit. BIP standard is 20
    this.GAP = 20
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
        await this.sweepMnemonic(flags, receiverWif)
      }

      return true
    } catch (err) {
      // console.log(err.message)
      // if (err.message) console.log(err.message)
      console.log('Error in run(): ', err.message)
      // console.log('Error in scan-funds.js/run: ', err)
      throw err
    }
  }

  // Sweep an HD wallet by crawling each address it controlls, until a gap of
  // 20 addresses is found with no balance.
  async sweepMnemonic (flags, receiverWif) {
    try {
      // Collect all the addresses that need to be swept.
      const wifsToSweep = await this.scanMnemonic(flags)
      // console.log(`wifsToSweep: ${JSON.stringify(wifsToSweep, null, 2)}`)

      console.log('\nStarting to sweep funds...')

      // Loop through each address that needs to be swept.
      for (let i = 0; i < wifsToSweep.length; i++) {
        const thisKey = wifsToSweep[i]

        const inObj = { wif: thisKey.wif }

        try {
          const txid = await this.sweepWif(inObj, receiverWif)

          console.log(`Swept funds from ${thisKey.addr}. TXID: ${txid}`)
          console.log(`https://blockchair.com/bitcoin-cash/transaction/${txid}`)
        } catch (err) {
          console.log(`Error trying to sweep ${thisKey.addr}: ${err.message}`)
        }

        // Wait for indexer state to update
        await this.bchWallet.bchjs.Util.sleep(2000)
      }

      return true
    } catch (err) {
      console.error('Error in sweepMnemonic()')
      throw err
    }
  }

  // Scan a mnemonic for address with a balance. This function returns an array
  // of objects. Each object contains an address, WIF, and HD index. The array
  // is populated when an address is detected with a balance.
  async scanMnemonic (flags) {
    try {
      const outArray = []

      console.log(`\nScanning derivation path ${flags.derivation}...`)

      // Initialize the HD wallet 'node'
      const rootSeed = await this.bchWallet.bchjs.Mnemonic.toSeed(flags.mnemonic)
      const masterHDNode = this.bchWallet.bchjs.HDNode.fromSeed(rootSeed)
      const derivationPath = `m/44'/${flags.derivation}'/0'/0`

      let limit = this.GAP
      for (let index = 0; index <= limit; index++) {
        const derivedChildPath = `${derivationPath}/${index}`

        // Generate a BCH address.
        const { addr, wif } = this.deriveKey(
          masterHDNode,
          derivedChildPath
        )
        console.log(`Scanning ${derivedChildPath} at address ${addr}`)

        const balance = await this.bchWallet.getBalance(addr)
        // console.log('balance: ', balance)

        if (balance) {
          const addrObj = { addr, wif, index }
          outArray.push(addrObj)
          console.log(`  ..balance of ${balance} sats found.`)

          limit = index + this.GAP
        }
      }

      return outArray
    } catch (err) {
      console.error('Error in scanMnemonic()')
      throw err
    }
  }

  // Generates a BCH address from the HD node and the derivation path.
  // Returns an object containing the BCH address and WIF private key.
  deriveKey (masterHDNode, derivePath) {
    try {
      const derivedHDNode = this.bchWallet.bchjs.HDNode.derivePath(
        masterHDNode,
        derivePath
      )

      const addr = this.bchWallet.bchjs.HDNode.toCashAddress(derivedHDNode)
      const wif = this.bchWallet.bchjs.HDNode.toWIF(derivedHDNode)

      return { addr, wif }
    } catch (err) {
      console.log('Error in deriveAddress()')
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

      // Configure and instantiate the minimal-slp-wallet library.
      const advancedConfig = this.walletUtil.getRestServer()
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
