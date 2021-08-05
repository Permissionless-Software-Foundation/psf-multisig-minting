/*
  This library interacts with the ipfs-bch-wallet-service via the JSON RPC
  over IPFS.
*/

// Configuration variables.
const LOCAL_REST_API = 'http://localhost:5000/'

// Public npm libraries.
const axios = require('axios')
const Conf = require('conf')

class WalletService {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.axios = axios
    this.conf = new Conf()
  }

  checkServiceId () {
    const serviceId = this.conf.get('selectedService')

    if (!serviceId) { throw new Error('Wallet service ID does not exist in config.') }

    return serviceId
  }

  // Get up to 20 addresses.
  async getBalances (addrs) {
    try {
      // Input validation.
      if (!Array.isArray(addrs)) {
        throw new TypeError(
          'addrs input to getBalance() must be an array, of up to 20 addresses.'
        )
      }

      const serviceId = this.checkServiceId()
      // console.log(`serviceId: ${serviceId}`)

      const result = await this.axios.post(LOCAL_REST_API, {
        sendTo: serviceId,
        rpcData: {
          endpoint: 'balance',
          addresses: addrs
        }
      })
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      return result.data
    } catch (err) {
      console.error('Error in getBalance()')
      throw err
    }
  }

  // Get hydrated UTXOs for an address
  async getUtxos (addr) {
    try {
      // Input validation
      if (typeof addr !== 'string') { throw new Error('getUtxos() input address must be a string.') }

      const serviceId = this.checkServiceId()
      // console.log(`serviceId: ${serviceId}`)

      const result = await this.axios.post(LOCAL_REST_API, {
        sendTo: serviceId,
        rpcData: {
          endpoint: 'utxos',
          address: addr
        }
      })
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`)

      return result.data
    } catch (err) {
      console.error('Error in getUtxos()')
      throw err
    }
  }
}

module.exports = WalletService
