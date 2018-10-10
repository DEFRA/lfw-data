const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const fs = require('fs')
const Joi = require('joi')
const ffoiSchema = require('../../schemas/ffoi')
const s3PutSchema = require('../../schemas/s3-put')

// mock s3 object
const Ffoi = require('../../../lib/models/ffoi')
const S3 = require('../../../lib/helpers/s3')
const util = new (require('../../../lib/helpers/util'))()

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('ffoi model', () => {
  lab.beforeEach(() => {
    sinon.stub(S3.prototype, 'putObject').callsFake((params) => {
      return Promise.resolve({})
    })
  })

  lab.afterEach(() => {
    // restore sinon sandbox
    sinon.restore()
  })

  lab.test('FFOI happy process', async () => {
    sinon.restore()
    sinon.stub(S3.prototype, 'putObject').callsFake((params) => {
      let result = Joi.validate(params, s3PutSchema)
      Code.expect(result.error).to.be.null()
      const file = JSON.parse(params.Body)
      result = Joi.validate(file, ffoiSchema)
      Code.expect(result.error).to.be.null()
      return Promise.resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
    })
    const s3 = new S3()
    const ffoi = new Ffoi(s3)
    const file = await util.parseXml(fs.readFileSync('./test/data/ffoi-test.xml'))
    await ffoi.save(file, 's3://devlfw', 'testKey')
  })

  lab.test('S3 put error', async () => {
    sinon.restore()
    sinon.stub(S3.prototype, 'putObject').callsFake((params) => {
      return Promise.reject(new Error('test error'))
    })
    const s3 = new S3()
    const ffoi = new Ffoi(s3)
    const file = await util.parseXml(fs.readFileSync('./test/data/ffoi-test.xml'))
    await ffoi.save(file, 's3://devlfw', 'testkey')
    // process continues and logs error to console
  })

  lab.test('File with no water level data', async () => {
    const s3 = new S3()
    const ffoi = new Ffoi(s3)
    const file = await util.parseXml(fs.readFileSync('./test/data/ffoi-test-no-water-level.xml'))
    await ffoi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('production console log', async () => {
    const stage = process.env.stage
    const s3 = new S3()
    const ffoi = new Ffoi(s3)
    const file = await util.parseXml(fs.readFileSync('./test/data/ffoi-test.xml'))
    process.env.stage = 'ea'
    await ffoi.save(file, 's3://devlfw', 'testkey')
    process.env.stage = stage
  })
})
