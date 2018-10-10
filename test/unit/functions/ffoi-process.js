'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const handler = require('../../../lib/functions/ffoi-process').handler
const event = require('../../events/ffoi-event.json')

const S3 = require('../../../lib/helpers/s3')
const Util = require('../../../lib/helpers/util')
const Ffoi = require('../../../lib/models/ffoi')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('FFOI processing', () => {
  lab.beforeEach(async () => {
    // setup mocks
    sinon.stub(S3.prototype, 'getObject').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(Util.prototype, 'parseXml').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(Ffoi.prototype, 'save').callsFake(() => {
      return Promise.resolve({})
    })
  })
  lab.afterEach(() => {
    // restore sinon sandbox
    sinon.restore()
  })

  lab.test('ffoi process', async () => {
    await handler(event)
  })

  lab.test('ffoi process S3 error', async () => {
    S3.prototype.getObject = () => {
      return Promise.reject(new Error('test error'))
    }
    try {
      await handler(event)
      Code.expect(true).to.equal(false)
    } catch (err) {
      Code.expect(err).to.be.an.error()
    }
  })
})
