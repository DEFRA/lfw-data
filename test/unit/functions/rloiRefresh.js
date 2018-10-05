const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const handler = require('../../../lib/functions/rloiRefresh').handler
// let Db = require('../../../lib/helpers/db')

const Station = require('../../../lib/models/station')
const Rloi = require('../../../lib/models/rloi')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('rloi Refresh', () => {
  lab.beforeEach(async () => {
    // Mock database call
    sinon.stub(Station.prototype, 'refreshStationMview').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
    sinon.stub(Rloi.prototype, 'deleteOld').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
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
      return new Promise((resolve, reject) => {
        reject(new Error('test error'))
      })
    })
    try {
      await handler()
    } catch (err) {
      Code.expect(err).to.be.an.error()
    }
  })
})
