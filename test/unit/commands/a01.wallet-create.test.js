/*
  Create wallet
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs')
const WalletCreate = require('../../../src/commands/wallet-create')

// const { bitboxMock } = require('../mocks/bitbox')
const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

// Used to delete testing wallet files.
const deleteFile = () => {
  const prom = new Promise((resolve, reject) => {
    // fs.unlink(filename, () => {
    //   resolve(true)
    // }) // Delete wallets file

    fs.rmSync(filename)
  })
  return prom
}

describe('wallet-create', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new WalletCreate()

    // By default, use the mocking library instead of live calls.
    // createWallet.bchjs = bitboxMock

    // await deleteFile()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#createWallet()', () => {
    it('should exit with error status if called without a filename.', async () => {
      try {
        await uut.createWallet(undefined, undefined)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(
          err.message,
          'filename required.',
          'Should throw expected error.'
        )
      }
    })

    it('Should exit with error status if called with a filename that already exists.', async () => {
      try {
        // Force the error for testing purposes.
        sandbox.stub(uut.fs, 'existsSync').returns(true)

        await uut.createWallet(filename, 'testnet')

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(
          err.message,
          'filename already exist',
          'Should throw expected error.'
        )
      }
    })

    it('should create a mainnet wallet file with the given name', async () => {
      const walletData = await uut.createWallet(filename, undefined)
      // console.log(`walletData: ${JSON.stringify(walletData, null, 2)}`)

      assert.property(walletData, 'mnemonic')
      assert.property(walletData, 'derivation')
      assert.property(walletData, 'rootAddress')
      assert.property(walletData, 'balance')
      assert.property(walletData, 'nextAddress')
      assert.property(walletData, 'hasBalance')
      assert.property(walletData, 'addresses')

      // hasBalance is an array of objects. Each object represents an address with
      // a balance.
      assert.isArray(walletData.hasBalance)

      // Clean up.
      deleteFile()
    })
  })

  describe('#validateFlags()', () => {
    it('validateFlags() should return true if name is supplied.', () => {
      assert.equal(uut.validateFlags({ name: 'test' }), true, 'return true')
    })

    it('validateFlags() should throw error if name is not supplied.', () => {
      try {
        uut.validateFlags({})
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a wallet with the -n flag',
          'Expected error message.'
        )
      }
    })
  })

  describe('#run()', () => {
    it('should run the run() function', async () => {
      const flags = {
        name: 'test123'
      }
      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const walletData = await uut.run()

      assert.property(walletData, 'mnemonic')
      assert.property(walletData, 'derivation')
      assert.property(walletData, 'rootAddress')
      assert.property(walletData, 'balance')
      assert.property(walletData, 'nextAddress')
      assert.property(walletData, 'hasBalance')
      assert.property(walletData, 'addresses')
      // console.log(`data: ${util.inspect(walletData)}`)

      // Clean up.
      deleteFile()
    })

    it('should return 0 and display error.message on empty flags', async () => {
      sandbox.stub(uut, 'parse').returns({ flags: {} })

      const result = await uut.run()

      assert.equal(result, 0)
    })

    it('should handle an error without a message', async () => {
      sandbox.stub(uut, 'parse').throws({})

      const result = await uut.run()

      assert.equal(result, 0)
    })
  })
})
