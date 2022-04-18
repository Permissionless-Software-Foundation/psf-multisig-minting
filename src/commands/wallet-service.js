/*
  List and/or select a wallet service provider.
*/

// const SERVER = 'http://localhost:5001/bch'

// Public NPM libraries
const axios = require('axios')
const Conf = require('conf')

// Local libraries
const WalletUtil = require('../lib/wallet-util')

const { Command, flags } = require('@oclif/command')

class WalletService extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.axios = axios
    this.conf = new Conf()
    this.walletUtil = new WalletUtil()
  }

  async run () {
    try {
      const { flags } = this.parse(WalletService)

      const server = this.walletUtil.getRestServer()

      // Get a list of the IPFS peers this node is connected to.
      const result = await this.axios.get(`${server}/bch`)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`);

      const providers = result.data.status.serviceProviders
      const selectedProvider = result.data.status.selectedProvider

      console.log(
        `Available service providers: ${JSON.stringify(providers, null, 2)}`
      )
      console.log(`Selected service provider: ${selectedProvider}`)

      if (flags.select) await this.selectService(flags)

      return true
    } catch (err) {
      console.log('Error in run(): ', err)

      return false
    }
  }

  // Select a different peer to use as a wallet service.
  async selectService (flags) {
    try {
      const chosenPeer = flags.select

      const server = this.walletUtil.getRestServer()

      const body = {
        provider: chosenPeer
      }
      await this.axios.post(`${server}/bch/provider`, body)

      console.log(`Service provider switched to ${chosenPeer}`)

      return true

      // Loop through the available wallet service peers.
      // for (let i = 0; i < servicePeers.length; i++) {
      //   const thisPeer = servicePeers[i];
      //
      //   // If the chosen ID is found in the list, select it.
      //   if (thisPeer.peer.includes(chosenPeer)) {
      //     this.conf.set("selectedService", chosenPeer);
      //
      //     break;
      //   }
      // }
    } catch (err) {
      console.log('Error in selectService()')
      throw err
    }
  }
}

WalletService.description = 'List and/or select a wallet service provider.'

WalletService.flags = {
  select: flags.string({
    char: 's',
    description: 'Switch to a given IPFS ID for wallet service.'
  })
}

module.exports = WalletService
