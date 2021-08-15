/*
  Query the state of the IPFS Circuit Relays this IPFS node is connected to.
*/

// Public NPM libraries
// const BCHJS = require('@psf/bch-js')
// const BchWallet = require('minimal-slp-wallet/index')
// const collect = require('collect.js')
const axios = require('axios')

// Local libraries
// const WalletUtil = require('../lib/wallet-util')
// const WalletService = require('../lib/adapters/wallet-service')

const {Command} = require('@oclif/command')

// const fs = require('fs')

class IpfsRelays extends Command {
  constructor(argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    // this.fs = fs
    // this.walletUtil = new WalletUtil()
    // this.walletService = new WalletService()
    // this.BchWallet = BchWallet
    this.axios = axios
  }

  async run() {
    try {
      const result = await this.axios.post('http://localhost:5000/local/', {
        relays: true,
      })
      console.log(`Circuit Relays: ${JSON.stringify(result.data, null, 2)}`)

      return true
    } catch (err) {
      console.log('Error in run(): ', err)

      return false
    }
  }
}

IpfsRelays.description = 'Query the state of circuit relays'

IpfsRelays.flags = {}

module.exports = IpfsRelays
