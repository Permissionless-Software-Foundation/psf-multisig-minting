/*
  Unit tests for the p2wdb-read command.
*/

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
// const fs = require('fs').promises

// Local libraries
const P2WDBRead = require('../../../src/commands/p2wdb-read')
// const SendBCHMock = require('../../mocks/send-bch-mock')
// const WalletCreate = require('../../../src/commands/wallet-create')
// const walletCreate = new WalletCreate()
// const MockWallet = require('../../mocks/msw-mock')

// const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('#p2wdb-read', () => {
  let uut
  let sandbox
  // let mockWallet

  // before(async () => {
  //   await walletCreate.createWallet(filename)
  // })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new P2WDBRead()
    // mockWallet = new MockWallet()
  })

  afterEach(() => {
    sandbox.restore()
  })

  // after(async () => {
  //   await fs.rm(filename)
  // })

  describe('#validateFlags()', () => {
    it('validateFlags() should return true.', () => {
      const flags = {
        hash: 'zdpuAm3nCUHpjuECpQpC2BsQU3GqjPWkD5kTFdC7mYUubGfWM'
      }

      const result = uut.validateFlags(flags)

      assert.equal(result, true)
    })

    it('validateFlags() should throw error if hash is not supplied.', () => {
      try {
        const flags = {}
        uut.validateFlags(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a record hash with the -h flag.'
        )
      }
    })
  })

  describe('#readP2WDB', () => {
    it('should return data from the P2WDB', async () => {
      // Mock dependencies
      sandbox.stub(uut.read, 'getByHash').resolves('fake-data')

      const flags = {
        hash: 'zdpuAm3nCUHpjuECpQpC2BsQU3GqjPWkD5kTFdC7mYUubGfWM'
      }

      const result = await uut.readP2WDB(flags)

      assert.equal(result, 'fake-data')
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.readP2WDB()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#run()', () => {
    it('should return 0 and display error.message on empty flags', async () => {
      sandbox.stub(uut, 'parse').returns({ flags: {} })

      const result = await uut.run()

      assert.equal(result, 0)
    })

    it('should return a CID', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'parse').returns({ flags: {} })
      sandbox.stub(uut, 'validateFlags').returns()
      sandbox.stub(uut, 'readP2WDB').resolves('fake-data')

      const result = await uut.run()

      assert.equal(result, 'fake-data')
    })
  })
})
