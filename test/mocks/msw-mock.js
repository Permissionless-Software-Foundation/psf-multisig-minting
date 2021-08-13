/*
  A mock file for minimal-slp-wallet
*/

class BchWallet {
  constructor () {
    this.walletInfoPromise = true
    this.walletInfo = {
      mnemonic:
        'rebel congress piece seat virtual tongue curious leader glass cute either moral',
      privateKey: 'L1fqtLVmksSdUZPcMgpUGMkBmMYGjJQe8dbqhkD8s16eBKCYTYpH',
      publicKey:
        '02acad5d4f1ad0c03e016639a98d8beebb3939e0e29529dcab916dab3b23c47e6f',
      cashAddress: 'bitcoincash:qp65erjld4jetgzwgvh6sxkyay97cl6gfyxue46uey',
      address: 'bitcoincash:qp65erjld4jetgzwgvh6sxkyay97cl6gfyxue46uey',
      slpAddress: 'simpleledger:qp65erjld4jetgzwgvh6sxkyay97cl6gfy28jw0u86',
      legacyAddress: '1BhDmfBRALFVZ4zryxDXNz8xJMxadyZD7k',
      hdPath: "m/44'/245'/0'/0/0",
      description: ''
    }
  }
}

module.exports = BchWallet
