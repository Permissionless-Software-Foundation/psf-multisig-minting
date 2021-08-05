/*
  Unit tests for the rest-api adapter library.
*/

// Public npm libraries.
const assert = require('chai').assert
const sinon = require('sinon')
// const cloneDeep = require('lodash.clonedeep')
const EventEmitter = require('events')
const BCHJS = require('@psf/bch-js')

// Local libraries
const RestApi = require('../../../../src/lib/adapters/rest-api')
// const { context } = require('../../../mocks/ctx-mock')
const IpfsCoordAdapter = require('../../../../src/lib/adapters/ipfs-coord')
const IPFSMock = require('../../../mocks/ipfs-mock')

describe('#REST-API', () => {
  let sandbox
  let uut
  // let ctx

  beforeEach(async () => {
    const eventEmitter = new EventEmitter()
    const ipfs = IPFSMock.create()
    const bchjs = new BCHJS()
    const ipfsCoordAdapter = new IpfsCoordAdapter({ ipfs, bchjs, eventEmitter })

    sandbox = sinon.createSandbox()

    // ctx = cloneDeep(context)

    uut = new RestApi({ eventEmitter, ipfsCoordAdapter })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#constructor', () => {
    it('should throw an error if EventEmitter instance is not included', () => {
      try {
        // const ipfs = IPFSMock.create()
        // const bchjs = new BCHJS()
        // uut = new IPFSCoordAdapter({ipfs, bchjs})

        uut = new RestApi()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of an EventEmitter must be passed when instantiating the RestApi library.'
        )
      }
    })

    it('should throw an error if ipfs-coord adapter instance is not included', () => {
      try {
        const eventEmitter = new EventEmitter()

        uut = new RestApi({ eventEmitter })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of ipfsCoordAdapter must be passed when instantiating the RestApi library.'
        )
      }
    })
  })

  describe('#startRestApi', () => {
    it('should start and return a Koa REST API server', async () => {
      const app = await uut.startRestApi()
      // console.log('app: ', app)

      assert.isOk(app, 'Not throwing an error is a pass')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut, 'bodyParser').throws(new Error('test error'))

        await uut.startRestApi()

        assert.fail('Unexpected code path.')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  // describe('#apiHandler', () => {
  //   it('should return body data', async () => {
  //     ctx.request = {
  //       body: {
  //         json: 'blah',
  //       },
  //     }
  //
  //     await uut.apiHandler(ctx)
  //   })
  // })
})
