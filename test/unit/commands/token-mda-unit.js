/*
  Unit tests for the token-tx-history command
*/

// Global npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const fs = require('fs').promises

// Local libraries
const TokenMdaTx = require('../../../src/commands/token-mda-tx')
const WalletCreate = require('../../../src/commands/wallet-create')

const walletCreate = new WalletCreate()
const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('#token-info', () => {
  let uut
  let sandbox

  before(async () => {
    await walletCreate.createWallet(filename)
  })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new TokenMdaTx()
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
        walletName: 'abc123',
        mda: 'address'
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

    it('should throw error if MDA is not supplied.', () => {
      try {
        const flags = {
          walletName: 'abc123'
        }
        uut.validateFlags(flags)
      } catch (err) {
        assert.include(
          err.message,
          'You must specify a mutable data address with the -a flag.',
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

  describe('#generateMdaTx', () => {
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
        mda: 'bitcoincash:qr2u4f2dmva6yvf3npkd5lquryp09qk7gs5vxl423h'
      }

      // Instantiate the wallet and bch-js
      await uut.openWallet(flags)

      // Force UTXOs:
      uut.wallet.utxos.utxoStore = {
        bchUtxos: [bchUtxo],
        slpUtxos: {
          type1: {
            mintBatons: []
          },
          group: {
            mintBatons: []
          }
        }
      }

      const result = await uut.generateMdaTx(flags)
      // console.log('result: ', result)

      assert.include(result, '020000000')
    })

    it('should throw an error if there are no BCH UTXOs to pay for tx', async () => {
      try {
        const flags = {
          walletName: 'test123',
          mda: 'abc123'
        }

        // Instantiate the wallet and bch-js
        await uut.openWallet(flags)

        // Force bchUtxo.
        uut.wallet.utxos.utxoStore.bchUtxos = []

        await uut.generateMdaTx(flags)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'No BCH UTXOs available to pay for transaction.')
      }
    })
  })

  // describe('#getTxHistory', () => {
  //   it('should get token data', async () => {
  //     // Mock wallet library
  //     const BchWallet = class BchWallet {
  //       constructor () {
  //         this.ar = {
  //           getTokenData: () => {
  //             return {
  //               genesisData: {
  //                 txs: []
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //     uut.BchWallet = BchWallet
  //
  //     const flags = {
  //       tokenId: 'abc'
  //     }
  //
  //     const result = await uut.getTxHistory(flags)
  //     // console.log(result)
  //
  //     assert.isArray(result)
  //   })
  // })

  describe('#displayData', () => {
    it('should display the final data', () => {
      const flags = {
        mda: 'address'
      }

      const result = uut.displayData(flags, 'abc123')

      assert.equal(result, true)
    })
  })

  describe('#run', () => {
    it('should execute the command', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'parse').returns({ flags: { tokenId: 'a' } })
      sandbox.stub(uut, 'validateFlags').returns(true)
      sandbox.stub(uut, 'openWallet').resolves()
      sandbox.stub(uut, 'generateMdaTx').resolves({})
      sandbox.stub(uut.walletUtil, 'broadcastTx').resolves('fake-txid')
      sandbox.stub(uut, 'displayData').resolves()

      const result = await uut.run()

      assert.equal(result, 'fake-txid')
    })

    it('should return 0 and display error.message on empty flags', async () => {
      sandbox.stub(uut, 'parse').returns({ flags: {} })

      const result = await uut.run()

      assert.equal(result, 0)
    })
  })
})
