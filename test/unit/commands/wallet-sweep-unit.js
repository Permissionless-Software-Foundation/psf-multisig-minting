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

    it('should default to 245 derivation if not specified', () => {
      const flags = {
        name: 'test',
        mnemonic: 'one two three four five six seven eight nine ten eleven twelve'
      }

      const result = uut.validateFlags(flags)

      assert.equal(result, true)
      assert.equal(flags.derivation, 245)
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

      assert.equal(result, 'fake-txid')
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

  describe('#deriveKey', () => {
    it('should return a WIF', async () => {
      const mnemonic = 'fly impulse raise urban sun patch course diary witness plastic giant tired'
      const rootSeed = await uut.bchWallet.bchjs.Mnemonic.toSeed(mnemonic)
      const masterHDNode = uut.bchWallet.bchjs.HDNode.fromSeed(rootSeed)
      const derivationPath = 'm/44\'/145\'/0\'/0/0'

      const { addr, wif } = await uut.deriveKey(masterHDNode, derivationPath)

      assert.equal(addr, 'bitcoincash:qrqp2s098ene2mgf99v5audkdwlupvthsu3rn8wpzu')
      assert.equal(wif, 'L3Qx1gg4f7mq2Tbgw1okzkobJxe1DgpvRxdUyMdUmPAvPFXRke6p')
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.deriveKey()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)

        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#scanMnemonic', () => {
    it('should return an array of keys with balances', async () => {
      // Mock dependencies
      sandbox.stub(uut.bchWallet, 'getBalance')
        .onCall(0).resolves(1600)
        .resolves(0)
      uut.GAP = 3

      const flags = {
        mnemonic: 'fly impulse raise urban sun patch course diary witness plastic giant tired',
        derivation: 145
      }

      const result = await uut.scanMnemonic(flags)
      // console.log('result: ', result)

      assert.isArray(result)
      assert.equal(result.length, 1)
      assert.equal(result[0].addr, 'bitcoincash:qrqp2s098ene2mgf99v5audkdwlupvthsu3rn8wpzu')
      assert.equal(result[0].wif, 'L3Qx1gg4f7mq2Tbgw1okzkobJxe1DgpvRxdUyMdUmPAvPFXRke6p')
      assert.equal(result[0].index, 0)
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.scanMnemonic()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)

        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#sweepMnemonic', () => {
    it('should sweep a mnemonic', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'scanMnemonic').resolves([
        {
          addr: 'bitcoincash:qrqp2s098ene2mgf99v5audkdwlupvthsu3rn8wpzu',
          wif: 'L3Qx1gg4f7mq2Tbgw1okzkobJxe1DgpvRxdUyMdUmPAvPFXRke6p',
          index: 0
        }
      ])
      sandbox.stub(uut, 'sweepWif').resolves('fake-txid')
      sandbox.stub(uut.bchWallet.bchjs.Util, 'sleep').resolves()

      const flags = {
        mnemonic: 'fly impulse raise urban sun patch course diary witness plastic giant tired',
        derivation: 145
      }

      const result = await uut.sweepMnemonic(flags)

      assert.equal(result, true)
    })

    it('should catch and throw errors', async () => {
      try {
        // Force an error
        sandbox.stub(uut, 'scanMnemonic').rejects(new Error('test error'))

        await uut.sweepMnemonic()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)

        assert.include(err.message, 'test error')
      }
    })

    it('should continue despite sweep errors', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'scanMnemonic').resolves([
        {
          addr: 'bitcoincash:qrqp2s098ene2mgf99v5audkdwlupvthsu3rn8wpzu',
          wif: 'L3Qx1gg4f7mq2Tbgw1okzkobJxe1DgpvRxdUyMdUmPAvPFXRke6p',
          index: 0
        }
      ])
      sandbox.stub(uut, 'sweepWif').rejects(new Error('test error'))
      sandbox.stub(uut.bchWallet.bchjs.Util, 'sleep').resolves()

      const flags = {
        mnemonic: 'fly impulse raise urban sun patch course diary witness plastic giant tired',
        derivation: 145
      }

      const result = await uut.sweepMnemonic(flags)

      assert.equal(result, true)
    })
  })

  describe('#run', () => {
    it('should scan a mnemonic', async () => {
      const flags = {
        mnemonic: 'assist field wrist ridge violin visa mango minor vibrant this scorpion asthma'
      }

      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })
      sandbox.stub(uut, 'validateFlags').returns()
      sandbox.stub(uut, 'getReceiverWif').resolves()
      sandbox.stub(uut, 'sweepMnemonic').resolves()

      const result = await uut.run()

      assert.equal(result, true)
    })

    it('should scan a single WIF', async () => {
      const flags = {
        wif: 'fake-wif'
      }

      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })
      sandbox.stub(uut, 'validateFlags').returns()
      sandbox.stub(uut, 'getReceiverWif').resolves()
      sandbox.stub(uut, 'sweepWif').resolves()

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
})
