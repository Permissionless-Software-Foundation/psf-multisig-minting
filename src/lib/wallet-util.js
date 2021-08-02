/*
  Utility library for working with wallet files.
*/

const fs = require('fs')

let _this // Global variable points at instance of this Class.

class WalletUtil {
  constructor(localConfig = {}) {
    this.fs = fs

    _this = this
  }

  // Save a wallet to a file.
  saveWallet(filename, walletData) {
    return new Promise((resolve, reject) => {
      _this.fs.writeFile(
        filename,
        JSON.stringify(walletData, null, 2),
        function (err) {
          if (err) return reject(console.error(err))

          // console.log(`${name}.json written successfully.`)
          return resolve()
        },
      )
    })
  }
}

module.exports = WalletUtil
