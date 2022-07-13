/*
  This command is used to retrieve information about a token.
  It returns the Genesis data, mutable data, and immutable data associated
  with a token.
*/

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')
const { Command, flags } = require('@oclif/command')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const axios = require('axios')
// const WalletBalances = require('./wallet-balances')

class TokenInfo extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.walletUtil = new WalletUtil()
    this.BchWallet = BchWallet
    this.axios = axios
    // this.walletBalances = new WalletBalances()
  }

  async run () {
    try {
      const { flags } = this.parse(TokenInfo)
      // console.log('flags: ', flags)

      // Validate input flags
      this.validateFlags(flags)

      const tokenData = await this.getTokenData(flags)
      // console.log('tokenData: ', tokenData)

      const dataSummary = this.summarizeData(tokenData)
      // console.log('dataSummary: ', dataSummary)

      const mutableData = await this.getIpfsData(tokenData.mutableData)
      // console.log('Mutable Data: ', mutableData)

      const immutableData = await this.getIpfsData(tokenData.immutableData)
      // console.log('Immutable Data: ', immutableData)

      const allData = {
        tokenData, dataSummary, mutableData, immutableData
      }

      this.displayData(allData)

      return true
    } catch (err) {
      console.log('Error in token-info.js/run(): ', err.message)

      return 0
    }
  }

  // Get the genesis data and IPFS URLs for mutable and immutable data, if available.
  async getTokenData (flags) {
    const tokenId = flags.tokenId

    const server = this.walletUtil.getRestServer()
    const wallet = new this.BchWallet(undefined, { restURL: server.restURL, interface: server.interface, noUpdate: true })

    const tokenData = await wallet.ar.getTokenData(tokenId)

    return tokenData
  }

  // Summarize the raw genesis data into human readable stats.
  summarizeData (tokenData) {
    const decimals = tokenData.genesisData.decimals
    const tokensInCirculation = parseInt(tokenData.genesisData.tokensInCirculationStr) / Math.pow(10, decimals)
    const totalBurned = parseInt(tokenData.genesisData.totalBurned) / Math.pow(10, decimals)
    const totalMinted = parseInt(tokenData.genesisData.totalMinted) / Math.pow(10, decimals)

    return {
      tokensInCirculation,
      totalBurned,
      totalMinted
    }
  }

  // Retrieve IPFS data from a gateway
  async getIpfsData (ipfsUri) {
    if (!ipfsUri.includes('ipfs://')) { return 'not available' }

    const ipfsCid = ipfsUri.slice(7)
    // console.log('ipfsCid: ', ipfsCid)

    const url = `https://${ipfsCid}.ipfs.dweb.link/data.json`
    // console.log('url: ', url)

    const result = await this.axios.get(url)
    const ipfsData = result.data
    // console.log('ipfsData: ', ipfsData)

    return ipfsData
  }

  displayData (allData) {
    console.log(`Raw token data: ${JSON.stringify(allData.tokenData, null, 2)}`)
    console.log(`Token summary statistics: ${JSON.stringify(allData.dataSummary, null, 2)}`)
    console.log(`Immutable data: ${JSON.stringify(allData.immutableData, null, 2)}`)
    console.log(`Mutable data: ${JSON.stringify(allData.mutableData, null, 2)}`)

    return true
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    const tokenId = flags.tokenId
    if (!tokenId || tokenId === '') {
      throw new Error('You must specify a token ID with the -t flag')
    }

    return true
  }
}

TokenInfo.description = `Get information on a token

Retrieves the Genesis data for a token. If PS002 mutable and immutable data is
attached to the token, it is retrieved from IPFS.
`

TokenInfo.flags = {
  tokenId: flags.string({ char: 't', description: 'The ID of the token to lookup' })
}

module.exports = TokenInfo
