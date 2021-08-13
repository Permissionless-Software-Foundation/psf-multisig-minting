/*
  Clean Architecture Adapter for ipfs-coord.
  This library deals with ipfs-coord library so that the apps business logic
  doesn't need to have any specific knowledge of the library.
*/

// Global npm libraries
const IpfsCoord = require('ipfs-coord')
const semver = require('semver')
const Conf = require('conf')

// The minimum version of ipfs-bch-wallet-service that this wallet can work with.
const MIN_BCH_WALLET_VERSION = '1.9.0'
const WALLET_PROTOCOL = 'bch-wallet'

let _this

class IpfsCoordAdapter {
  constructor(localConfig = {}) {
    // Dependency injection.
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'Instance of IPFS must be passed when instantiating ipfs-coord adapter.',
      )
    }
    this.bchjs = localConfig.bchjs
    if (!this.bchjs) {
      throw new Error(
        'Instance of bch-js must be passed when instantiating ipfs-coord adapter.',
      )
    }
    this.eventEmitter = localConfig.eventEmitter
    if (!this.eventEmitter) {
      throw new Error(
        'An instance of an EventEmitter must be passed when instantiating the ipfs-coord adapter.',
      )
    }

    // Encapsulate dependencies
    this.IpfsCoord = IpfsCoord
    this.ipfsCoord = {}
    this.semver = semver
    this.conf = new Conf()
    // this.rpc = new JSONRPC()
    // this.config = config

    // Properties of this class instance.
    this.isReady = false

    // Periodically poll services for available wallet service providers.
    setInterval(this.pollForServices, 10000)

    // State object. TODO: Make this more robust.
    this.state = {
      serviceProviders: [],
      selectedServiceProvider: '',
    }

    _this = this
  }

  // Start the IPFS node.
  async start(localConfig = {}) {
    this.ipfsCoord = new this.IpfsCoord({
      ipfs: this.ipfs,
      type: 'node.js',
      // type: 'browser',
      bchjs: this.bchjs,
      privateLog: this.peerInputHandler, // Default to console.log
      isCircuitRelay: false,
      apiInfo: '',
      announceJsonLd: announceJsonLd,
    })

    // Wait for the ipfs-coord library to signal that it is ready.
    await this.ipfsCoord.ipfs.start()
    // await this.ipfsCoord.isReady()

    // Signal that this adapter is ready.
    this.isReady = true

    return this.isReady
  }

  // Expects router to be a function, which handles the input data from the
  // pubsub channel. It's expected to be capable of routing JSON RPC commands.
  attachRPCRouter(router) {
    try {
      _this.ipfsCoord.privateLog = router
      _this.ipfsCoord.ipfs.orbitdb.privateLog = router
    } catch (err) {
      console.error('Error in attachRPCRouter()')
      throw err
    }
  }

  // Poll the ipfs-coord coordination channel for available service providers.
  pollForServices() {
    try {
      // An array of IPFS IDs of other nodes in the coordination pubsub channel.
      const peers = _this.ipfsCoord.ipfs.peers.state.peerList
      // console.log(`peers: ${JSON.stringify(peers, null, 2)}`)

      // Array of objects. Each object is the IPFS ID of the peer and contains
      // data about that peer.
      const peerData = _this.ipfsCoord.ipfs.peers.state.peers
      // console.log(`peerData: ${JSON.stringify(peerData, null, 2)}`)

      for (let i = 0; i < peers.length; i++) {
        const thisPeer = peers[i]
        const thisPeerData = peerData[thisPeer]

        // Create a 'fingerprint' that defines the wallet service.
        const protocol = thisPeerData.jsonLd.protocol
        const version = thisPeerData.jsonLd.version

        let versionMatches = false
        if (version) {
          versionMatches = _this.semver.gt(version, MIN_BCH_WALLET_VERSION)
        }

        // Ignore any peers that don't match the fingerprint for a BCH wallet
        // service.
        if (protocol && protocol.includes(WALLET_PROTOCOL) && versionMatches) {
          // console.log('Matching peer: ', thisPeerData)

          // Temporary business logic.
          // Use the first available wallet service detected.
          if (_this.state.serviceProviders.length === 0) {
            _this.state.selectedServiceProvider = thisPeer

            // Persist the config setting, so it can be used by other commands.
            _this.conf.set('selectedService', thisPeer)
            console.log(`BCH wallet service selected: ${thisPeer}`)
          }

          // Add the peer to the list of serviceProviders.
          _this.state.serviceProviders.push(thisPeer)
        }
      }
    } catch (err) {
      console.error('Error in pollForServices(): ', err)
      // Do not throw error. This is a top-level function.
    }
  }

  // This method handles input coming in from other IPFS peers.
  // It passes the data on to the REST API library by emitting an event.
  peerInputHandler(data) {
    try {
      // console.log('peerInputHandler triggered with this data: ', data)

      _this.eventEmitter.emit('rpcData', data)
    } catch (err) {
      console.error('Error in ipfs-coord.js/peerInputHandler(): ', err)
      // Do not throw error. This is a top-level function.
    }
  }
}

// Create a random number to use in the name of this IPFS n ode.
const randNum = Math.floor(Math.random() * 10000)

const announceJsonLd = {
  '@context': 'https://schema.org/',
  '@type': 'Person',
  name: `wallet-consumer-${randNum}`,
  description: 'A consumer of BCH wallet services',
}

module.exports = IpfsCoordAdapter
