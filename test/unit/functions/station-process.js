const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../../lib/functions/station-process').handler
const event = require('../../events/station-event.json')
const S3 = require('../../../lib/helpers/s3')
const Util = require('../../../lib/helpers/util')
const Station = require('../../../lib/models/station')

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
      return Promise.resolve({})
    })
    sinon.stub(Station.prototype, 'saveToDb').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(Station.prototype, 'saveToObjects').callsFake(() => {
      return Promise.resolve({})
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
      return Promise.reject(new Error('test error'))
    }
    await Code.expect(handler(event)).to.reject()
  })
})
