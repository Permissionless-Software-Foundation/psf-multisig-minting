/*
  Unit tests for the wallet-scan command.
*/

'use strict'

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const BchWallet = require('minimal-slp-wallet/index')

// Local libraries
const WalletScan = require('../../../src/commands/wallet-scan')

// const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('#wallet-scan', () => {
  let uut
  let sandbox
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
    sandbox = sinon.createSandbox()

    uut = new WalletScan()
    uut.bchWallet = bchWallet
    uut.bchjs = bchjs
  })

  afterEach(() => {
    sandbox.restore()
  })

  // after(async () => {
  //   await fs.rm(filename)
  // })

  describe('#deriveAddress', () => {
    it('should accurately derive addresses on a 145 derivation path.', async () => {
      const mnemonic = 'assist field wrist ridge violin visa mango minor vibrant this scorpion asthma'

      // Initialize the HD wallet 'node'
      const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)
      const masterHDNode = bchjs.HDNode.fromSeed(rootSeed)

      const derivationPath = "m/44'/145'/0'/0/3"

      const result = uut.deriveAddress(masterHDNode, derivationPath)

      assert.equal(result, 'bitcoincash:qp9n96echpztmrqdmxsx4ksp3rqmxu73qqv2y74u9e')
    })

    it('should accurately derive addresses on the 245 derivation path.', async () => {
      const mnemonic = 'assist field wrist ridge violin visa mango minor vibrant this scorpion asthma'

      // Initialize the HD wallet 'node'
      const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)
      const masterHDNode = bchjs.HDNode.fromSeed(rootSeed)

      const derivationPath = "m/44'/245'/0'/0/3"

      const result = uut.deriveAddress(masterHDNode, derivationPath)

      assert.equal(result, 'bitcoincash:qrjne8fhaxk8llvaf9ee2schf5llp8w9gg6rvqla9z')
    })
  })

  describe('#addrTxHistory', () => {
    it('should return true for address with tx history', async () => {
      // Mock dependencies
      sandbox.stub(uut.bchWallet, 'getTransactions').resolves([
        {
          height: 646894,
          tx_hash: '4c695fae636f3e8e2edc571d11756b880ccaae744390f3950d798ce7b5e25754'
        }]
      )
      sandbox.stub(uut.bchWallet, 'getBalance').resolves(1600)

      const addr = 'bitcoincash:qr69kyzha07dcecrsvjwsj4s6slnlq4r8c30lxnur3'

      const result = await uut.addrTxHistory(addr)
      // console.log('result: ', result)

      assert.equal(result.hasHistory, true)
      assert.isAbove(result.balance, 1000)
    })

    it('should return false for address with no tx history or balance', async () => {
      // Mock dependencies
      sandbox.stub(uut.bchWallet, 'getTransactions').resolves([])

      const addr = 'bitcoincash:qp5024nypt06fsw9x6cylh96xnzd0tvkyvuxvrt7dc'

      const result = await uut.addrTxHistory(addr)
      // console.log('result: ', result)

      assert.equal(result.hasHistory, false)
      assert.equal(result.balance, 0)
    })
  })
})
