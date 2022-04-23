/*
  Mint new tokens from a multisig wallet.

  This script combines the spend files and uses them to spend the minting baton
  UTXO, and thereby mint new tokens. The minting baton is transfered to a
  new multisig wallet.

  Note: All public keys used to create the multisig wallet is required, in order
  to re-create the multisig Script. This is off-chain data that needs to be
  be saved.
*/

// Public npm libraries
const { Command, flags } = require('@oclif/command')
const bitcore = require('bitcore-lib-cash')
const BCHJS = require('@psf/bch-js')

// Local libraries
const MsgRead = require('./msg-read')
const P2WDBWrite = require('./p2wdb-write')
const P2WDBRead = require('./p2wdb-read')

class MSMint extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.bitcore = bitcore
    this.msgRead = new MsgRead()
    this.bchjs = new BCHJS()
    this.p2wdbWrite = new P2WDBWrite()
    this.p2wdbRead = new P2WDBRead()

    this.p2shAddr = 'bitcoincash:pptlq79p0r7q52f7n2kr367nhs3g60gq3g6xucu3da'
  }

  async run () {
    try {
      const { flags } = this.parse(MSMint)

      // Validate input flags
      this.validateFlags(flags)

      // Get old multisig wallet data from P2WDB.
      const msWalletData = await this.getMsWalletData(flags)
      console.log(`msWalletData: ${JSON.stringify(msWalletData, null, 2)}`)

      // Collect the spending files sumbmitted by the other signers.
      const spendObjs = await this.gatherSpendFiles(flags)
      console.log('spendObjs: ', spendObjs)

      // Generate a new multisig wallet and upload the public data to the P2WDB.
      const { cid, newWalletData } = await this.createNewWallet(spendObjs, flags)
      console.log(`New wallet created and uploaded to P2WDB. CID: ${cid}`)
      console.log(`https://p2wdb.fullstack.cash/entry/hash/${cid}`)

      const hex = await this.generateTx(spendObjs, newWalletData)
      console.log('hex: ', hex)

      return true
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  // Get data about the existing multisig wallet from the P2WDB.
  async getMsWalletData (flags) {
    try {
      const readFlag = { hash: flags.walletCid }

      // Get raw data from the P2WDB.
      const data = await this.p2wdbRead.readP2WDB(readFlag)

      // Parse the raw JSON data
      const msWalletData = JSON.parse(data.value.data)

      return msWalletData
    } catch (err) {
      console.error('Error in getMsWalletData()')
      throw err
    }
  }

  // Create a new P2SH wallet to send the minting baton to once it's spent. The
  // information used to create the P2SH wallet is written to the P2WDB.
  async createNewWallet (spendObjs, flags) {
    try {
      // Collect all public keys and addresses
      const pubKeys = []
      for (let i = 0; i < spendObjs.length; i++) {
        const entry = {
          publicKey: spendObjs[i].newPublicKey,
          addr: spendObjs[i].newAddress
        }

        pubKeys.push(entry)
      }

      if (pubKeys.length <= 2) {
        throw new Error('Two or less signers found. Can not continue. Must have a minimum of 3 signers.')
      }

      // Calculate the required keys. This is half the number of signers
      // participating in the current minting round. e.g. 6 people participating
      // will create a 3-of-6 wallet.
      let requiredSigs = Math.floor(pubKeys.length / 2)

      // Ensure that at least 2-of-N signatures are required.
      if (requiredSigs <= 1) requiredSigs = 2

      const bitcorePubKeys = pubKeys.map(x => new this.bitcore.PublicKey(x.publicKey))

      // Generate the multisignature wallet address.
      const p2shAddr = new this.bitcore.Address(bitcorePubKeys, requiredSigs)

      // Collect data for writing to the P2WDB.
      const newWalletData = {
        pubKeys,
        requiredSigs,
        address: p2shAddr.toString()
      }
      console.log(`Writing this data to the P2WDB: ${JSON.stringify(newWalletData, null, 2)}`)

      // Add the data to the flags variable.
      flags.data = newWalletData
      flags.appId = 'mint-test-001'

      // Leverage the p2wdb-write command to write the data to the P2WDB.
      await this.p2wdbWrite.instantiateWrite(flags)
      const cid = await this.p2wdbWrite.writeData(flags)

      return { cid, newWalletData }
    } catch (err) {
      console.error('Error in createnewWallet()')
      throw err
    }
  }

  // Generate a transaction for spending from the multisig wallet.
  async generateTx (spendObjs, newWalletData) {
    try {
      // Regenerate the multisig Script
      const allPublicKeys = []
      for (let i = 0; i < spendObjs.length; i++) {
        let thisPubKey = spendObjs[i].currentPublicKey
        thisPubKey = new this.bitcore.PublicKey(thisPubKey)
        allPublicKeys.push(thisPubKey)
      }
      const requiredSignatures = 2
      const address = new this.bitcore.Address(allPublicKeys, requiredSignatures)
      console.log(`address: ${address.toString()}`)

      // Collect private keys
      const privateKeys = []
      for (let i = 0; i < requiredSignatures; i++) {
        const thisPrivKey = spendObjs[i].currentPrivateKey
        privateKeys.push(new this.bitcore.PrivateKey(thisPrivKey))
      }

      // Get the UTXO
      const utxos = await this.bchjs.Utxo.get(address.toString())
      const utxo = utxos.bchUtxos[0]

      // Add properties to the UTXO expected by bitcore
      utxo.outputIndex = utxo.vout
      utxo.script = new this.bitcore.Script(address).toHex()
      utxo.satoshis = utxo.value
      console.log(`utxo: ${JSON.stringify(utxo, null, 2)}`)

      // Generate the transaction object.
      // Temporary recieve address.
      const txObj = new this.bitcore.Transaction()
        .from(utxo, allPublicKeys, requiredSignatures)
        .to('bitcoincash:qqk5hmgsjxyylp4dn63397ar7rssf5sl3gcrj5tgz8', 1500)
        .feePerByte(1)
        .change(address)
        .sign(privateKeys)

      // Serialize the transaction to a hex string, ready to broadcast to the network.
      // const txHex = txObj.toString()
      let txHex = txObj.toBuffer()
      txHex = txHex.toString('hex')
      console.log('hex: ', txHex)

      return txHex
    } catch (err) {
      console.error('Error in generateTx()')
      throw err
    }
  }

  // Retrieve the spend files from different messages. This function returns
  // an array of objects, where each element is the contents of a spend file.
  async gatherSpendFiles (flags) {
    try {
      const txs = flags.txs.split(',')
      // console.log('txs: ', txs)

      await this.msgRead.instanceLibs({ name: flags.name })

      const spendFiles = []

      // Loop through each transaction.
      for (let i = 0; i < txs.length; i++) {
        const msgFlags = {
          name: flags.name,
          txid: txs[i]
        }

        const msg = await this.msgRead.msgRead(msgFlags)
        // console.log('msg: ', msg)

        const spendFile = JSON.parse(msg)
        // console.log('spendFile: ', spendFile)

        spendFiles.push(spendFile)
      }

      return spendFiles
    } catch (err) {
      console.error('Error in gatherSpendFiles()')
      throw err
    }
  }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const name = flags.name
    if (!name || name === '') {
      throw new Error('You must specify a wallet with the -n flag.')
    }

    const txs = flags.txs
    if (!txs || txs === '') {
      throw new Error('You must specify a comma-separated list of message txs with the -t flag.')
    }

    return true
  }
}

MSMint.description = `Mint new tokens from a multisig wallet.

This command retrieves spend files from several message transactions. It then
combines those spend files and attempts to mint new tokens from the multisig
wallet containing the minting baton. The minting baton is transfered to a new
multisig wallet generated from the spend files.
`

MSMint.flags = {
  name: flags.string({ char: 'n', description: 'Name of current wallet' }),
  txs: flags.string({ char: 't', description: 'comma-separate list of TXIDs pointing to spend files' }),
  walletCid: flags.string({ char: 'w', description: 'P2WDB CID containing information about the multisig wallet' })
}

module.exports = MSMint
