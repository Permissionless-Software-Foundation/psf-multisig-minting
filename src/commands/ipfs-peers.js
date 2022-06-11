/*
  Query the state of the IPFS subnet Peers this IPFS node is connected to.
*/

// Public NPM libraries
const axios = require('axios')

// Local libraries
const WalletUtil = require('../lib/wallet-util')

const { Command, flags } = require('@oclif/command')

class IpfsPeers extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.axios = axios
    this.walletUtil = new WalletUtil()
  }

  async run () {
    try {
      const { flags } = this.parse(IpfsPeers)

      const server = this.walletUtil.getRestServer()

      const result = await this.axios.post(`${server.restURL}/ipfs/peers`, {
        showAll: flags.all
      })
      // console.log("result.data: ", result.data);

      console.log(
        `Subnet Peers: ${JSON.stringify(result.data.peers, null, 2)}`
      )
      console.log(`Number of peers: ${result.data.peers.length}`)

      return true
    } catch (err) {
      console.log('Error in run(): ', err)

      return false
    }
  }
}

IpfsPeers.description = 'Query the state of subnet peers'

IpfsPeers.flags = {
  all: flags.boolean({
    char: 'a',
    description: 'Display all data about peers'
  })
}

module.exports = IpfsPeers
