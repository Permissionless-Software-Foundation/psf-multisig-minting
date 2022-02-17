/* Unit tests for the msg-read command. */

const assert = require('chai').assert
const sinon = require('sinon')

const MsgRead = require('../../../src/commands/msg-read')
const MsgReadMock = require('../../mocks/msg-read-mock')
const filename = `${__dirname.toString()}/../../../.wallets/test123.json`
const WalletCreate = require('../../../src/commands/wallet-create')
const walletCreate = new WalletCreate()

describe('msg-read', () => {
  let uut
  let sandbox

  before(async () => {
    await walletCreate.createWallet(filename)
  })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new MsgRead()
    uut.Read = MsgReadMock.Read
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#MsgRead()', () => {
    it('should exit with error status if called without a filename.', async () => {
      try {
        await uut.msgRead(undefined, undefined)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'filename is required.',
          'Should throw expected error.'
        )
      }
    })

    it('should read message.', async () => {
      const flags = {
        txid:
          '36639f7c52ad385a2feeeed08240d92ebb05d7f8aa8a1e8531857bf7a9dc5948',
        name: 'my wallet'
      }
      // Mock methods that will be tested elsewhere.
      sandbox
        .stub(uut.bchjs.RawTransactions, 'getRawTransaction')
        .resolves(MsgReadMock.transactionData)

      sandbox
        .stub(uut.encryptLib.encryption, 'decryptFile')
        .resolves(MsgReadMock.decryptedMsgHex)

      const result = await uut.msgRead(filename, flags)

      assert.isString(result)
    })
    it('should handle decryption error.', async () => {
      try {
        const flags = {
          txid:
            '36639f7c52ad385a2feeeed08240d92ebb05d7f8aa8a1e8531857bf7a9dc5948',
          name: 'my wallet'
        }
        // Mock methods that will be tested elsewhere.
        sandbox
          .stub(uut.bchjs.RawTransactions, 'getRawTransaction')
          .resolves(MsgReadMock.transactionData)

        await uut.msgRead(filename, flags)
        assert.fail('Unexpected result')
      } catch (error) {
        assert.include(error.message, 'Bad MAC', 'Should throw expected error.')
      }
    })
  })
  describe('#getHashFromTx()', () => {
    it('should throw an error if txData is not provided.', async () => {
      try {
        await uut.getHashFromTx()
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'txData object is required.',
          'Expected error message.'
        )
      }
    })
    it('should throw an error if ipfs hash not found.', async () => {
      try {
        await uut.getHashFromTx(MsgReadMock.transactionData2[0])
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Message not found!',
          'Expected error message.'
        )
      }
    })
    it('should return hash from tx', async () => {
      const result = await uut.getHashFromTx(MsgReadMock.transactionData[0])
      assert.isString(result)
    })
  })
  describe('#validateFlags()', () => {
    it('validateFlags() should return true .', () => {
      const flags = {
        txid:
          '36639f7c52ad385a2feeeed08240d92ebb05d7f8aa8a1e8531857bf7a9dc5948',
        name: 'my wallet'
      }
      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('validateFlags() should throw error if txid is not supplied.', () => {
      try {
        const flags = {}
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a txid with the -t flag.',
          'Expected error message.'
        )
      }
    })

    it('validateFlags() should throw error if wallet name is not supplied.', () => {
      try {
        const flags = {
          txid:
            '36639f7c52ad385a2feeeed08240d92ebb05d7f8aa8a1e8531857bf7a9dc5948'
        }
        uut.validateFlags(flags)
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
        txid:
          '36639f7c52ad385a2feeeed08240d92ebb05d7f8aa8a1e8531857bf7a9dc5948',
        name: 'test123'
      }
      // Mock methods that will be tested elsewhere.
      sandbox
        .stub(uut.bchjs.RawTransactions, 'getRawTransaction')
        .resolves(MsgReadMock.transactionData)

      sandbox
        .stub(uut.encryptLib.encryption, 'decryptFile')
        .resolves(MsgReadMock.decryptedMsgHex)

      // Mock methods that will be tested elsewhere.
      sandbox.stub(uut, 'parse').returns({ flags: flags })

      const result = await uut.run()

      assert.isString(result)
    })
  })
})
