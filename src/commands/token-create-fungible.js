/*
  This command is used to create a new SLP Type1 fungible token.
*/

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')
const { Command, flags } = require('@oclif/command')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const WalletBalances = require('./wallet-balances')

class TokenCreateFungible extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.BchWallet = BchWallet
    this.walletBalances = new WalletBalances()
  }

  async run () {
    try {
      const { flags } = this.parse(TokenCreateFungible)
      // console.log('flags: ', flags)

      // Validate input flags
      this.validateFlags(flags)

      // Instantiate the wallet and bch-js
      await this.openWallet(flags)

      const hex = await this.generateTokenTx(flags)
      // console.log('hex: ', hex)

      // Broadcast the transaction to the blockchain network.
      // const txid = await this.wallet.ar.sendTx(hex)
      const txid = await this.walletUtil.broadcastTx(this.wallet, hex)

      console.log(`New token ${flags.ticker} created! Token ID: ${txid}`)
      console.log(`https://token.fullstack.cash/transactions/?txid=${txid}`)

      return txid
    } catch (err) {
      console.log('Error in token-create-fungible.js/run(): ', err)

      return 0
    }
  }

  async openWallet (flags) {
    // Instantiate the wallet and bch-js
    const wallet = await this.walletUtil.instanceWallet(flags.walletName)
    this.wallet = wallet
    const bchjs = wallet.bchjs
    this.bchjs = bchjs

    return wallet
  }

  // Generate a hex string transaction that will bring the token into existence.
  async generateTokenTx (flags) {
    try {
      // Get a UTXO to pay for the transaction
      const bchUtxos = this.wallet.utxos.utxoStore.bchUtxos
      if (bchUtxos.length === 0) throw new Error('No BCH UTXOs available to pay for transaction.')

      // Pay for the tx with the biggest UTXO in the array.
      const bchUtxo = this.bchjs.Utxo.findBiggestUtxo(bchUtxos)
      // console.log(`bchUtxo: ${JSON.stringify(bchUtxo, null, 2)}`)

      // instance of transaction builder
      const transactionBuilder = new this.bchjs.TransactionBuilder()

      const originalAmount = bchUtxo.value
      const vout = bchUtxo.tx_pos
      const txid = bchUtxo.tx_hash

      // add input with txid and index of vout
      transactionBuilder.addInput(txid, vout)

      // Set the transaction fee. Manually set for ease of example.
      const txFee = 550

      // amount to send back to the sending address.
      // Subtract two dust transactions for minting baton and tokens.
      const remainder = originalAmount - 546 * 2 - txFee

      // Determine minting baton
      let mintBaton = null // Default is burn mint baton
      if (flags.baton) mintBaton = 2 // 2nd output of tx

      // Determine setting for document URL
      let documentUrl = ''
      if (flags.url) documentUrl = flags.url

      // Determine setting for document hash
      let documentHash = ''
      if (flags.hash) documentHash = flags.hash

      // Generate SLP config object
      const configObj = {
        name: flags.tokenName,
        ticker: flags.ticker,
        documentUrl,
        decimals: flags.decimals,
        initialQty: flags.qty,
        documentHash,
        mintBatonVout: mintBaton
      }

      // Generate the OP_RETURN entry for an SLP GENESIS transaction.
      const script = this.bchjs.SLP.TokenType1.generateGenesisOpReturn(configObj)

      // OP_RETURN needs to be the first output in the transaction.
      transactionBuilder.addOutput(script, 0)

      // Send dust transaction representing the tokens.
      const cashAddress = this.wallet.walletInfo.cashAddress
      transactionBuilder.addOutput(
        this.bchjs.Address.toLegacyAddress(cashAddress),
        546
      )

      // Send dust transaction representing minting baton.
      if (mintBaton) {
        transactionBuilder.addOutput(
          this.bchjs.Address.toLegacyAddress(cashAddress),
          546
        )
      }

      // add output to send BCH remainder of UTXO.
      transactionBuilder.addOutput(cashAddress, remainder)

      // Generate a keypair from the change address.
      // const keyPair = bchjs.HDNode.toKeyPair(change)
      const keyPair = this.bchjs.ECPair.fromWIF(this.wallet.walletInfo.privateKey)

      // Sign the transaction with the HD node.
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )

      // build tx
      const tx = transactionBuilder.build()
      // output rawhex
      const hex = tx.toHex()

      return hex
    } catch (err) {
      console.error('Error in generateTokenTx()')
      throw err
    }
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const walletName = flags.walletName
    if (!walletName || walletName === '') {
      throw new Error('You must specify a wallet with the -n flag.')
    }

    const tokenName = flags.tokenName
    if (!tokenName || tokenName === '') {
      throw new Error('You must specify a name for the token with the -m flag.')
    }

    const ticker = flags.ticker
    if (!ticker || ticker === '') {
      throw new Error('You must specify a ticker for the token with the -t flag.')
    }

    const decimals = flags.decimals
    if (isNaN(Number(decimals))) {
      throw new TypeError(
        'You must specify the decimals of the token the -d flag.'
      )
    }

    const qty = flags.qty
    if (isNaN(Number(qty))) {
      throw new TypeError(
        'You must specify a quantity of tokens to create with the -q flag.'
      )
    }

    return true
  }
}

TokenCreateFungible.description = `Create a new SLP Type1 fugible token.

Creating a minting baton is optional. If a baton address is not specified, then the
baton is burned and makes the it a 'fixed supply' token.
`

TokenCreateFungible.flags = {
  walletName: flags.string({ char: 'n', description: 'Name of wallet to pay for transaction' }),
  ticker: flags.string({ char: 't', description: 'Ticker of the group' }),
  tokenName: flags.string({ char: 'm', description: 'Name of token' }),
  decimals: flags.string({ char: 'd', description: 'Decimals used by the token' }),
  qty: flags.string({ char: 'q', description: 'Quantity of tokens to create' }),
  url: flags.string({ char: 'u', description: '(optional) Document URL of the group' }),
  hash: flags.string({ char: 'h', description: '(optional) Document hash of the group' }),
  baton: flags.boolean({ char: 'b', description: '(optional) create a minting baton', default: false })
}

module.exports = TokenCreateFungible
