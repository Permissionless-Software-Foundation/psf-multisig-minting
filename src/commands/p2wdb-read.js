/*
  Read data from the P2WDB.
*/

// Public NPM libraries
const Conf = require('conf')
const { Read } = require('p2wdb/index')

// Local libraries
const WalletUtil = require('../lib/wallet-util')

const { Command, flags } = require('@oclif/command')

class P2WDBRead extends Command {
  constructor (argv, config) {
    super(argv, config)

    // Encapsulate dependencies.
    this.conf = new Conf()
    this.walletUtil = new WalletUtil()

    // Instantiate the read library.
    const p2wdbServer = this.walletUtil.getP2wdbServer()
    this.read = new Read({ serverURL: p2wdbServer })
  }

  async run () {
    try {
      const { flags } = this.parse(P2WDBRead)

      // Validate input flags
      this.validateFlags(flags)

      const result = await this.readP2WDB(flags)

      console.log(result)

      return result
    } catch (err) {
      console.log('Error in p2wdb-read.js/run(): ', err.message)

      return 0
    }
  }

  async readP2WDB (flags) {
    try {
      const result = await this.read.getByHash(flags.hash)

      return result
    } catch (err) {
      console.error('Error in readP2WDB()')
      throw err
    }
  }

  // async readP2WDB (flags) {
  //   try {
  //     const p2wdbServer = this.conf.get('p2wdbServer')
  //     console.log(`p2wdbServer: ${p2wdbServer}`)
  //
  //     // Display the raw entry.
  //     const result = await axios.post(`${p2wdbServer}/p2wdb/entryFromHash`, {
  //       hash: flags.hash
  //     })
  //     console.log(`${JSON.stringify(result.data.data, null, 2)}`)
  //
  //     // Attempt to parse the data payload.
  //     try {
  //       const data = JSON.parse(result.data.data.data.value.data)
  //       console.log(`\nvalue.data: ${JSON.stringify(data, null, 2)}\n`)
  //     } catch (err) {
  //       /* exit quietly. */
  //       // console.log(err)
  //     }
  //   } catch (err) {
  //     console.error('Error in readP2WDB()')
  //     throw err
  //   }
  // }

  // Validate the proper flags are passed in.
  validateFlags (flags) {
    // Exit if wallet not specified.
    const hash = flags.hash
    if (!hash || hash === '') {
      throw new Error('You must specify a record hash with the -h flag.')
    }

    return true
  }
}

P2WDBRead.description = 'Read an entry from the P2WDB'

P2WDBRead.flags = {
  hash: flags.string({
    char: 'h',
    description: 'Hash CID representing P2WDB entry'
  })
}

module.exports = P2WDBRead
