const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const handler = require('../../../lib/functions/fwisProcess').handler
const event = require('../../events/fwisEvent.json')
let S3 = require('../../../lib/helpers/s3')
let Util = require('../../../lib/helpers/util')
let Fwis = require('../../../lib/models/fwis')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('fwis processing', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(S3.prototype, 'getObject').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
    sinon.stub(Util.prototype, 'parseXml').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
    sinon.stub(Fwis.prototype, 'save').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
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
