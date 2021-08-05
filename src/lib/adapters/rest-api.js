/*
  A class library for creating a Koa REST API. This API has one endpoint,
  for accepting a JSON string and passing it on to the wallet service.

  curl -X POST http://localhost:5000/ -d '{"test": "test"}'
*/

// Public npm libraries.
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const { v4: uid } = require('uuid')
const jsonrpc = require('jsonrpc-lite')

let _this

class RestApi {
  constructor (localConfig = {}) {
    this.eventEmitter = localConfig.eventEmitter
    if (!this.eventEmitter) {
      throw new Error(
        'An instance of an EventEmitter must be passed when instantiating the RestApi library.'
      )
    }
    this.ipfsCoordAdapter = localConfig.ipfsCoordAdapter
    if (!this.ipfsCoordAdapter) {
      throw new Error(
        'An instance of ipfsCoordAdapter must be passed when instantiating the RestApi library.'
      )
    }

    // Connect the RPC handler when the event fires with new data.
    this.eventEmitter.on('rpcData', this.rpcHandler)

    // encapsulate dependencies
    this.bodyParser = bodyParser
    this.uid = uid
    this.jsonrpc = jsonrpc

    // A queue for holding RPC data that has arrived.
    this.rpcDataQueue = []

    _this = this
  }

  // This handler is triggered when RPC data comes in over IPFS.
  // Handle RPC input, and match the input to the RPC queue.
  rpcHandler (data) {
    try {
      // console.log('rest-api.js/rpcHandler() data: ', data)

      // Convert string input into an object.
      const jsonData = JSON.parse(data)

      _this.rpcDataQueue.push(jsonData)
    } catch (err) {
      console.error('Error in rest-api.js/rpcHandler(): ', err)
      // Do not throw error. This is a top-level function.
    }
  }

  // Launch the single REST API endpoint that the other app commands use to
  // broadcast JSON RPC commands to other IPFS peers.
  async startRestApi () {
    try {
      // Create a Koa instance.
      const app = new Koa()
      app.use(this.bodyParser())

      // Attach a router for the single POST endpoint.
      this.router = new Router({ prefix: '/' })
      this.router.post('/', this.apiHandler)
      app.use(this.router.routes())
      app.use(this.router.allowedMethods())

      // Start the HTTP server.
      const port = 5000
      await app.listen(port)
      console.log(`REST API started on port ${port}`)

      return app
    } catch (err) {
      console.error('Error in startRestApi()')
      throw err
    }
  }

  // Update the pointer to the ipfs-coord adapter.
  // This allows the REST API to communicate over IPFS.
  async updateIpfsCoord (adapter) {
    this.ipfsCoordAdapter = adapter
    console.log('ipfsCoordAdapter updated in rest-api.js')
  }

  // This function handles incoming REST API calls.
  async apiHandler (ctx, next) {
    // const body = ctx.request.body
    // console.log('Input: ', body)

    // Input Validation
    const sendTo = ctx.request.body.sendTo
    if (!sendTo) throw new Error('sendTo property must include an IPFS ID.')

    const rpcData = ctx.request.body.rpcData
    if (!rpcData) throw new Error('rpcData property required')

    // Generate a UUID to uniquly identify the response comming back from
    // the IPFS peer.
    const rpcId = _this.uid()
    // console.log('rpcId: ', rpcId)

    // Generate a JSON RPC command.
    const cmd = _this.jsonrpc.request(rpcId, 'bch', rpcData)
    const cmdStr = JSON.stringify(cmd)
    // console.log('cmdStr: ', cmdStr)

    // Send the RPC command to selected wallet service.
    await _this.ipfsCoordAdapter.ipfsCoord.ipfs.orbitdb.sendToDb(sendTo, cmdStr)

    // Wait for data to come back from the wallet service.
    const data = await _this.waitForRPCResponse(rpcId)

    ctx.body = data
  }

  // Returns a promise that resolves to data when the RPC response is recieved.
  async waitForRPCResponse (rpcId) {
    try {
      // Initialize variables for tracking the return data.
      let dataFound = false
      let cnt = 0
      let data = {
        success: false,
        message: 'request timed out',
        data: ''
      }

      // Loop that waits for a response from the service provider.
      do {
        for (let i = 0; i < this.rpcDataQueue.length; i++) {
          const rawData = this.rpcDataQueue[i]
          // console.log(`rawData: ${JSON.stringify(rawData, null, 2)}`)

          if (rawData.id === rpcId) {
            dataFound = true
            // console.log('data was found in the queue')

            data = rawData.result.value

            // Remove the data from the queue
            this.rpcDataQueue.splice(i, 1)

            break
          }
        }

        // Wait between loops.
        // await this.sleep(1000)
        await this.ipfsCoordAdapter.bchjs.Util.sleep(1000)

        cnt++

        // Exit if data was returned, or the window for a response expires.
      } while (!dataFound && cnt < 10)
      // console.log(`dataFound: ${dataFound}, cnt: ${cnt}`)

      return data
    } catch (err) {
      console.error('Error in waitForRPCResponse()')
      throw err
    }
  }
}

module.exports = RestApi
