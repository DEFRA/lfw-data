const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const fs = require('fs')
const ffoiSchema = require('../../schemas/ffoi')
const s3PutSchema = require('../../schemas/s3-put')

// mock s3 object
const ffoi = require('../../../lib/models/ffoi')
const s3 = require('../../../lib/helpers/s3')
const util = require('../../../lib/helpers/util')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('ffoi model', () => {
  lab.beforeEach(() => {
    sinon.stub(s3, 'putObject').callsFake((params) => {
      return Promise.resolve({})
    })
  })

  lab.afterEach(() => {
    // restore sinon sandbox
    sinon.restore()
  })

  lab.test('FFOI happy process', async () => {
    sinon.restore()
    sinon.stub(s3, 'putObject').callsFake((params) => {
      let result = s3PutSchema.validate(params)
      Code.expect(result.error).to.be.undefined()
      const file = JSON.parse(params.Body)
      result = ffoiSchema.validate(file)
      Code.expect(result.error).to.be.undefined()
      return Promise.resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
    })
    const file = await util.parseXml(fs.readFileSync('./test/data/ffoi-test.xml'))
    await ffoi.save(file, 's3://devlfw', 'testKey', s3)
  })

  lab.test('FFOI old file no useful values', async () => {
    sinon.restore()
    sinon.stub(s3, 'putObject').callsFake((params) => {
      let result = s3PutSchema.validate(params)
      Code.expect(result.error).to.be.null()
      const file = JSON.parse(params.Body)
      result = ffoiSchema.validate(file)
      Code.expect(result.error).to.be.null()
      return Promise.resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
    })
    const file = await util.parseXml(fs.readFileSync('./test/data/ffoi-test-old.xml'))
    await ffoi.save(file, 's3://devlfw', 'testKey', s3)
  })

  lab.test('S3 put error', async () => {
    sinon.restore()
    sinon.stub(s3, 'putObject').callsFake((params) => {
      return Promise.reject(new Error('test error'))
    })
    const file = await util.parseXml(fs.readFileSync('./test/data/ffoi-test.xml'))
    await ffoi.save(file, 's3://devlfw', 'testkey', s3)
    // process continues and logs error to console
  })

  lab.test('File with no water level data', async () => {
    const file = await util.parseXml(fs.readFileSync('./test/data/ffoi-test-no-water-level.xml'))
    await ffoi.save(file, 's3://devlfw', 'testkey', s3)
  })

  lab.test('production console log', async () => {
    const stage = process.env.stage
    const file = await util.parseXml(fs.readFileSync('./test/data/ffoi-test.xml'))
    process.env.stage = 'ea'
    await ffoi.save(file, 's3://devlfw', 'testkey', s3)
    process.env.stage = stage
  })
})
