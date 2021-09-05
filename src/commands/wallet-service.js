/*
  List and/or select a wallet service provider.
*/

// Public NPM libraries
const axios = require('axios')
const Conf = require('conf')

const {Command, flags} = require('@oclif/command')

class WalletService extends Command {
  constructor(argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.axios = axios
    this.conf = new Conf()
  }

  async run() {
    try {
      const {flags} = this.parse(WalletService)

      // Get a list of the IPFS peers this node is connected to.
      const result = await this.axios.post('http://localhost:5000/local/', {
        peers: true,
        all: flags.all,
      })
      const peers = result.data
      // console.log(`Subnet Peers: ${JSON.stringify(result.data, null, 2)}`)
      // console.log(`Number of peers: ${result.data.length}`)

      // Filter the wallet services from the peers.
      const servicePeers = peers.filter(x => x.protocol.includes('bch-wallet'))

      // Get the IPFS ID for the currently selected wallet service.
      const serviceId = this.conf.get('selectedService')
      console.log('serviceId: ', serviceId)

      // Add the isSelected flag.
      servicePeers.map(x => {
        x.isSelected = x.peer.includes(serviceId)
      })

      console.log(
        `Wallet service peers: ${JSON.stringify(servicePeers, null, 2)}`,
      )

      return true
    } catch (err) {
      console.log('Error in run(): ', err)

      return false
    }
  }
}

WalletService.description = 'List and/or select a wallet service provider.'

WalletService.flags = {
  all: flags.boolean({char: 'a', description: 'Display all data about peers'}),
}

module.exports = WalletService
