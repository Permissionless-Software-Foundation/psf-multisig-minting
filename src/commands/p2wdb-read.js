/*
  Read data from the P2WDB.
*/

'use strict'

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')
const axios = require('axios')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const WalletBalances = require('./wallet-balances')

const {Command, flags} = require('@oclif/command')

const PROOF_OF_BURN_QTY = 0.01
const P2WDB_TOKEN_ID =
  '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'

// const P2WDB_SERVER = 'http://localhost:5001/entry/write'
const P2WDB_SERVER = 'https://p2wdb.fullstack.cash'

class P2WDBRead extends Command {
  constructor(argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.BchWallet = BchWallet
    this.walletBalances = new WalletBalances()
  }

  async run() {
    try {
      const {flags} = this.parse(P2WDBRead)

      // Validate input flags
      this.validateFlags(flags)

      await this.readP2WDB(flags)
    } catch (err) {
      console.log('Error in p2wdb-read.js/run(): ', err)

      return 0
    }
  }

  // Read an entry from the P2WDB.
  async readP2WDB(flags) {
    try {
      const result = await axios.get(`${P2WDB_SERVER}/entry/hash/${flags.hash}`)
      console.log(`data: ${JSON.stringify(result.data, null, 2)}`)
    } catch (err) {
      console.error('Error in readP2WDB()')
      throw err
    }
  }

  // Validate the proper flags are passed in.
  validateFlags(flags) {
    // Exit if wallet not specified.
    const hash = flags.hash
    if (!hash || hash === '') {
      throw new Error('You must specify a record hash with the -h flag.')
    }

    return true
  }
}

P2WDBRead.description = 'Burn a specific quantity of SLP tokens.'

P2WDBRead.flags = {
  hash: flags.string({char: 'h', description: 'Hash representing P2WDB entry'}),
}

module.exports = P2WDBRead
