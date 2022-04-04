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

// const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('#wallet-sweep', () => {
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

    uut = new WalletSweep()
    uut.bchWallet = bchWallet
    uut.bchjs = bchjs
  })

  afterEach(() => {
    sandbox.restore()
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
})
