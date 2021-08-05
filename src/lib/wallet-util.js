/*
  Utility library for working with wallet files.
*/

const fs = require('fs').promises
const BCHJS = require('@psf/bch-js')

let _this // Global variable points at instance of this Class.

class WalletUtil {
  constructor (localConfig = {}) {
    this.fs = fs
    this.bchjs = new BCHJS()

    _this = this
  }

  // Save the wallet data into a .json text file.
  async saveWallet (filename, walletData) {
    await _this.fs.writeFile(filename, JSON.stringify(walletData, null, 2))

    return true
  }

  // Generates an array of HD addresses.
  // Address are generated from index to limit.
  // e.g. generateAddress(walletData, 20, 10)
  // will generate a 10-element array of addresses from index 20 to 29
  async generateAddress (walletData, index, limit) {
    // console.log(`walletData: ${JSON.stringify(walletData, null, 2)}`)

    if (!walletData.mnemonic) throw new Error('mnemonic is undefined!')

    // root seed buffer
    const rootSeed = await this.bchjs.Mnemonic.toSeed(walletData.mnemonic)

    // master HDNode
    let masterHDNode
    if (walletData.network === 'testnet') {
      masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed, 'testnet')
    } else masterHDNode = this.bchjs.HDNode.fromSeed(rootSeed)

    // HDNode of BIP44 account
    const account = this.bchjs.HDNode.derivePath(
      masterHDNode,
      `m/44'/${walletData.derivation}'/0'`
    )

    // Empty array for collecting generated addresses
    const bulkAddresses = []

    // Generate the addresses.
    for (let i = index; i < index + limit; i++) {
      // derive an external change address HDNode
      const change = this.bchjs.HDNode.derivePath(account, `0/${i}`)

      // get the cash address
      const newAddress = this.bchjs.HDNode.toCashAddress(change)
      // const legacy = this.bchjs.HDNode.toLegacyAddress(change)

      // push address into array
      bulkAddresses.push(newAddress)
    }

    return bulkAddresses
  }
}

module.exports = WalletUtil
