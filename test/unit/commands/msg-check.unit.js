'use strict'

/* Unit tests for the msg-check command. */

const assert = require('chai').assert
const sinon = require('sinon')

const MsgCheck = require('../../../src/commands/msg-check')
const MsgCheckMock = require('../../mocks/msg-check-mock')
const filename = `${__dirname.toString()}/../../../.wallets/test123.json`
const WalletCreate = require('../../../src/commands/wallet-create')
const walletCreate = new WalletCreate()
describe('msg-send', () => {
  let uut
  let sandbox

  before(async () => {
    await walletCreate.createWallet(filename)
  })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new MsgCheck()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#msgCheck()', () => {
    it('should exit with error status if called without a filename.', async () => {
      try {
        await uut.msgCheck(undefined, undefined)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'filename is required.',
          'Should throw expected error.'
        )
      }
    })
    it('should return false if messages list is empty.', async () => {
      const flags = {
        name: 'test123'
      }
      // Mock methods that will be tested elsewhere.
      sandbox
        .stub(uut.messagesLib.memo, 'readMsgSignal')
        .resolves([])

      const result = await uut.msgCheck(filename, flags)

      assert.isFalse(result)
    })
    it('should check messages.', async () => {
      const flags = {
        name: 'test123'
      }
      // Mock methods that will be tested elsewhere.
      sandbox
        .stub(uut.messagesLib.memo, 'readMsgSignal')
        .resolves(MsgCheckMock.messages)

      const result = await uut.msgCheck(filename, flags)

      assert.isTrue(result)
    })
  })
  describe('#filterMessages()', () => {
    it('should filter messages.', async () => {
      const bchAddress = 'bitcoincash:qpjxec7k5rlxz6md8ur6zlmmkrqcu2jnlsdh0j4ksx'
      const result = await uut.filterMessages(bchAddress, MsgCheckMock.messages)
      assert.notEqual(MsgCheckMock.messages.length, result.length)
    })
    it('should throw error if bchAddress is not provided.', async () => {
      try {
        await uut.filterMessages()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'bchAddress must be a string.',
          'Should throw expected error.'
        )
      }
    })
    it('should throw error if messages is not provided', async () => {
      try {
        const bchAddress = 'bitcoincash:qpjxec7k5rlxz6md8ur6zlmmkrqcu2jnlsdh0j4ksx'

        await uut.filterMessages(bchAddress)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'messages must be an array.',
          'Should throw expected error.'
        )
      }
    })
  })
  describe('#displayTable()', () => {
    it('should display table.', async () => {
      const result = await uut.displayTable(MsgCheckMock.messages)
      assert.isString(result)
    })
  })
  describe('#validateFlags()', () => {
    it('validateFlags() should return true .', () => {
      const flags = {
        name: 'my wallet'
      }
      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('validateFlags() should throw error if wallet name is not supplied.', () => {
      try {
        uut.validateFlags({})
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a wallet with the -n flag.',
          'Expected error message.'
        )
      }
    })
  })

  describe('#run()', () => {
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

    it('should run the run() function', async () => {
      // Mock dependencies
      const flags = {
        name: 'test123'
      }
      // Mock methods that will be tested elsewhere.
      sandbox
        .stub(uut.messagesLib.memo, 'readMsgSignal')
        .resolves(MsgCheckMock.messages)

      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.isTrue(result)
    })
  })
})
