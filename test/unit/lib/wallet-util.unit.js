/*
  Unit tests for the wallet-util.js library.
*/

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs')
const cloneDeep = require('lodash.clonedeep')

// Local libraries
const WalletCreate = require('../../../src/commands/wallet-create')
const walletCreate = new WalletCreate()
const WalletRemove = require('../../../src/commands/wallet-remove')
const walletRemove = new WalletRemove()

// File under test.
const WalletUtil = require('../../../src/lib/wallet-util')

// Mocking data
const utilMocksLib = require('../../mocks/wallet-util-mock')

describe('#Wallet-Util', () => {
  let sandbox
  let uut
  let utilMocks

  beforeEach(() => {
    uut = new WalletUtil()

    sandbox = sinon.createSandbox()

    utilMocks = cloneDeep(utilMocksLib)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#saveWallet', () => {
    it('should save a wallet without error', async () => {
      const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

      const result = await uut.saveWallet(filename, utilMocks.mockWallet)
      // console.log('result: ', result)

      assert.equal(result, true)

      // Test cleanup. Remove file.
      fs.rmSync(filename)
    })

    it('should throw error on file write problems', async () => {
      try {
        await uut.saveWallet(null, utilMocks.mockWallet)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'The "path" argument must be of type string'
        )
      }
    })
  })

  describe('#generateAddress', () => {
    it('should generate an address accurately.', async () => {
      const addr = await uut.generateAddress(utilMocks.mockWallet, 3, 1)
      // console.log('addr: ', addr)

      assert.isArray(addr)
      assert.equal(addr.length, 1)
      assert.equal(
        addr[0],
        'bitcoincash:qqd84rlkya6ktfc9cuxjgqsmnwxuam4wnsf6kdxmzn'
      )
    })

    it('should generate the first 20 addresses', async () => {
      const addr = await uut.generateAddress(utilMocks.mockWallet, 0, 20)
      // console.log(`addr: ${util.inspect(addr)}`)

      assert.isArray(addr)
      assert.equal(addr.length, 20)
      assert.equal(addr[0], utilMocks.mockWallet.rootAddress)
    })

    it('should throw error on empty mnemonic', async () => {
      try {
        // Remove the mnemonic.
        delete utilMocks.mockWallet.mnemonic

        await uut.generateAddress(utilMocks.mockWallet, 0, 20)
      } catch (err) {
        assert.include(err.message, 'mnemonic is undefined!')
      }
    })
  })

  describe('#getEncryptionMnemonic', () => {
    it('should return the e2ee mnemonic', () => {
      const result = uut.getEncryptionMnemonic()

      assert.isString(result)
    })

    it('should generate a mnemonic if one does not exist', () => {
      // Mock conf so that the original mnemonic is not overwritten.
      sandbox.stub(uut.conf, 'set').returns()

      // Force conf.get to return false.
      sandbox.stub(uut.conf, 'get').returns(false)

      const result = uut.getEncryptionMnemonic()

      assert.isString(result)
    })
  })

  describe('#instanceWallet', () => {
    const walletName = 'test123'

    it('should generate an instance of the wallet', async () => {
      // Mock minimal-slp-wallet
      uut.BchWallet = class BchWallet {
        async walletInfoPromise () {
          return true
        }
      }

      // Create a wallet
      const filepath = walletRemove.getFilePath(walletName)
      await walletCreate.createWallet(filepath)

      const wallet = await uut.instanceWallet(walletName)
      // console.log(wallet)

      assert.isOk(wallet)

      // Delete the wallet
      await walletRemove.removeWallet(filepath)
    })

    it('should catch, log, and throw errors', async () => {
      try {
        // Mock minimal-slp-wallet
        uut.BchWallet = class BchWallet {
          constructor () {
            throw new Error('test error')
          }
        }

        await uut.instanceWallet(walletName)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getRestServer', () => {
    it('should return default values', () => {
      // Force conf.get to return false.
      sandbox.stub(uut.conf, 'get').returns(false)

      const result = uut.getRestServer()

      assert.equal(result.restURL, 'https://free-bch.fullstack.cash')
      assert.equal(result.interface, 'consumer-api')
    })

    it('should return saved values', () => {
      // Force desired code paths
      sandbox.stub(uut.conf, 'get')
        .onCall(0).returns('test-restURL')
        .onCall(1).returns('test-interface')

      const result = uut.getRestServer()

      assert.equal(result.restURL, 'test-restURL')
      assert.equal(result.interface, 'test-interface')
    })

    it('should catch and throw an error', () => {
      // Force an error
      sandbox.stub(uut.conf, 'get').throws(new Error('test error'))

      try {
        uut.getRestServer()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#broadcastTx', () => {
    it('should broadcast a hex tx', async () => {
      // Mock minimal-slp-wallet
      const Wallet = class BchWallet {
        constructor () {
          this.ar = {
            sendTx: async () => { return 'fake-txid' }
          }
        }
      }
      const wallet = new Wallet()

      const result = await uut.broadcastTx(wallet, 'fake-hex')

      assert.equal(result, 'fake-txid')
    })
  })
})
