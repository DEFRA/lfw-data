const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const Joi = require('joi')
const fs = require('fs')
const rloiValueParentSchema = require('../../schemas/rloiValueParent')
const rloiValuesSchema = require('../../schemas/rloiValues')

const util = new (require('../../../lib/helpers/util'))()
const Rloi = require('../../../lib/models/rloi')
const Db = require('../../../lib/helpers/db')
const S3 = require('../../../lib/helpers/s3')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('rloi model', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(S3.prototype, 'getObject').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({
          Body: JSON.stringify(require('../../data/station.json'))
        })
      })
    })
    sinon.stub(Db.prototype, 'query').callsFake((query, vars) => {
      let resultQuery, resultVars
      if (typeof query === 'object') {
        // test values insert
        resultQuery = Joi.validate(query, rloiValuesSchema.query)
      } else {
        // test value parent insert
        resultQuery = Joi.validate(query, rloiValueParentSchema.query)
        resultVars = Joi.validate(vars, rloiValueParentSchema.vars)
      }
      Code.expect(resultQuery.error).to.be.null()
      if (resultVars) {
        Code.expect(resultVars.error).to.be.null()
      }

      return new Promise((resolve, reject) => {
        resolve({
          rows: [{
            telemetry_value_parent_id: 1
          }]
        })
      })
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('RLOI process', async () => {
    sinon.restore()
    const db = sinon.createStubInstance(Db)
    const s3 = new S3()
    const file = await util.parseXml(fs.readFileSync('./test/data/rloiTest.XML'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process empty values', async () => {
    const db = new Db()
    const s3 = new S3()
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi_empty.XML'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process no station', async () => {
    S3.prototype.getObject.restore()
    sinon.stub(S3.prototype, 'getObject').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve()
      })
    })
    const db = new Db()
    const s3 = new S3()
    const file = await util.parseXml(fs.readFileSync('./test/data/rloiTest.XML'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process no station', async () => {
    S3.prototype.getObject.restore()
    sinon.stub(S3.prototype, 'getObject').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({
          Body: JSON.stringify(require('../../data/station2.json'))
        })
      })
    })

    const db = new Db()
    const s3 = new S3()
    const file = await util.parseXml(fs.readFileSync('./test/data/rloiTest.XML'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process no station', async () => {
    S3.prototype.getObject.restore()
    sinon.stub(S3.prototype, 'getObject').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({
          Body: JSON.stringify(require('../../data/station_coastal.json'))
        })
      })
    })
    const db = new Db()
    const s3 = new S3()
    const file = await util.parseXml(fs.readFileSync('./test/data/rloiTest.XML'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI delete Old', async () => {
    const db = new Db()
    const rloi = new Rloi(db)
    rloi.deleteOld()
  })
})
