/*
  This command is used to generate a TXID for attaching mutable data to a token.
  Given a BCH address, it generates a transaction to turn that address into
  the controller of mutable data for a token. This generates a TXID which is
  used in the tokens 'documentHash' field when creating the token.

  MDA is an acrynym for 'Mutable Data Address'

  PS002 specification for mutable data:
  https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps002-slp-mutable-data.md
*/

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')
const { Command, flags } = require('@oclif/command')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const WalletBalances = require('./wallet-balances')

class TokenMdaTx extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.BchWallet = BchWallet
    this.walletBalances = new WalletBalances()
  }

  async run () {
    try {
      const { flags } = this.parse(TokenMdaTx)
      // console.log('flags: ', flags)

      // Validate input flags
      this.validateFlags(flags)

      // Instantiate the wallet and bch-js
      await this.openWallet(flags)

      const hex = await this.generateMdaTx(flags)
      // console.log('hex: ', hex)

      // Broadcast the transaction to the blockchain network.
      const txid = await this.walletUtil.broadcastTx(this.wallet, hex)

      this.displayData(flags, txid)

      return txid
    } catch (err) {
      console.log('Error in token-mda-tx.js/run(): ', err.message)

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

  // Generate a hex string for a transaction that initializes the MDA.
  async generateMdaTx (flags) {
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
      const dust = 546

      // amount to send back to the sending address.
      // Subtract two dust transactions for minting baton and tokens.
      const remainder = originalAmount - dust * 1 - txFee

      // Generate the OP_RETURN data
      const script = [
        this.bchjs.Script.opcodes.OP_RETURN,
        Buffer.from(JSON.stringify({ mda: flags.mda }))
      ]

      // Compile the script array into a bitcoin-compliant hex encoded string.
      const data = this.bchjs.Script.encode(script)

      // Add the OP_RETURN output.
      transactionBuilder.addOutput(data, 0)

      // Send dust to the MSP address to cryptographically link it to this TX.
      transactionBuilder.addOutput(flags.mda, dust)

      // add output to send BCH remainder of UTXO.
      transactionBuilder.addOutput(this.wallet.walletInfo.address, remainder)

      // Generate a keypair from the change address.
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

  displayData (flags, txid) {
    console.log(`New Mutable Data Address ${flags.mda} initialized!`)
    console.log(`TXID: ${txid}`)
    console.log(`https://blockchair.com/bitcoin-cash/transaction/${txid}`)

    return true
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const walletName = flags.walletName
    if (!walletName || walletName === '') {
      throw new Error('You must specify a wallet with the -n flag.')
    }

    // Mutable data address
    const mda = flags.mda
    if (!mda || mda === '') {
      throw new Error('You must specify a mutable data address with the -a flag.')
    }

    return true
  }
}

TokenMdaTx.description = `Create TXID for token mutable data

MDA is an acrynym for 'Mutable Data Address'

This command is used to generate a TXID for attaching mutable data to a token.
Given a BCH address, it generates a transaction to turn that address into
the controller of mutable data for a token. This generates a TXID which is
used in the tokens 'documentHash' field when creating the token.

PS002 specification for mutable data:
https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps002-slp-mutable-data.md
`

TokenMdaTx.flags = {
  walletName: flags.string({ char: 'n', description: 'Name of wallet to pay for transaction' }),
  mda: flags.string({ char: 'a', description: 'Mutable data address' })
}

module.exports = TokenMdaTx
