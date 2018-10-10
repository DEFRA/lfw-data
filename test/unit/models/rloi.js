const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const Joi = require('joi')
const fs = require('fs')
const rloiValueParentSchema = require('../../schemas/rloi-value-parent')
const rloiValuesSchema = require('../../schemas/rloi-values')

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
      return Promise.resolve({
        Body: JSON.stringify(require('../../data/station.json'))
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
    // sinon.restore()
    // const db = sinon.createStubInstance(Db)
    const db = new Db(true)
    const s3 = new S3()
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-test.xml'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process empty values', async () => {
    const db = new Db(true)
    const s3 = new S3()
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-empty.xml'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process no station', async () => {
    S3.prototype.getObject.restore()
    sinon.stub(S3.prototype, 'getObject').callsFake(() => {
      return Promise.resolve()
    })
    const db = new Db(true)
    const s3 = new S3()
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-test.xml'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process no station', async () => {
    S3.prototype.getObject.restore()
    sinon.stub(S3.prototype, 'getObject').callsFake(() => {
      return Promise.resolve({
        Body: JSON.stringify(require('../../data/station2.json'))
      })
    })

    const db = new Db(true)
    const s3 = new S3()
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-test.xml'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process no station', async () => {
    S3.prototype.getObject.restore()
    sinon.stub(S3.prototype, 'getObject').callsFake(() => {
      return Promise.resolve({
        Body: JSON.stringify(require('../../data/station-coastal.json'))
      })
    })
    const db = new Db(true)
    const s3 = new S3()
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-test.xml'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI delete Old', async () => {
    const db = new Db(true)
    const rloi = new Rloi(db)
    rloi.deleteOld()
  })

  lab.test('RLOI process with non numeric return', async () => {
    const s3 = new S3()
    const db = new Db(true)
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-test.xml'))
    const Util2 = require('../../../lib/helpers/util')
    sinon.stub(Util2.prototype, 'isNumeric').callsFake(() => {
      console.log('in util 2 stub')
      return false
    })
    const util2 = new Util2()
    util2.isNumeric()
    const rloi = new Rloi(db, s3, util2)
    rloi.save(file, 's3://devlfw', 'testkey')
  })
})
