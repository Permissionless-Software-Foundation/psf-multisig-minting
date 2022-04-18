/*
  List and/or select a P2WDB service provider.

  TODO: This command should work like the wallet-service command. It instructs
  ipfs-bch-wallet-service which P2WDB node to connect to.
*/

// Public NPM libraries
const axios = require('axios')
const Conf = require('conf')

// Local libraries
const WalletUtil = require('../lib/wallet-util')

const { Command, flags } = require('@oclif/command')

class P2wdbService extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.axios = axios
    this.conf = new Conf()
    this.walletUtil = new WalletUtil()
  }

  async run () {
    try {
      const { flags } = this.parse(P2wdbService)

      const server = this.walletUtil.getP2wdbServer()

      // Get a list of the IPFS peers this node is connected to.
      const result = await this.axios.get(`${server}/p2wdb`)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

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

      const server = this.walletUtil.getP2wdbServer()

      const body = {
        provider: chosenPeer
      }
      await this.axios.post(`${server}/p2wdb/provider`, body)

      console.log(`P2WDB service provider switched to ${chosenPeer}`)

      return true
    } catch (err) {
      console.log('Error in selectService()')
      throw err
    }
  }
}

P2wdbService.description = 'List and/or select a P2WDB service provider.'

P2wdbService.flags = {
  select: flags.string({
    char: 's',
    description: 'Switch to a given IPFS ID for P2WDB service.'
  })
}

module.exports = P2wdbService
