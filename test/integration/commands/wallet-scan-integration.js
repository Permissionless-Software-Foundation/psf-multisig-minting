/*
  Integration tests for the wallet-scan.js command library.
*/

// Public npm libraries
const assert = require('chai').assert
// const sinon = require('sinon')
const BchWallet = require('minimal-slp-wallet/index')

// Local libraries
const WalletScan = require('../../../src/commands/wallet-scan')

describe('#wallet-scan', () => {
  let uut
  // let sandbox
  let bchjs, bchWallet

  before(async () => {
    // Initialize minimal-slp-wallet
    const advancedConfig = {
      interface: 'consumer-api',
      noUpdate: true
    }
    bchWallet = new BchWallet(undefined, advancedConfig)
    await bchWallet.walletInfoPromise
    bchjs = bchWallet.bchjs
    // console.log('bchjs: ', bchjs)
  })

  beforeEach(async () => {
    // sandbox = sinon.createSandbox()

    uut = new WalletScan()
    uut.bchWallet = bchWallet
    uut.bchjs = bchjs
  })

  describe('#addrTxHistory', () => {
    it('should return true for address with tx history', async () => {
      const addr = 'bitcoincash:qr69kyzha07dcecrsvjwsj4s6slnlq4r8c30lxnur3'

      const result = await uut.addrTxHistory(addr)
      // console.log('result: ', result)

      assert.equal(result.hasHistory, true)
      assert.isAbove(result.balance, 1000)
    })

    it('should return false for address with no tx history or balance', async () => {
      const addr = 'bitcoincash:qp5024nypt06fsw9x6cylh96xnzd0tvkyvuxvrt7dc'

      const result = await uut.addrTxHistory(addr)
      // console.log('result: ', result)

      assert.equal(result.hasHistory, false)
      assert.equal(result.balance, 0)
    })
  })
})
