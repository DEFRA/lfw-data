const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../../lib/functions/rloi-refresh').handler
const Station = require('../../../lib/models/station')
const Rloi = require('../../../lib/models/rloi')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('rloi Refresh', () => {
  lab.beforeEach(async () => {
    // Mock database call
    sinon.stub(Station.prototype, 'refreshStationMview').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(Rloi.prototype, 'deleteOld').callsFake(() => {
      return Promise.resolve({})
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('rloi Refresh', async () => {
    await handler()
  })

  lab.test('rloi Refresh error', async () => {
    Station.prototype.refreshStationMview.restore()
    sinon.stub(Station.prototype, 'refreshStationMview').callsFake(() => {
      return Promise.reject(new Error('test error'))
    })
    await Code.expect(handler()).to.reject()
  })
})
