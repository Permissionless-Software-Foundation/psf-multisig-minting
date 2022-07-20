/*
  Unit tests for the token-tx-history command
*/

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
// const fs = require('fs').promises

// Local libraries
const TokenTxHistory = require('../../../src/commands/token-tx-history')
// const WalletCreate = require('../../../src/commands/wallet-create')
// const MockWallet = require('../../mocks/msw-mock')

// const walletCreate = new WalletCreate()
// const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('#token-info', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new TokenTxHistory()
    // mockWallet = new MockWallet()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#validateFlags()', () => {
    it('should return true if all arguments are included', () => {
      const flags = {
        tokenId: 'abc123'
      }

      assert.equal(uut.validateFlags(flags), true, 'return true')
    })

    it('should throw error if tokenId is not supplied.', () => {
      try {
        const flags = {}
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a token ID with the -t flag',
          'Expected error message.'
        )
      }
    })
  })

  describe('#getTxHistory', () => {
    it('should get token data', async () => {
      // Mock wallet library
      const BchWallet = class BchWallet {
        constructor () {
          this.ar = {
            getTokenData: () => {
              return {
                genesisData: {
                  txs: []
                }
              }
            }
          }
        }
      }
      uut.BchWallet = BchWallet

      const flags = {
        tokenId: 'abc'
      }

      const result = await uut.getTxHistory(flags)
      // console.log(result)

      assert.isArray(result)
    })
  })

  describe('#displayTxHistory', () => {
    it('should display the final data', () => {
      const allData = {
        a: 'b'
      }

      const result = uut.displayTxHistory(allData)

      assert.equal(result, true)
    })
  })

  describe('#run', () => {
    it('should execute the command', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'parse').returns({ flags: { tokenId: 'a' } })
      sandbox.stub(uut, 'validateFlags').returns(true)
      sandbox.stub(uut, 'getTxHistory').resolves({})
      sandbox.stub(uut, 'displayTxHistory').returns()

      const result = await uut.run()

      assert.equal(result, true)
    })

    it('should return 0 and display error.message on empty flags', async () => {
      sandbox.stub(uut, 'parse').returns({ flags: {} })

      const result = await uut.run()

      assert.equal(result, 0)
    })
  })
})
