const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../../lib/functions/fwis-process').handler
const event = require('../../events/fwis-event.json')
const wreck = require('../../../lib/helpers/wreck')
const fwis = require('../../../lib/models/fwis')
const { Client } = require('pg')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('fwis processing', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(wreck, 'request').callsFake(() => {
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
    sinon.stub(fwis, 'save').callsFake(() => {
      return Promise.resolve({})
    })
  })
  lab.afterEach(() => {
    // restore sinon sandbox
    sinon.restore()
  })
  lab.test('fwis process', async () => {
    await handler(event)
  })

  lab.test('fwis process S3 error', async () => {
    wreck.request = () => {
      return Promise.reject(new Error('Test error'))
    }
    await Code.expect(handler(event)).to.reject()
  })
})
