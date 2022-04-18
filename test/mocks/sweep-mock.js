/*
  This is a mocked Class library to replace bch-sweep-lib in tests.
*/

class BchTokenSweepMock {
  async populateObjectFromNetwork () {
    return {}
  }

  async sweepTo () {
    return 'fake-hex'
  }
}

module.exports = BchTokenSweepMock
