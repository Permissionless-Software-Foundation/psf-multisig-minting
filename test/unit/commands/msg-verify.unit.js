/*
  Unit tests for the msg-verify command.
*/

// Global npm libraries.
const assert = require('chai').assert
const sinon = require('sinon')
// const fs = require('fs').promises

// Local libraries.
const MsgVerify = require('../../../src/commands/msg-verify')
// const SendBCHMock = require('../../mocks/send-bch-mock')
// const WalletCreate = require('../../../src/commands/wallet-create')
// const walletCreate = new WalletCreate()
// const MockWallet = require('../../mocks/msw-mock')

// const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('#msg-verify', () => {
  let uut
  let sandbox
  // let mockWallet

  // before(async () => {
  //   await walletCreate.createWallet(filename)
  // })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new MsgVerify()
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
        bchAddr: 'bitcoincash:qqxeal3ffp02004mkgla3jetvp4eg9nf5qy48grs6q',
        msg: 'test',
        sig: 'HzYWuptuK+5RPEf0Ib22AjtKYqJq6g96OcHEL5rVPWZhcgtLWoQ9VPCzRXY5ocUpdIMxg3svNakIUCjcnEojBC8='
      }

      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('validateFlags() should throw error if bchAddr is not supplied.', () => {
      try {
        const flags = {}
        uut.validateFlags(flags)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'You must specify the BCH address of the signer with the -b flag.',
          'Expected error message.'
        )
      }
    })

    it('validateFlags() should throw error if msg is not supplied.', () => {
      try {
        const flags = {
          bchAddr: 'bitcoincash:qqxeal3ffp02004mkgla3jetvp4eg9nf5qy48grs6q'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify the cleartext message used to generate the signature with the -m flag.',
          'Expected error message.'
        )
      }
    })

    it('validateFlags() should throw error if sig is not supplied.', () => {
      try {
        const flags = {
          bchAddr: 'bitcoincash:qqxeal3ffp02004mkgla3jetvp4eg9nf5qy48grs6q',
          msg: 'test'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify the signature with the -s flag.',
          'Expected error message.'
        )
      }
    })
  })

  describe('#verifySig', () => {
    it('should verify a valid signature', () => {
      const flags = {
        bchAddr: 'bitcoincash:qqxeal3ffp02004mkgla3jetvp4eg9nf5qy48grs6q',
        msg: 'test',
        sig: 'HzYWuptuK+5RPEf0Ib22AjtKYqJq6g96OcHEL5rVPWZhcgtLWoQ9VPCzRXY5ocUpdIMxg3svNakIUCjcnEojBC8='
      }

      const result = uut.verifySig(flags)

      assert.equal(result, true)
    })

    it('should return false for invalid signature', () => {
      const flags = {
        bchAddr: 'bitcoincash:qqxeal3ffp02004mkgla3jetvp4eg9nf5qy48grs6q',
        msg: 'test1',
        sig: 'HzYWuptuK+5RPEf0Ib22AjtKYqJq6g96OcHEL5rVPWZhcgtLWoQ9VPCzRXY5ocUpdIMxg3svNakIUCjcnEojBC8='
      }

      const result = uut.verifySig(flags)

      assert.equal(result, false)
    })

    it('should catch and throw an error', () => {
      try {
        uut.verifySig()

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
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

    it('should return true on successful execution', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'parse').returns({
        flags: {
          bchAddr: 'bitcoincash:qqxeal3ffp02004mkgla3jetvp4eg9nf5qy48grs6q',
          msg: 'test',
          sig: 'HzYWuptuK+5RPEf0Ib22AjtKYqJq6g96OcHEL5rVPWZhcgtLWoQ9VPCzRXY5ocUpdIMxg3svNakIUCjcnEojBC8='
        }
      })

      const result = await uut.run()

      assert.equal(result, true)
    })
  })
})
