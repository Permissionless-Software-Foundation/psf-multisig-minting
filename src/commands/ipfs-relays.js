/*
  Query the state of the IPFS Circuit Relays this IPFS node is connected to.
*/

// const SERVER = 'http://localhost:5001/ipfs'

// Public NPM libraries
const axios = require('axios')

// Local libraries
const WalletUtil = require('../lib/wallet-util')

const { Command } = require('@oclif/command')

class IpfsRelays extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.axios = axios
    this.walletUtil = new WalletUtil()
  }

  async run () {
    try {
      const server = this.walletUtil.getRestServer()

      const result = await this.axios.post(`${server.restURL}/ipfs/relays`, {})
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
