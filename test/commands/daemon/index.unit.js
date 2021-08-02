/*
  Unit tests for the daemon index.js file.
*/

// Public npm libraries.
const assert = require('chai').assert
const sinon = require('sinon')

// Local libraries
const Daemon = require('../../../src/commands/daemon')

describe('#daemon', () => {
  let sandbox
  let uut

  beforeEach(async () => {
    sandbox = sinon.createSandbox()

    uut = new Daemon()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#constructor', () => {
    it('should instantiate the class', () => {
      uut = new Daemon()

      assert.property(uut, 'bchjs')
      assert.property(uut, 'restApi')
    })
  })

  // describe('#startIpfs', () => {
  //   it('should start an IPFS node', async () => {
  //     // mock dependencies.
  //     sandbox.stub(uut.)
  //   })
  // })
})
