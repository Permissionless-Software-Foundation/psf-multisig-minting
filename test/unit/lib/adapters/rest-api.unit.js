/*
  Unit tests for the rest-api adapter library.
*/

// Public npm libraries.
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// Local libraries
const RestApi = require('../../../../src/lib/adapters/rest-api')
const { context } = require('../../../mocks/ctx-mock')

describe('#REST-API', () => {
  let sandbox
  let uut
  let ctx

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    ctx = cloneDeep(context)

    uut = new RestApi()
  })

  afterEach(() => {
    sandbox.restore()
  })

  // describe('#constructor', () => {
  //   it('should instantiate the class', () => {
  //     uut = new RestApi()
  //
  //     assert.property(uut, 'bchjs')
  //     assert.property(uut, 'restApi')
  //   })
  // })

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

  describe('apiHandler', () => {
    it('should return body data', async () => {
      ctx.request = {
        body: {
          json: 'blah'
        }
      }

      await uut.apiHandler(ctx)
    })
  })
})
