/*
  Unit tests for the wallet-util.js library.
*/

'use strict'

const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs')

// File under test.
const WalletUtil = require('../../../src/lib/wallet-util')

// Mocking data
const utilMocks = require('../../mocks/wallet-util-mock')

describe('#Wallet-Util', () => {
  let sandbox
  let uut

  beforeEach(() => {
    uut = new WalletUtil()

    sandbox = sinon.createSandbox()
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
})
