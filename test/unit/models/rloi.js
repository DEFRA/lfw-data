const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const fs = require('fs')
const rloiValueParentSchema = require('../../schemas/rloi-value-parent')
const rloiValuesSchema = require('../../schemas/rloi-values')

const util = require('../../../lib/helpers/util')
const Rloi = require('../../../lib/models/rloi')
const db = require('../../../lib/helpers/db')
const s3 = require('../../../lib/helpers/s3')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('rloi model', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(s3, 'getObject').callsFake(() => {
      return Promise.resolve({
        Body: JSON.stringify(require('../../data/station.json'))
      })
    })
    sinon.stub(db, 'connect').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(db, 'end').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(db, 'query').callsFake((query, vars) => {
      let resultQuery, resultVars
      if (typeof query === 'object') {
        // test values insert
        resultQuery = rloiValuesSchema.query.validate(query)
      } else {
        // test value parent insert
        resultQuery = rloiValueParentSchema.query.validate(query)
        resultVars = rloiValueParentSchema.vars.validate(vars)
      }
      Code.expect(resultQuery.error).to.be.undefined()
      if (resultVars) {
        Code.expect(resultVars.error).to.be.undefined()
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
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-test.xml'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process empty values', async () => {
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-empty.xml'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process no station', async () => {
    s3.getObject.restore()
    sinon.stub(s3, 'getObject').callsFake(() => {
      return Promise.resolve()
    })
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-test.xml'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process no station', async () => {
    s3.getObject.restore()
    sinon.stub(s3, 'getObject').callsFake(() => {
      return Promise.resolve({
        Body: JSON.stringify(require('../../data/station2.json'))
      })
    })

    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-test.xml'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI process no station', async () => {
    s3.getObject.restore()
    sinon.stub(s3, 'getObject').callsFake(() => {
      return Promise.resolve({
        Body: JSON.stringify(require('../../data/station-coastal.json'))
      })
    })
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-test.xml'))
    const rloi = new Rloi(db, s3, util)
    rloi.save(file, 's3://devlfw', 'testkey')
  })

  lab.test('RLOI delete Old', async () => {
    const rloi = new Rloi(db)
    rloi.deleteOld()
  })

  lab.test('RLOI process with non numeric return', async () => {
    const file = await util.parseXml(fs.readFileSync('./test/data/rloi-test.xml'))
    const util2 = require('../../../lib/helpers/util')
    sinon.stub(util2, 'isNumeric').callsFake(() => {
      console.log('in util 2 stub')
      return false
    })
    util2.isNumeric()
    const rloi = new Rloi(db, s3, util2)
    rloi.save(file, 's3://devlfw', 'testkey')
  })
})
