/*
  Query the state of the IPFS node in ipfs-bch-wallet-consumer.
*/

// const SERVER = 'http://localhost:5001/ipfs'

// Public NPM libraries
const axios = require('axios')

// Local libraries
const WalletUtil = require('../lib/wallet-util')

const { Command } = require('@oclif/command')

class IpfsStatus extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.axios = axios
    this.walletUtil = new WalletUtil()
  }

  async run () {
    try {
      const server = this.walletUtil.getRestServer()

      const result = await this.axios.get(`${server.restURL}/ipfs`)
      console.log(`IPFS status: ${JSON.stringify(result.data, null, 2)}`)

      return true
    } catch (err) {
      console.log('Error in run(): ', err)

      return false
    }
  }
}

IpfsStatus.description = 'Query the state of the IPFS node'

IpfsStatus.flags = {}

module.exports = IpfsStatus
