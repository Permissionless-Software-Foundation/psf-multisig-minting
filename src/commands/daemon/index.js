// Public npm libraries
const BCHJS = require('@psf/bch-js')
const IpfsCoord = require('ipfs-coord')
const IPFS = require('ipfs')
const {Command, flags} = require('@oclif/command')

// Local libraries.
const RestApi = require('./rest-api')

class Daemon extends Command {
  constructor(argv, config) {
    super(argv, config)
    // _this = this

    // Encapsulate dependencies.
    this.bchjs = new BCHJS()
    this.restApi = new RestApi()
  }

  async startIpfs() {
    try {
      // Start the IPFS node.
      this.ipfs = await IPFS.create()

      // Prevent scanning of local network.
      await this.ipfs.config.profiles.apply('server')

      // Start ipfs-coord.
      this.ipfsCoord = new IpfsCoord({
        ipfs: this.ipfs,
        type: 'node.js',
        // type: 'browser',
        bchjs: this.bchjs,
        privateLog: this.rpcHandler, // Default to console.log
        isCircuitRelay: false,
        apiInfo: 'none',
        announceJsonLd: announceJsonLd,
      })
      await this.ipfsCoord.ipfs.start()
      await this.ipfsCoord.isReady()

      // Wait to let ipfs-coord connect to subnet peers.
      // await this.bchjs.Util.sleep(30000)

      await this.restApi.startRestApi()
    } catch (err) {
      console.error('Error in startIpfs().')
      throw err
    }
  }

  // This handler function recieves data from other ipfs-coord peers.
  rpcHandler(inData) {
    try {
      console.log('Data recieved by rpcHandler: ', inData)

      const jsonData = JSON.parse(inData)
      console.log('jsonData: ', jsonData)

      // _this.eventEmitter.emit('rpcData', jsonData)
    } catch (err) {
      console.error('Error in rpcHandler: ', err)
      // Do not throw an error. This is a top-level function.
    }
  }

  // async startRestApi() {
  //   try {
  //
  //   } catch (err) {
  //     console.error('Error in startRestApi(): ', err)
  //     throw err
  //   }
  // }

  async run() {
    const {flags} = this.parse(Daemon)
    const name = flags.name || 'world'
    this.log(`hello ${name} from ./src/commands/hello.js`)

    // Connect to the IPFS network.
    await this.startIpfs()

    // Create a REST endpoint to accept input from the other commands in this app.
    // await this.startRestApi()
  }
}

Daemon.description = `Start a daemon connection to the wallet service.
This command will start a 'daemon' service, which is a IPFS node that will
connect to a BCH wallet service over IPFS. It will also start a REST API server,
which is how the other commands in this app will communicate with the BCH wallet
service.
`

Daemon.flags = {
  name: flags.string({char: 'n', description: 'name to print'}),
}

// Create a random number to use in the name of this IPFS n ode.
const randNum = Math.floor(Math.random() * 10000)

const announceJsonLd = {
  '@context': 'https://schema.org/',
  '@type': 'Person',
  name: `wallet-consumer-${randNum}`,
  description: 'A consumer of BCH wallet services',
}

module.exports = Daemon
