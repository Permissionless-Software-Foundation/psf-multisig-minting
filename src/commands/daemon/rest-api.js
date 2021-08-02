/*
  A class library for creating a Koa REST API. This API has one endpoint,
  for accepting a JSON string and passing it on to the wallet service.

  curl -X POST http://localhost:5000/ -d '{"test": "test"}'
*/

// Public npm libraries.
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

class RestApi {
  // constructor () {}

  async startRestApi () {
    try {
      // Create a Koa instance.
      const app = new Koa()
      app.use(bodyParser())

      this.router = new Router({ prefix: '/' })
      this.router.post('/', this.apiHandler)
      app.use(this.router.routes())
      app.use(this.router.allowedMethods())

      const port = 5000
      await app.listen(port)
      console.log(`REST API started on port ${port}`)

      return app
    } catch (err) {
      console.error('Error in startRestApi(): ', err)
      throw err
    }
  }

  async apiHandler (ctx, next) {
    const body = ctx.request.body
    console.log('Input: ', body)

    ctx.body = {
      success: true
    }
  }
}

module.exports = RestApi
