/*
  Unit tests for the p2wdb-write command.
*/

const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs').promises

const P2WDBWrite = require('../../../src/commands/p2wdb-write')
// const SendBCHMock = require('../../mocks/send-bch-mock')
const WalletCreate = require('../../../src/commands/wallet-create')
const walletCreate = new WalletCreate()
const MockWallet = require('../../mocks/msw-mock')

const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('#p2wdb-write', () => {
  let uut
  let sandbox
  let mockWallet

  before(async () => {
    await walletCreate.createWallet(filename)
  })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new P2WDBWrite()
    mockWallet = new MockWallet()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
    await fs.rm(filename)
  })

  describe('#validateFlags()', () => {
    it('validateFlags() should return true.', () => {
      const flags = {
        name: 'test123',
        data: 'a string of data',
        appId: 'test'
      }

      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('validateFlags() should throw error if name is not supplied.', () => {
      try {
        const flags = {}
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a wallet with the -n flag.',
          'Expected error message.'
        )
      }
    })

    it('validateFlags() should throw error if data is not supplied.', () => {
      try {
        const flags = {
          name: 'test123'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a string of data with the -d flag.',
          'Expected error message.'
        )
      }
    })

    it('validateFlags() should throw error if appId is not supplied.', () => {
      try {
        const flags = {
          name: 'test123',
          data: 'test data'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify an appId with the -a flag.',
          'Expected error message.'
        )
      }
    })
  })

  describe('#instantiateWrite', () => {
    it('should instantiate the Write library', async () => {
      // Mock dependencies
      sandbox.stub(uut.walletUtil, 'instanceWallet').resolves(mockWallet)
      sandbox.stub(uut.walletUtil, 'getP2wdbServer').resolves('https://p2wdb.fullstack.cash')

      const flags = {
        name: 'test123'
      }

      const result = await uut.instantiateWrite(flags)

      assert.equal(result, true)
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.instantiateWrite()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#writeData', () => {
    it('should write data to the P2WDB', async () => {
      // Mock dependencies
      uut.write = {
        postEntry: () => { return { hash: 'fake-hash' } }
      }

      const result = await uut.writeData({})

      assert.equal(result, 'fake-hash')
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.writeData()

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
      sandbox.stub(uut, 'instantiateWrite').resolves()
      sandbox.stub(uut, 'writeData').resolves('fake-cid')

      const result = await uut.run()

      assert.equal(result, 'fake-cid')
    })
  })
})
