/*
  Unit tests for the token-burn command.
*/

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs').promises

// Local libraries
const TokenBurn = require('../../../src/commands/token-burn')
const WalletCreate = require('../../../src/commands/wallet-create')
// const MockWallet = require('../../mocks/msw-mock')

const walletCreate = new WalletCreate()
const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('#token-burn', () => {
  let uut
  let sandbox
  // let mockWallet

  before(async () => {
    await walletCreate.createWallet(filename)
  })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new TokenBurn()
    // mockWallet = new MockWallet()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after(async () => {
    await fs.rm(filename)
  })

  describe('#validateFlags()', () => {
    it('should return true if all arguments are included', () => {
      const flags = {
        name: 'test123',
        qty: 1,
        tokenId: 'abc123'
      }

      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('should throw error if name is not supplied.', () => {
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

    it('should throw error if token quantity are not supplied.', () => {
      try {
        const flags = {
          name: 'test123'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a quantity of tokens with the -q flag.',
          'Expected error message.'
        )
      }
    })

    it('should throw error if token ID is not supplied', () => {
      try {
        const flags = {
          name: 'test123',
          qty: 1
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a token Id with the -t flag.',
          'Expected error message.'
        )
      }
    })
  })

  describe('#openWallet', () => {
    it('should return an instance of the wallet', async () => {
      const flags = {
        name: 'test123'
      }

      const result = await uut.openWallet(flags)
      // console.log('result: ', result)

      assert.property(result, 'advancedOptions')
    })
  })

  describe('#tokenBurn', () => {
    it('should burn all if qty is 0', async () => {
      const flags = {
        name: 'test123',
        qty: 0
      }

      await uut.openWallet(flags)

      // Mock dependencies
      sandbox.stub(uut.wallet, 'burnAll').resolves('fake-txid')

      const result = await uut.tokenBurn(flags)

      assert.equal(result, 'fake-txid')
    })

    it('should burn specified quantity of tokens', async () => {
      const flags = {
        name: 'test123',
        qty: 1
      }

      await uut.openWallet(flags)

      // Mock dependencies
      sandbox.stub(uut.wallet, 'burnTokens').resolves('fake-txid')

      const result = await uut.tokenBurn(flags)

      assert.equal(result, 'fake-txid')
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.tokenBurn()

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
          name: 'test123',
          qty: 1,
          tokenId: 'abc123'
        }
      })
      sandbox.stub(uut, 'tokenBurn').resolves('fake-txid')

      const result = await uut.run()

      assert.equal(result, 'fake-txid')
    })
  })
})
