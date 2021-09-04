/*
  Query the state of the IPFS subnet Peers this IPFS node is connected to.
*/

// Public NPM libraries
const axios = require('axios')

const {Command, flags} = require('@oclif/command')

class IpfsPeers extends Command {
  constructor(argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.axios = axios
  }

  async run() {
    try {
      const {flags} = this.parse(IpfsPeers)

      const result = await this.axios.post('http://localhost:5000/local/', {
        peers: true,
      })
      console.log(`Subnet Peers: ${JSON.stringify(result.data, null, 2)}`)
      console.log(`Number of peers: ${result.data.length}`)

      return true
    } catch (err) {
      console.log('Error in run(): ', err)

      return false
    }
  }
}

IpfsPeers.description = 'Query the state of subnet peers'

IpfsPeers.flags = {
  all: flags.string({char: 'a', description: 'Display all peers'}),
}

module.exports = IpfsPeers
