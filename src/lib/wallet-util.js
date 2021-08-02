/*
  Utility library for working with wallet files.
*/

const fs = require('fs').promises

let _this // Global variable points at instance of this Class.

class WalletUtil {
  constructor (localConfig = {}) {
    this.fs = fs

    _this = this
  }

  async saveWallet (filename, walletData) {
    await _this.fs.writeFile(filename, JSON.stringify(walletData, null, 2))

    return true
  }
}

module.exports = WalletUtil
