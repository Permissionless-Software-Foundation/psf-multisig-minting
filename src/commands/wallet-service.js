/*
  List and/or select a wallet service provider.
*/

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
      const result = await this.axios.get(`${server.restURL}/bch`)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      const providers = result.data.status.serviceProviders
      // const selectedProvider = result.data.status.selectedProvider
      const defaultProvider = result.data.status.selectedProvider

      if (!flags.select) {
        // Remove all objects that don't contain ipfsId of selected provider
        const currProv = providers.filter(
          (el) => el.ipfsId === defaultProvider
        )
        const providerName = currProv[0].name

        console.log(
            `Available service providers: ${JSON.stringify(providers, null, 2)}`
        )
        console.log(
            `\nSelected service provider:
             \nname: ${providerName} \nipfsId: ${defaultProvider}`
        )
      } else {
        await this.selectService(flags)
      }

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
      const request = await this.axios.post(`${server.restURL}/bch/provider`, body)
      const result = await this.axios.get(`${server.restURL}/bch`)

      const chosenProv = request.config.data.slice(13, -2)
      const providers = result.data.status.serviceProviders

      const currProv = await providers.filter(
        (el) => el.ipfsId === chosenProv
      )
      const providerName = currProv[0].name
      console.log(
          `\nService provider switched to:
          \nname: ${providerName} \nipfsId: ${currProv[0].ipfsId}`)

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
