/*
  Unit tests for the token-create-nft command.
*/

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs').promises

// Local libraries
const TokenCreateNft = require('../../../src/commands/token-create-nft')
const WalletCreate = require('../../../src/commands/wallet-create')
// const MockWallet = require('../../mocks/msw-mock')

const walletCreate = new WalletCreate()
const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('#token-create-group', () => {
  let uut
  let sandbox
  // let mockWallet

  before(async () => {
    await walletCreate.createWallet(filename)
  })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new TokenCreateNft()
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
        walletName: 'test123',
        tokenName: 'test',
        ticker: 'TST',
        decimals: '2',
        qty: 100,
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

    it('should throw error if token name is not supplied.', () => {
      try {
        const flags = {
          walletName: 'test123'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a name for the token with the -m flag.',
          'Expected error message.'
        )
      }
    })

    it('should throw error if token ticker is not supplied.', () => {
      try {
        const flags = {
          walletName: 'test123',
          tokenName: 'test'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a ticker for the token with the -t flag.',
          'Expected error message.'
        )
      }
    })

    it('should throw error if token ticker is not supplied.', () => {
      try {
        const flags = {
          walletName: 'test123',
          tokenName: 'test',
          ticker: 'aaa'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specifcy the SLP Group token ID.',
          'Expected error message.'
        )
      }
    })
  })

  describe('#openWallet', () => {
    it('should return an instance of the wallet', async () => {
      const flags = {
        walletName: 'test123'
      }

      const result = await uut.openWallet(flags)
      // console.log('result: ', result)

      assert.property(result, 'advancedOptions')
    })
  })

  describe('#generateTokenTx', () => {
    it('should generate a hex transaction', async () => {
      // Mock data
      const bchUtxo = {
        height: 744046,
        tx_hash: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684',
        tx_pos: 3,
        value: 577646,
        txid: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684',
        vout: 3,
        address: 'bitcoincash:qr2u4f2dmva6yvf3npkd5lquryp09qk7gs5vxl423h',
        isSlp: false,
        satoshis: 577646
      }

      const flags = {
        walletName: 'test123',
        tokenName: 'test',
        ticker: 'TST',
        tokenId: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684'
      }

      // Instantiate the wallet and bch-js
      await uut.openWallet(flags)

      // Force UTXOs:
      uut.wallet.utxos.utxoStore = {
        bchUtxos: [bchUtxo],
        slpUtxos: {
          group: {
            tokens: [{
              tokenId: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684',
              tx_hash: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684',
              tx_pos: 4,
              value: 546,
              tokenType: 129,
              utxoType: 'group',
              decimals: 0
            }]
          }
        }
      }

      const result = await uut.generateTokenTx(flags)
      // console.log('result: ', result)

      assert.include(result, '020000000')
    })

    it('should throw an error if there are no BCH UTXOs to pay for tx', async () => {
      try {
        const flags = {
          walletName: 'test123'
        }

        // Instantiate the wallet and bch-js
        await uut.openWallet(flags)

        // Force bchUtxo.
        uut.wallet.utxos.utxoStore.bchUtxos = []

        await uut.generateTokenTx(flags)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'No BCH UTXOs available to pay for transaction.')
      }
    })

    it('should work with fully-hydrated flags object', async () => {
      // Mock data
      const bchUtxo = {
        height: 744046,
        tx_hash: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684',
        tx_pos: 3,
        value: 577646,
        txid: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684',
        vout: 3,
        address: 'bitcoincash:qr2u4f2dmva6yvf3npkd5lquryp09qk7gs5vxl423h',
        isSlp: false,
        satoshis: 577646
      }

      const flags = {
        walletName: 'test123',
        tokenName: 'test',
        ticker: 'TST',
        url: 'test url',
        hash: '7a427a156fe70f83d3ccdd17e75804cc0df8c95c64ce04d256b3851385002a0b',
        tokenId: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684'
      }

      // Instantiate the wallet and bch-js
      await uut.openWallet(flags)

      // Force UTXOs:
      uut.wallet.utxos.utxoStore = {
        bchUtxos: [bchUtxo],
        slpUtxos: {
          group: {
            tokens: [{
              tokenId: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684',
              tx_hash: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684',
              tx_pos: 4,
              value: 546,
              tokenType: 129,
              utxoType: 'group',
              decimals: 0
            }]
          }
        }
      }

      const result = await uut.generateTokenTx(flags)
      // console.log('result: ', result)

      assert.include(result, '020000000')
    })

    it('should throw an error if there are no Group UTXOs', async () => {
      try {
        const flags = {
          walletName: 'test123',
          tokenName: 'test',
          ticker: 'TST',
          tokenId: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684'
        }

        // Instantiate the wallet and bch-js
        await uut.openWallet(flags)

        const bchUtxo = {
          height: 744046,
          tx_hash: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684',
          tx_pos: 3,
          value: 577646,
          txid: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684',
          vout: 3,
          address: 'bitcoincash:qr2u4f2dmva6yvf3npkd5lquryp09qk7gs5vxl423h',
          isSlp: false,
          satoshis: 577646
        }

        // Force UTXOs:
        uut.wallet.utxos.utxoStore = {
          bchUtxos: [bchUtxo],
          slpUtxos: {
            group: {
              tokens: []
            }
          }
        }

        await uut.generateTokenTx(flags)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Group token with token ID')
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
          walletName: 'test123',
          tokenName: 'test',
          ticker: 'TST',
          tokenId: '227354c9827f4e3c9ce24dd9197b314f7da8a2224f4874ca11104c8fdc58f684'
        }
      })
      sandbox.stub(uut, 'generateTokenTx').resolves('fake-hex')
      sandbox.stub(uut.walletUtil, 'broadcastTx').resolves('fake-txid')

      const result = await uut.run()

      assert.equal(result, 'fake-txid')
    })
  })
})
