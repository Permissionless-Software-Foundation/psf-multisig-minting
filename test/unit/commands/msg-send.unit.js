/* Unit tests for the msg-send command. */

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Local libraries
const MsgSend = require('../../../src/commands/msg-send')
const MsgSendMock = require('../../mocks/msg-send-mock')
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

    uut = new MsgSend()
    uut.Write = MsgSendMock.Write
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#validateFlags()', () => {
    it('validateFlags() should return true .', () => {
      const flags = {
        bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
        message: 'test message',
        subject: 'Test',
        name: 'my wallet'
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

    it('validateFlags() should throw error if message is not supplied.', () => {
      try {
        const flags = {
          bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify the message to send with the -m flag.',
          'Expected error message.'
        )
      }
    })

    it('validateFlags() should throw error if subject is not supplied.', () => {
      try {
        const flags = {
          bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
          message: 'test message'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify the message subject with the -s flag.',
          'Expected error message.'
        )
      }
    })

    it('validateFlags() should throw error if wallet name is not supplied.', () => {
      try {
        const flags = {
          bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
          message: 'test message',
          subject: 'Test'
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

  describe('#encryptMsg()', () => {
    it('should return the encrypted message.', async () => {
      const pubKey = MsgSendMock.getPubkeyResult.pubkey.publicKey
      const msg = 'message'
      const result = await uut.encryptMsg(pubKey, msg)
      assert.isString(result)
    })

    it('should throw an error if pubKey is not provided.', async () => {
      try {
        await uut.encryptMsg()
      } catch (err) {
        assert.include(
          err.message,
          'pubKey must be a string',
          'Expected error message.'
        )
      }
    })

    it('should throw an error if msg is not provided.', async () => {
      try {
        const pubKey = MsgSendMock.getPubkeyResult.pubkey.publicKey
        await uut.encryptMsg(pubKey)
      } catch (err) {
        assert.include(
          err.message,
          'msg must be a string',
          'Expected error message.'
        )
      }
    })
  })

  describe('#signalMessage()', () => {
    it('should throw an error if hash is not provided.', async () => {
      try {
        await uut.signalMessage()
      } catch (err) {
        assert.include(
          err.message,
          'hash must be a string',
          'Expected error message.'
        )
      }
    })

    it('should throw an error if bchAddress is not provided.', async () => {
      try {
        const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'

        await uut.signalMessage(hash)
      } catch (err) {
        assert.include(
          err.message,
          'bchAddress must be a string',
          'Expected error message.'
        )
      }
    })

    it('should throw an error if subject is not provided.', async () => {
      try {
        const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'
        const bchAddress =
          'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'

        await uut.signalMessage(hash, bchAddress)
      } catch (err) {
        assert.include(
          err.message,
          'subject must be a string',
          'Expected error message.'
        )
      }
    })

    it('should return transaction hex.', async () => {
      const bchAddress =
        'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'
      const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'
      const subject = 'subject'

      // Mock bch-message-lib
      uut.msgLib = {
        memo: {
          writeMsgSignal: () => 'tx hex'
        }
      }

      const result = await uut.signalMessage(hash, bchAddress, subject)
      assert.isString(result)
    })

    it('should throw error if cant build the tx', async () => {
      try {
        const bchAddress =
          'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'
        const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'
        const subject = 'subject'

        // Mock bch-message-lib
        uut.msgLib = {
          memo: {
            writeMsgSignal: () => null
          }
        }

        await uut.signalMessage(hash, bchAddress, subject)
      } catch (err) {
        assert.include(
          err.message,
          'Could not build a hex transaction',
          'Expected error message.'
        )
      }
    })
  })

  describe('#instanceLibs', () => {
    it('should instantiate the different libraries', async () => {
      const flags = {
        bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
        message: 'test message',
        subject: 'Test',
        name: 'test123'
      }

      const result = await uut.instanceLibs(flags)

      assert.equal(result, true)
    })
  })

  describe('#encryptAndUpload', () => {
    it('should encrypt the message and upload it to the P2WDB', async () => {
      const flags = {
        bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
        message: 'test message',
        subject: 'Test',
        name: 'test123'
      }

      await uut.instanceLibs(flags)

      sandbox
        .stub(uut.walletService, 'getPubKey')
        .resolves(MsgSendMock.getPubkeyResult)

      sandbox.stub(uut.write, 'postEntry').resolves({ hash: 'fake-hash' })
      // uut.write.postEntry = () => {
      //   hash: 'fake-hash'
      // }

      const result = await uut.encryptAndUpload(flags)

      assert.equal(result, 'fake-hash')
    })
  })

  describe('#sendMsgSignal', () => {
    it('should generate a PS001 message and broadcast it', async () => {
      const flags = {
        bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
        message: 'test message',
        subject: 'Test',
        name: 'test123'
      }

      await uut.instanceLibs(flags)

      // Mock dependencies
      sandbox.stub(uut.bchWallet.bchjs.Util, 'sleep').resolves()
      sandbox.stub(uut.bchWallet, 'getUtxos').resolves()
      sandbox.stub(uut, 'signalMessage').resolves('fake-hex')
      sandbox.stub(uut.bchWallet.ar, 'sendTx').resolves('fake-txid')

      const result = await uut.sendMsgSignal(flags, 'fake-CID')

      assert.equal(result, 'fake-txid')
    })
  })

  describe('#msgSend()', () => {
    it('should send a message', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'instanceLibs').resolves()
      sandbox.stub(uut, 'encryptAndUpload').resolves('fake-hash')
      sandbox.stub(uut, 'sendMsgSignal').resolves('fake-txid')

      const flags = {
        bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
        message: 'test message',
        subject: 'Test',
        name: 'test123'
      }

      const result = await uut.msgSend(flags)

      assert.equal(result, 'fake-txid')
    })

    it('should catch, log, and throw errors', async () => {
      try {
        // Force an error
        sandbox.stub(uut, 'instanceLibs').rejects(new Error('test error'))

        const flags = {
          bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
          message: 'test message',
          subject: 'Test',
          name: 'test123'
        }

        await uut.msgSend(flags)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
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
      sandbox.stub(uut, 'parse').returns({ flags: {} })
      sandbox.stub(uut, 'validateFlags').resolves()
      sandbox.stub(uut, 'msgSend').resolves('fake-txid')

      const result = await uut.run()

      assert.equal(result, 'fake-txid')
    })

    // it('should run the run() function', async () => {
    //   // Mock dependencies
    //   const flags = {
    //     bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
    //     message: 'test message',
    //     subject: 'Test',
    //     name: 'test123'
    //   }
    //   // Mock methods that will be tested elsewhere.
    //   sandbox
    //     .stub(uut.walletService, 'getPubKey')
    //     .resolves(MsgSendMock.getPubkeyResult)
    //
    //   sandbox.stub(uut.messagesLib.memo, 'writeMsgSignal').resolves('tx hex')
    //
    //   sandbox
    //     .stub(uut.messagesLib.bchjs.RawTransactions, 'sendRawTransaction')
    //     .resolves('txid')
    //
    //   // Mock methods that will be tested elsewhere.
    //   sandbox.stub(uut, 'parse').returns({ flags: flags })
    //
    //   const result = await uut.run()
    //
    //   assert.isString(result)
    // })

    // it('should display error message if the address does not have a transaction history', async () => {
    //   // Mock dependencies
    //   const flags = {
    //     bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
    //     message: 'test message',
    //     subject: 'Test',
    //     name: 'test123'
    //   }
    //
    //   // Mock methods that will be tested elsewhere.
    //   // sandbox
    //   sandbox.stub(uut, 'msgSend').rejects(new Error('No transaction history'))
    //
    //   // Mock methods that will be tested elsewhere.
    //   sandbox.stub(uut, 'parse').returns({ flags: flags })
    //
    //   const result = await uut.run()
    //
    //   assert.equal(result, 0)
    // })
  })
})
