/*
  Burn a quantity of SLP type-1 tokens.
*/

'use strict'

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
// const WalletService = require('../lib/adapters/wallet-service')
const WalletBalances = require('./wallet-balances')

const { Command, flags } = require('@oclif/command')

class TokenBurn extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.BchWallet = BchWallet
    this.walletBalances = new WalletBalances()
  }

  async run () {
    try {
      const { flags } = this.parse(TokenBurn)

      // Validate input flags
      this.validateFlags(flags)

      await this.openWallet(flags)

      const txid = await this.tokenBurn(flags)

      console.log(`TXID: ${txid}`)
      console.log('\nView this transaction on a block explorer:')
      console.log(`https://token.fullstack.cash/transactions/?txid=${txid}`)

      return txid
    } catch (err) {
      console.log('Error in token-burn.js/run(): ', err.message)

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

  // Burn a quantity of tokens.
  async tokenBurn (flags) {
    try {
      let txid = ''

      const qty = parseFloat(flags.qty)
      // console.log(`qty: ${qty}`)

      if (qty === 0) {
        // Special case where 0 signal 'burn all'
        txid = await this.wallet.burnAll(flags.tokenId)
      } else {
        // Normal burn of a specific quantity.
        txid = await this.wallet.burnTokens(
          qty,
          flags.tokenId
        )
      }

      return txid
    } catch (err) {
      console.error('Error in tokenBurn()')
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
        'You must specify a quantity of tokens with the -q flag.'
      )
    }

    const tokenId = flags.tokenId
    if (!tokenId || tokenId === '') {
      throw new Error('You must specify a token Id with the -t flag.')
    }

    return true
  }
}

TokenBurn.description = 'Burn a specific quantity of SLP tokens.'

TokenBurn.flags = {
  name: flags.string({ char: 'n', description: 'Name of wallet' }),
  qty: flags.string({ char: 'q', description: 'Quantity of tokens to burn. If quantity is 0, all tokens will be burned.' }),
  tokenId: flags.string({ char: 't', description: 'tokenId of token to burn' })
}

module.exports = TokenBurn
