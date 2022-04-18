/* Unit tests for the msg-check command. */

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Local libraries
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

  describe('#filterMessages()', () => {
    it('should filter messages.', async () => {
      const bchAddress =
        'bitcoincash:qpjxec7k5rlxz6md8ur6zlmmkrqcu2jnlsdh0j4ksx'
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
        const bchAddress =
          'bitcoincash:qpjxec7k5rlxz6md8ur6zlmmkrqcu2jnlsdh0j4ksx'

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

  describe('#msgCheck()', () => {
    it('should exit with error if called without a wallet name.', async () => {
      try {
        await uut.msgCheck(undefined)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'walletName is required.',
          'Should throw expected error.'
        )
      }
    })

    it('should return false if messages list is empty.', async () => {
      // Prevent wallet from making a network call.
      uut.walletUtil.advancedConfig.noUpdate = true

      // Mock the memo library
      class Memo {
        async readMsgSignal (cashAddress) {
          return []
        }
      }
      uut.MsgLib = class MsgLib {
        constructor () {
          this.memo = new Memo()
        }
      }

      const walletName = 'test123'

      const result = await uut.msgCheck(walletName)

      assert.isFalse(result)
    })

    it('should check messages.', async () => {
      // Prevent wallet from making a network call.
      uut.walletUtil.advancedConfig.noUpdate = true

      // Mock the memo library
      class Memo {
        async readMsgSignal (cashAddress) {
          return MsgCheckMock.messages
        }
      }
      uut.MsgLib = class MsgLib {
        constructor () {
          this.memo = new Memo()
        }
      }

      // Mock the display function
      sandbox.stub(uut, 'displayTable').returns()

      const walletName = 'test123'

      const result = await uut.msgCheck(walletName)

      assert.isTrue(result)
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
      // Prevent wallet from making a network call.
      uut.walletUtil.advancedConfig.noUpdate = true

      // Mock the memo library
      class Memo {
        async readMsgSignal (cashAddress) {
          return MsgCheckMock.messages
        }
      }
      uut.MsgLib = class MsgLib {
        constructor () {
          this.memo = new Memo()
        }
      }

      // Mock the display function
      sandbox.stub(uut, 'displayTable').returns()

      const flags = {
        name: 'test123'
      }

      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.isTrue(result)
    })
  })
})
