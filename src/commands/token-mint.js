/*
  Mint additional fungible (Type 1) or Group tokens if the wallet has a minting
  baton.
*/

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')
const { Command, flags } = require('@oclif/command')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const WalletBalances = require('./wallet-balances')

class TokenMint extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.BchWallet = BchWallet
    this.walletBalances = new WalletBalances()
  }

  async run () {
    try {
      const { flags } = this.parse(TokenMint)
      // console.log('flags: ', flags)

      // Validate input flags
      this.validateFlags(flags)

      // Instantiate the wallet and bch-js
      await this.openWallet(flags)

      const hex = await this.generateMintTx(flags)
      // console.log('hex: ', hex)

      // Broadcast the transaction to the blockchain network.
      // const txid = await this.wallet.ar.sendTx(hex)
      const txid = await this.walletUtil.broadcastTx(this.wallet, hex)

      console.log('\nNew tokens minted!')
      console.log(`https://token.fullstack.cash/transactions/?txid=${txid}`)

      return txid
    } catch (err) {
      console.log('Error in token-mint.js/run(): ', err.message)

      return 0
    }
  }

  async openWallet (flags) {
    // Instantiate the wallet and bch-js
    const wallet = await this.walletUtil.instanceWallet(flags.name)
    this.wallet = wallet
    const bchjs = wallet.bchjs
    this.bchjs = bchjs

    return wallet
  }

  // Generate a hex string transaction that will bring the token into existence.
  async generateMintTx (flags) {
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

      // Get mint batons.
      const mintBatons = this.wallet.utxos.utxoStore.slpUtxos.type1.mintBatons.concat(
        this.wallet.utxos.utxoStore.slpUtxos.group.mintBatons
      )

      // Filter out the batons for the selected token.
      const filteredBatons = mintBatons.filter(x => x.tokenId === flags.tokenId)
      if (filteredBatons.length === 0) {
        throw new Error(`A minting baton for token ID ${flags.tokenId} could not be found in the wallet.`)
      }

      const mintBaton = filteredBatons[0]
      // console.log(`mintBaton: ${JSON.stringify(mintBaton, null, 2)}`)

      // add the mint baton as an input.
      transactionBuilder.addInput(mintBaton.tx_hash, mintBaton.tx_pos)

      // Set the transaction fee. Manually set for ease of example.
      const txFee = 550

      // amount to send back to the sending address.
      // Subtract two dust transactions for minting baton and tokens.
      const remainder = originalAmount - 546 * 2 - txFee

      // Destroy the baton?
      let destroyBaton = false
      if (flags.receiver === 'null') destroyBaton = true

      // Generate the OP_RETURN entry for an SLP MINT transaction.
      let script
      if (mintBaton.tokenType === 65) {
        script = this.bchjs.SLP.NFT1.mintNFTGroupOpReturn([mintBaton], flags.qty, destroyBaton)
      } else {
        // tokenType === 1 (fungible token)
        script = this.bchjs.SLP.TokenType1.generateMintOpReturn([mintBaton], flags.qty, destroyBaton)
      }

      // OP_RETURN needs to be the first output in the transaction.
      transactionBuilder.addOutput(script, 0)

      // Send dust transaction representing the tokens.
      const cashAddress = this.wallet.walletInfo.cashAddress
      transactionBuilder.addOutput(
        this.bchjs.Address.toLegacyAddress(cashAddress),
        546
      )

      // Send dust transaction representing minting baton.
      if (!destroyBaton) {
        if (flags.receiver) {
          transactionBuilder.addOutput(
            this.bchjs.Address.toLegacyAddress(flags.receiver),
            546
          )
        } else {
          transactionBuilder.addOutput(
            this.bchjs.Address.toLegacyAddress(cashAddress),
            546
          )
        }
      }

      // add output to send BCH remainder of UTXO.
      transactionBuilder.addOutput(cashAddress, remainder)

      // Generate a keypair from the change address.
      // const keyPair = bchjs.HDNode.toKeyPair(change)
      const keyPair = this.bchjs.ECPair.fromWIF(this.wallet.walletInfo.privateKey)

      // Sign the first input
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )

      // Sign the second input
      transactionBuilder.sign(
        1,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        mintBaton.value
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
    const name = flags.name
    if (!name || name === '') {
      throw new Error('You must specify a wallet with the -n flag.')
    }

    const qty = flags.qty
    if (isNaN(Number(qty))) {
      throw new TypeError(
        'You must specify a quantity of tokens to create with the -q flag.'
      )
    }

    const tokenId = flags.tokenId
    if (!tokenId || tokenId === '') {
      throw new Error('You must specifcy the SLP token ID.')
    }

    return true
  }
}

TokenMint.description = `Mint new Fungible (Type 1) or Group tokens

If the wallet contains a minting baton from creating a Fungible or Group token,
this command can be used to mint new tokens into existence.

The '-r' flag is optional. By default the minting baton will be sent back to the
origionating wallet. A different address can be specified by the -r flag. Passing
a value of 'null' will burn the minting baton, removing the ability to mint
new tokens.
`

TokenMint.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet to pay for transaction' }),
  qty: flags.string({ char: 'q', description: 'Quantity of tokens to create' }),
  tokenId: flags.string({ char: 't', description: 'Token ID' }),
  receiver: flags.string({ char: 'r', description: '(optional) Receiver of new baton. Defaults to same wallet. null burns baton.' })
}

module.exports = TokenMint
