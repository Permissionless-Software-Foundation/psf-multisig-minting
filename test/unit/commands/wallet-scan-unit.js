/*
  Unit tests for the wallet-scan command.
*/

'use strict'

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const BchWallet = require('minimal-slp-wallet/index')

// Local libraries
const WalletScan = require('../../../src/commands/wallet-scan')

// const filename = `${__dirname.toString()}/../../../.wallets/test123.json`

describe('wallet-balances', () => {
  let uut
  let sandbox
  let bchjs, bchWallet

  before(async () => {
    // Initialize minimal-slp-wallet
    const advancedConfig = {
      interface: 'consumer-api',
      noUpdate: true
    }
    bchWallet = new BchWallet(undefined, advancedConfig)
    await bchWallet.walletInfoPromise
    bchjs = bchWallet.bchjs
    // console.log('bchjs: ', bchjs)
  })

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new WalletScan()
    uut.bchWallet = bchWallet
    uut.bchjs = bchjs
  })

  afterEach(() => {
    sandbox.restore()
  })

  // after(async () => {
  //   await fs.rm(filename)
  // })

  describe('#deriveAddress', () => {
    it('should accurately derive addresses on a 145 derivation path.', async () => {
      const mnemonic = 'assist field wrist ridge violin visa mango minor vibrant this scorpion asthma'

      // Initialize the HD wallet 'node'
      const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)
      const masterHDNode = bchjs.HDNode.fromSeed(rootSeed)

      const derivationPath = "m/44'/145'/0'/0/3"

      const result = uut.deriveAddress(masterHDNode, derivationPath)

      assert.equal(result, 'bitcoincash:qp9n96echpztmrqdmxsx4ksp3rqmxu73qqv2y74u9e')
    })

    it('should accurately derive addresses on the 245 derivation path.', async () => {
      const mnemonic = 'assist field wrist ridge violin visa mango minor vibrant this scorpion asthma'

      // Initialize the HD wallet 'node'
      const rootSeed = await bchjs.Mnemonic.toSeed(mnemonic)
      const masterHDNode = bchjs.HDNode.fromSeed(rootSeed)

      const derivationPath = "m/44'/245'/0'/0/3"

      const result = uut.deriveAddress(masterHDNode, derivationPath)

      assert.equal(result, 'bitcoincash:qrjne8fhaxk8llvaf9ee2schf5llp8w9gg6rvqla9z')
    })
  })
})
