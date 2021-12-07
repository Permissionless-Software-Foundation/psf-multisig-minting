'use strict'

/* Unit tests for the msg-send command. */

const assert = require('chai').assert
const sinon = require('sinon')

const MsgSend = require('../../../src/commands/msg-send')
const MsgSendMock = require('../../mocks/msg-send-mock')

describe('msg-send', () => {
  let uut
  let sandbox

  before(async () => {})
  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new MsgSend()
  })

  afterEach(() => {
    sandbox.restore()
  })
  after(async () => {})

  describe('#msgSend()', () => {
    it('should exit with error status if called without a bchAddress.', async () => {
      try {
        await uut.msgSend(undefined)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'input bchAddress must be a string.',
          'Should throw expected error.'
        )
      }
    })

    it('should send message.', async () => {
      const flags = {
        bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'
      }
      // Mock methods that will be tested elsewhere.
      sandbox
        .stub(uut.walletService, 'getPubKey')
        .resolves(MsgSendMock.getPubkeyResult)

      const result = await uut.msgSend(flags.bchAddress)

      assert.isObject(result)
      assert.property(result, 'success')
      assert.property(result, 'status')
      assert.property(result, 'endpoint')
      assert.property(result, 'pubkey')

      assert.isObject(result.pubkey)
      assert.property(result.pubkey, 'success')
      assert.property(result.pubkey, 'publicKey')
    })
  })

  describe('#validateFlags()', () => {
    it('validateFlags() should return true .', () => {
      const flags = {
        bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'
      }
      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('validateFlags() should throw error if bchAddress is not supplied.', () => {
      try {
        const flags = {}
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a bch address with the -b flag.',
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
        bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'
      }
      // Mock methods that will be tested elsewhere.
      sandbox
        .stub(uut.walletService, 'getPubKey')
        .resolves(MsgSendMock.getPubkeyResult)

      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.isObject(result)
    })

    it('should display error message if the address does not have a transaction history', async () => {
      // Mock dependencies
      const flags = {
        bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'
      }

      // Mock methods that will be tested elsewhere.
      // sandbox
      sandbox.stub(uut, 'msgSend').rejects(new Error('No transaction history'))

      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.equal(result, 0)
    })
  })
})
