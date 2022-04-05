/*
  Unit tests for the wallet-scan command.
*/

'use strict'

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const BchWallet = require('minimal-slp-wallet/index')

// Local libraries
const WalletSweep = require('../../../src/commands/wallet-sweep')
const BchWalletMock = require('../../mocks/msw-mock')
const WalletCreate = require('../../../src/commands/wallet-create')
const WalletRemove = require('../../../src/commands/wallet-remove')
const SweepMock = require('../../mocks/sweep-mock')

// Constants
const filename = `${__dirname.toString()}/../../../.wallets/test123.json`
const walletCreate = new WalletCreate()
const walletRemove = new WalletRemove()

describe('#wallet-sweep', () => {
  let uut
  let sandbox
  let bchjs, bchWallet

  before(async () => {
    // Create a test wallet
    await walletCreate.createWallet(filename)

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

    uut = new WalletSweep()
    uut.bchWallet = bchWallet
    uut.bchjs = bchjs
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
    await walletRemove.removeWallet(filename)
  })

  describe('#validateFlags()', () => {
    it('should throw error if name is not supplied.', () => {
      try {
        uut.validateFlags({})
      } catch (err) {
        assert.include(
          err.message,
          'Name of receiving wallet must be included.',
          'Expected error message.'
        )
      }
    })

    it('should throw error if neither a WIF nor a mnemonic is specified', () => {
      try {
        uut.validateFlags({
          name: 'test'
        })
      } catch (err) {
        assert.include(
          err.message,
          'Either a WIF private key, or a 12-word mnemonic must be supplied.',
          'Expected error message.'
        )
      }
    })

    it('should throw error if mnemonic is not 12 words', () => {
      try {
        uut.validateFlags({
          name: 'test',
          mnemonic: 'one two three four'
        })
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a mnemonic phrase of 12 words.',
          'Expected error message.'
        )
      }
    })

    it('should throw error if invalid WIF is used', () => {
      try {
        uut.validateFlags({
          name: 'test',
          wif: 'bad-wif'
        })
      } catch (err) {
        assert.include(
          err.message,
          'WIF private key must start with the letter L or K.',
          'Expected error message.'
        )
      }
    })

    it('should convert deriviation to an integer', () => {
      const flags = {
        name: 'test',
        mnemonic: 'one two three four five six seven eight nine ten eleven twelve',
        derivation: '145'
      }

      const result = uut.validateFlags(flags)

      assert.equal(result, true)
      assert.equal(flags.derivation, 145)
    })
  })

  describe('#getReceiverWif', () => {
    it('should get the WIF for the receiver wallet', async () => {
      // Mock dependencies
      uut.BchWallet = BchWalletMock

      const flags = {
        name: 'test123'
      }

      const result = await uut.getReceiverWif(flags)
      // console.log('result: ', result)

      assert.equal(result, 'L1fqtLVmksSdUZPcMgpUGMkBmMYGjJQe8dbqhkD8s16eBKCYTYpH')
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.getReceiverWif()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)

        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#sweepWif', () => {
    it('should sweep a WIF', async () => {
      // Mock dependencies
      uut.BchTokenSweep = SweepMock
      uut.bchWallet = new BchWalletMock()

      const result = await uut.sweepWif({}, 'in-wif')
      // console.log('result: ', result)

      assert.equal(result, 'fake-hex')
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.sweepWif()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)

        assert.include(err.message, 'Cannot read')
      }
    })
  })
})
