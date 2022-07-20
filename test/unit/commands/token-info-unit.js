/*
  Unit tests for the token-info command
*/

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
// const fs = require('fs').promises

// Local libraries
const TokenInfo = require('../../../src/commands/token-info')
// const WalletCreate = require('../../../src/commands/wallet-create')
// const MockWallet = require('../../mocks/msw-mock')

// const walletCreate = new WalletCreate()
// const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('#token-info', () => {
  let uut
  let sandbox
  // let mockWallet

  // before(async () => {
  //   await walletCreate.createWallet(filename)
  // })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new TokenInfo()
    // mockWallet = new MockWallet()
  })

  afterEach(() => {
    sandbox.restore()
  })

  // after(async () => {
  //   await fs.rm(filename)
  // })

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

  describe('#getTokenData', () => {
    it('should get token data', async () => {
      // Mock wallet library
      const BchWallet = class BchWallet {
        constructor () {
          this.ar = {
            getTokenData: () => true
          }
        }
      }
      uut.BchWallet = BchWallet

      const flags = {
        tokenId: 'abc'
      }

      const result = await uut.getTokenData(flags)
      // console.log(result)

      assert.equal(result, true)
    })
  })

  describe('#summarizeData', () => {
    it('should summarize the genesis data', () => {
      // Mock data
      const tokenData = {
        genesisData: {
          decimals: 2,
          tokensInCirculationStr: '100097954686',
          totalBurned: '2045314',
          totalMinted: '100100000000'
        }
      }

      const result = uut.summarizeData(tokenData)
      // console.log(result)

      assert.equal(result.tokensInCirculation, 1000979546.86)
      assert.equal(result.totalBurned, 20453.14)
      assert.equal(result.totalMinted, 1001000000)
    })
  })

  describe('#getIpfsData', () => {
    it('should get IPFS data from a gateway', async () => {
      // Mock network calls
      sandbox.stub(uut.axios, 'get').resolves({ data: { a: 'b' } })

      const ipfsUri = 'ipfs://bafybeicp4n4jxm6z6yuftlqvkrgxj3elzctnjn2ufmwz7ivijfowleg6j4'

      const result = await uut.getIpfsData(ipfsUri)
      // console.log(result)

      assert.equal(result.a, 'b')
    })

    it('should return "not-available" if ipfs URI is not found', async () => {
      const ipfsUri = 'blah'

      const result = await uut.getIpfsData(ipfsUri)

      assert.equal(result, 'not available')
    })
  })

  describe('#displayData', () => {
    it('should display the final data', () => {
      const allData = {
        tokenData: 'a',
        dataSummary: 'b',
        immutableData: 'c',
        mutableData: 'd'
      }

      const result = uut.displayData(allData)

      assert.equal(result, true)
    })
  })

  describe('#run', () => {
    it('should execute the command', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'parse').returns({ flags: { tokenId: 'a' } })
      sandbox.stub(uut, 'validateFlags').returns(true)
      sandbox.stub(uut, 'getTokenData').resolves({})
      sandbox.stub(uut, 'summarizeData').returns()
      sandbox.stub(uut, 'getIpfsData').resolves({})
      sandbox.stub(uut, 'displayData').returns()

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
