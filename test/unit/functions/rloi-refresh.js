const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../../lib/functions/rloi-refresh').handler
const station = require('../../../lib/models/station')
const rloi = require('../../../lib/models/rloi')
const { Client } = require('pg')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('rloi Refresh', () => {
  lab.beforeEach(async () => {
    // Mock database call
    sinon.stub(station, 'refreshStationMview').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(rloi, 'deleteOld').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(Client.prototype, 'connect').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(Client.prototype, 'query').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(Client.prototype, 'end').callsFake(() => {
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
    station.refreshStationMview.restore()
    sinon.stub(station, 'refreshStationMview').callsFake(() => {
      return Promise.reject(new Error('test error'))
    })
    await Code.expect(handler()).to.reject()
  })
})
