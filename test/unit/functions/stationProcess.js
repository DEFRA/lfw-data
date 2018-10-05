const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const handler = require('../../../lib/functions/stationProcess').handler
const event = require('../../events/stationEvent.json')
let S3 = require('../../../lib/helpers/s3')
let Util = require('../../../lib/helpers/util')
let Station = require('../../../lib/models/station')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('station processing', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(S3.prototype, 'getObject').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({
          Body: 'test'
        })
      })
    })
    sinon.stub(Util.prototype, 'parseCsv').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
    sinon.stub(Station.prototype, 'saveToDb').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
    sinon.stub(Station.prototype, 'saveToObjects').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
  })
  lab.afterEach(() => {
    // restore sinon sandbox
    sinon.restore()
  })
  lab.test('station process', async () => {
    await handler(event)
  })

  lab.test('station process S3 error', async () => {
    S3.prototype.getObject = () => {
      return new Promise((resolve, reject) => {
        reject(new Error('test error'))
      })
    }
    try {
      await handler(event)
      Code.expect(true).to.equal(false)
    } catch (err) {
      Code.expect(err).to.be.an.error()
    }
  })
})
