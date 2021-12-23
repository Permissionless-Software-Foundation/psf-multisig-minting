/*
  Read data from the P2WDB.

  TODO: This command should be refactored to use REST API endpoints of
  ipfs-bch-wallet-consumer. ipfs-bch-wallet-consumer needs additional REST API
  endpoints for interfacing with the p2wdb library.
*/

'use strict'

// Public NPM libraries
// const BchWallet = require('minimal-slp-wallet/index')
const axios = require('axios')
const Conf = require('conf')

// Local libraries
// const WalletUtil = require('../lib/wallet-util')
// const WalletBalances = require('./wallet-balances')

const { Command, flags } = require('@oclif/command')

class P2WDBRead extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    // this.walletUtil = new WalletUtil()
    // this.BchWallet = BchWallet
    // this.walletBalances = new WalletBalances()
    // this.p2wdbService = new P2wdbService()
    this.conf = new Conf()
  }

  async run () {
    try {
      const { flags } = this.parse(P2WDBRead)

      // Validate input flags
      this.validateFlags(flags)

      await this.readP2WDB(flags)
    } catch (err) {
      console.log('Error in p2wdb-read.js/run(): ', err)

      return 0
    }
  }

  async readP2WDB (flags) {
    try {
      const p2wdbServer = this.conf.get('p2wdbServer')
      console.log(`p2wdbServer: ${p2wdbServer}`)

      // Display the raw entry.
      const result = await axios.post(`${p2wdbServer}/p2wdb/entryFromHash`, {
        hash: flags.hash
      })
      console.log(`${JSON.stringify(result.data.data, null, 2)}`)

      // Attempt to parse the data payload.
      try {
        const data = JSON.parse(result.data.data.data.value.data)
        console.log(`\nvalue.data: ${JSON.stringify(data, null, 2)}\n`)
      } catch (err) {
        /* exit quietly. */
        // console.log(err)
      }
    } catch (err) {
      console.error('Error in readP2WDB()')
      throw err
    }
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const hash = flags.hash
    if (!hash || hash === '') {
      throw new Error('You must specify a record hash with the -h flag.')
    }

    return true
  }
}

P2WDBRead.description = 'Read an entry from the P2WDB'

P2WDBRead.flags = {
  hash: flags.string({
    char: 'h',
    description: 'Hash representing P2WDB entry'
  })
}

module.exports = P2WDBRead
