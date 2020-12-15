const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../../lib/functions/station-process').handler
const event = require('../../events/station-event.json')
const s3 = require('../../../lib/helpers/s3')
const util = require('../../../lib/helpers/util')
const station = require('../../../lib/models/station')
const { Client } = require('pg')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('station processing', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(s3, 'getObject').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({
          Body: 'test'
        })
      })
    })
    sinon.stub(util, 'parseCsv').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(station, 'saveToDb').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(station, 'saveToObjects').callsFake(() => {
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
    // restore sinon sandbox
    sinon.restore()
  })
  lab.test('station process', async () => {
    await handler(event)
  })

  lab.test('station process S3 error', async () => {
    s3.getObject = () => {
      return Promise.reject(new Error('test error'))
    }
    await Code.expect(handler(event)).to.reject()
  })
})
