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

    it('should catch and throw and error', async () => {
      try {
        await uut.deriveAddress()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
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

    it('should catch and throw and error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.bchWallet, 'getTransactions').rejects(new Error('test error'))

        await uut.addrTxHistory()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#scanDerivationPath', () => {
    it('should return array with address summary', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'addrTxHistory').onCall(0).resolves({
        hasHistory: true,
        balance: 35033
      }).resolves({
        hasHistory: false,
        balance: 0
      })

      uut.GAP = 3

      const mnemonic = 'assist field wrist ridge violin visa mango minor vibrant this scorpion asthma'

      // Initialize the HD wallet 'node'
      const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)
      const masterHDNode = bchjs.HDNode.fromSeed(rootSeed)

      const derivePath = "m/44'/245'/0'/0"

      const result = await uut.scanDerivationPath(masterHDNode, derivePath)
      // console.log('result: ', result)

      assert.isArray(result)
      assert.equal(result.length, 1)
      assert.property(result[0], 'address')
      assert.property(result[0], 'balance')
    })

    it('should return an empty array if derivation has no history', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'addrTxHistory').resolves({
        hasHistory: false,
        balance: 0
      })

      uut.GAP = 3

      const mnemonic = 'assist field wrist ridge violin visa mango minor vibrant this scorpion asthma'

      // Initialize the HD wallet 'node'
      const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)
      const masterHDNode = bchjs.HDNode.fromSeed(rootSeed)

      const derivePath = "m/44'/245'/0'/0"

      const result = await uut.scanDerivationPath(masterHDNode, derivePath)
      // console.log('result: ', result)

      assert.isArray(result)
      assert.equal(result.length, 0)
    })

    it('should catch and throw and error', async () => {
      try {
        await uut.scanDerivationPath()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#scanDerivationPaths', () => {
    it('should scan a mnemonic', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'scanDerivationPath')
        .onCall(0).resolves([{
          address: 'bitcoincash:qz7x363nxkt658qatlr62qxgumslj75j6vwn2vnw5j',
          balance: 35033
        }])
        .resolves([])

      const flags = {
        mnemonic: 'assist field wrist ridge violin visa mango minor vibrant this scorpion asthma'
      }

      const result = await uut.scanDerivationPaths(flags)
      console.log('result: ', result)
    })

    it('should catch and throw and error', async () => {
      try {
        await uut.scanDerivationPaths()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#run', () => {
    it('should execut the run() function', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'scanDerivationPaths').resolves()

      const flags = {
        mnemonic: 'assist field wrist ridge violin visa mango minor vibrant this scorpion asthma'
      }
      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.equal(result, true)
    })

    it('should catch and throw and error', async () => {
      try {
        await uut.run()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#validateFlags()', () => {
    it('validateFlags() should throw error if mnemonic is not supplied.', () => {
      try {
        uut.validateFlags({})
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a mnemonic phrase with the -m flag.',
          'Expected error message.'
        )
      }
    })

    it('validateFlags() should throw error if mnemonic is not 12 words long', () => {
      try {
        uut.validateFlags({
          mnemonic: 'assist field wrist ridge violin visa mango minor vibrant this scorpion'
        })
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a mnemonic phrase of 12 words.',
          'Expected error message.'
        )
      }
    })
  })
})
