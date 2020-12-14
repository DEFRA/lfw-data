'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../../lib/functions/ffoi-process').handler
const event = require('../../events/ffoi-event.json')

const s3 = require('../../../lib/helpers/s3')
const util = require('../../../lib/helpers/util')
const ffoi = require('../../../lib/models/ffoi')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('FFOI processing', () => {
  lab.beforeEach(async () => {
    // setup mocks
    sinon.stub(s3, 'getObject').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(util, 'parseXml').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(ffoi, 'save').callsFake(() => {
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
    s3.getObject = () => {
      return Promise.reject(new Error('test error'))
    }
    await Code.expect(handler(event)).to.reject()
  })
})
