/*
  This library interacts with the ipfs-bch-wallet-consumer REST API:
  https://github.com/Permissionless-Software-Foundation/ipfs-bch-wallet-consumer

  This library is injected into minimal-slp-wallet when the library is initialized.
  It provides the interface needed by minimal-slp-wallet to interact with the
  ipfs-bch-wallet-consumer REST API.
*/

// Configuration variables.
// const LOCAL_REST_API = 'http://localhost:5001/bch'

// Public npm libraries.
const axios = require('axios')
const Conf = require('conf')

const WalletUtil = require('../wallet-util')

class WalletService {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.axios = axios
    this.conf = new Conf()
    this.walletUtil = new WalletUtil()
  }

  // checkServiceId () {
  //   // this.conf = new Conf()
  //
  //   const serviceId = this.conf.get('selectedService')
  //
  //   if (!serviceId) {
  //     throw new Error('Wallet service ID does not exist in config.')
  //   }
  //
  //   return serviceId
  // }

  // Get up to 20 addresses.
  async getBalances (addrs) {
    try {
      // Input validation.
      if (!addrs || !Array.isArray(addrs)) {
        throw new Error(
          'addrs input to getBalance() must be an array, of up to 20 addresses.'
        )
      }

      const server = this.walletUtil.getRestServer()

      const body = {
        addresses: addrs
      }
      const result = await this.axios.post(`${server}/bch/balance`, body)

      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`);
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
      if (!addr || typeof addr !== 'string') {
        throw new Error('getUtxos() input address must be a string.')
      }

      const server = this.walletUtil.getRestServer()

      const body = {
        address: addr
      }

      const result = await this.axios.post(`${server}/bch/utxos`, body)

      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`);
      return result.data
    } catch (err) {
      console.error('Error in getUtxos()')
      throw err
    }
  }

  // Broadcast a transaction to the network.
  async sendTx (hex) {
    try {
      // Input validation
      if (!hex || typeof hex !== 'string') {
        throw new Error('sendTx() input hex must be a string.')
      }

      const server = this.walletUtil.getRestServer()

      const body = {
        hex
      }

      const result = await this.axios.post(`${server}/bch/broadcast`, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`);

      return result.data
    } catch (err) {
      console.error('Error in sendTx()')
      throw err
    }
  }

  // Obtains the public key of a bch address
  async getPubKey (bchAddress) {
    try {
      // Input validation
      if (!bchAddress || typeof bchAddress !== 'string') {
        throw new Error('getPubKey() input bchAddress must be a string.')
      }

      const server = this.walletUtil.getRestServer()

      const body = {
        address: bchAddress
      }

      const result = await this.axios.post(`${server}/bch/pubkey`, body)
      // console.log(`result.data: ${JSON.stringify(result.data, null, 2)}`);

      return result.data
    } catch (err) {
      console.error('Error in getPubKey()')
      throw err
    }
  }
}

module.exports = WalletService
