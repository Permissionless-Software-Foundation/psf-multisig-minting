/*
  Run an end-to-end test on the selected wallet service. It ensures the wallet
  can communicate with the back end service, and that the back end service is
  fully functional.
*/

'use strict'

// Public NPM libraries
const BchWallet = require('minimal-slp-wallet/index')
const Conf = require('conf')

// Local libraries
const WalletUtil = require('../lib/wallet-util')
const WalletConsumer = require('../lib/adapters/wallet-consumer')

const { Command } = require('@oclif/command')

// const fs = require('fs')

class WalletServiceTest extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    // this.fs = fs
    this.walletUtil = new WalletUtil()
    this.walletService = new WalletConsumer()
    this.BchWallet = BchWallet
    this.conf = new Conf()
  }

  async run () {
    try {
      await this.runTests()

      return true
    } catch (err) {
      console.log('Error in run(): ', err)

      return false
    }
  }

  // Top-level function that controlls and calls all the other functions.
  // Run all end-to-end tests.
  async runTests () {
    try {
      console.log('Starting test...')

      // Initialize the BCH wallet. It will be available at this.bchWallet
      await this.initWallet()

      // Test the ability to get a balance for an address from the Fulcrum indexer.
      await this.getBalance()

      // Test the ability to broadcast a transaction.
      await this.testBroadcast()

      // Test the ability to retrieve a pubkey from the blockchain.
      await this.getPubKey()

      console.log('...test complete.')
    } catch (err) {
      console.log('Error in runTests()')
      throw err
    }
  }

  // Initialize the wallet library.
  async initWallet () {
    try {
      const restServer = this.conf.get('restServer')
      console.log(`restServer: ${restServer}`)

      // Instantiate the minimal-slp-wallet library.
      const advancedConfig = {
        interface: 'consumer-api',
        bchWalletApi: restServer
      }
      this.bchWallet = new this.BchWallet(undefined, advancedConfig)

      // Wait for the wallet to initialize and retrieve UTXO data from the
      // blockchain.
      await this.bchWallet.walletInfoPromise

      // If UTXOs fail to update, try one more time.
      if (!this.bchWallet.utxos.utxoStore) {
        await this.bchWallet.getUtxos()

        // Throw an error if UTXOs are still not updated.
        if (!this.bchWallet.utxos.utxoStore) {
          throw new Error(
            'Wallet failed to initialize. Could not communicate with wallet service.'
          )
        }
      }

      console.log('Wallet successfully initialized.')

      return this.bchWallet
    } catch (err) {
      console.log('Error in initWallet()')
      throw err
    }
  }

  // Get the balance for a BCH address.
  async getBalance () {
    try {
      // console.log('this.bchWallet.ar: ', this.bchWallet.ar)

      const addrs = ['bitcoincash:qqh793x9au6ehvh7r2zflzguanlme760wuzehgzjh9']
      const result = await this.walletService.getBalances(addrs)
      // console.log('result.balances[0].balance: ', result.balances[0].balance)

      if (result.balances[0].balance.confirmed > 546) {
        console.log('Fulcrum indexer successfully queried BCH balance.')
      } else {
        console.log(
          `Unexpected result when running getBalance: ${JSON.stringify(
            result,
            null,
            2
          )}`
        )
      }
    } catch (err) {
      console.log('Error in getBalance()')
      throw err
    }
  }

  async testBroadcast () {
    try {
      const txHex =
        '020000000265d13ef402840c8a51f39779afb7ae4d49e4b0a3c24a3d0e7742038f2c679667010000006441dd1dd72770cadede1a7fd0363574846c48468a398ddfa41a9677c74cac8d2652b682743725a3b08c6c2021a629011e11a264d9036e9d5311e35b5f4937ca7b4e4121020797d8fd4d2fa6fd7cdeabe2526bfea2b90525d6e8ad506ec4ee3c53885aa309ffffffff65d13ef402840c8a51f39779afb7ae4d49e4b0a3c24a3d0e7742038f2c679667000000006441347d7f218c11c04487c1ad8baac28928fb10e5054cd4494b94d078cfa04ccf68e064fb188127ff656c0b98e9ce87f036d183925d0d0860605877d61e90375f774121028a53f95eb631b460854fc836b2e5d31cad16364b4dc3d970babfbdcc3f2e4954ffffffff035ac355000000000017a914189ce02e332548f4804bac65cba68202c9dbf822878dfd0800000000001976a914285bb350881b21ac89724c6fb6dc914d096cd53b88acf9ef3100000000001976a91445f1f1c4a9b9419a5088a3e9c24a293d7a150e6488ac00000000'

      const result = await this.walletService.sendTx(txHex)
      // console.log('result: ', result)

      if (result.message.includes('Missing inputs')) {
        console.log('TX broadcast responded with expected message')
      } else {
        console.log('TX broadcast reponsed with unexpected message: ', result)
      }
    } catch (err) {
      console.log('Error in testBroadcast()')
      throw err
    }
  }

  async getPubKey () {
    try {
      const addr = 'bitcoincash:qr2u4f2dmva6yvf3npkd5lquryp09qk7gs5vxl423h'

      const result = await this.walletService.getPubKey(addr)
      // console.log('result: ', result)

      if (
        result.pubkey.publicKey ===
        '0359edb7e4d89aee3f8974b483792b06b17e662d5b1e375c30803ce39d6bd7a037'
      ) {
        console.log('Public key successfully retrieved from blockchain.')
      } else {
        console.log('Pubkey retrieval resulted in unexpected output: ', result)
      }
    } catch (err) {
      console.log('Error in getPubKey()')
      throw err
    }
  }
}

WalletServiceTest.description = `Run end-to-end tests on the selected wallet service.

This command will run a series of end-to-end (e2e) tests on a current global
back end selected with the 'wallet-service' command. It will test that the
selected service if fully function, and this app can adaquately communicate
with that service.
`

module.exports = WalletServiceTest
