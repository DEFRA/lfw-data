const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const fs = require('fs')

const util = new (require('../../../lib/helpers/util'))()
const Station = require('../../../lib/models/station')
const Db = require('../../../lib/helpers/db')
const S3 = require('../../../lib/helpers/s3')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('station model', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(S3.prototype, 'putObject').callsFake(() => {
      return Promise.resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
    })
    sinon.stub(Db.prototype, 'query').callsFake(() => {
      return Promise.resolve({})
    })
  })
  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('Station save to database', async () => {
    const db = new Db(true)
    const s3 = new S3()
    const station = new Station(db, s3, util)
    const stations = await util.parseCsv(fs.readFileSync('./test/data/rloiStationData.csv').toString())
    await station.saveToDb(stations)
  })

  lab.test('Station save to object', async () => {
    const db = new Db(true)
    const s3 = new S3()
    const station = new Station(db, s3, util)
    const stations = await util.parseCsv(fs.readFileSync('./test/data/rloiStationData.csv').toString())
    await station.saveToObjects(stations)
  })

  lab.test('production console log', async () => {
    const stage = process.env.stage
    process.env.stage = 'ea'
    const db = new Db(true)
    const s3 = new S3()
    const station = new Station(db, s3, util)
    const stations = await util.parseCsv(fs.readFileSync('./test/data/rloiStationData.csv').toString())
    await station.saveToObjects(stations)
    process.env.stage = stage
  })

  lab.test('s3 putobject error', async () => {
    S3.prototype.putObject.restore()
    sinon.stub(S3.prototype, 'putObject').callsFake((params) => {
      return new Promise((resolve, reject) => {
        if (params.Key.indexOf('stations.json') > -1) {
          return resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
        } else {
          return reject(new Error('test error'))
        }
      })
    })
    const db = new Db(true)
    const s3 = new S3()
    const station = new Station(db, s3, util)
    const stations = await util.parseCsv(fs.readFileSync('./test/data/rloiStationData.csv').toString())
    try {
      await station.saveToObjects(stations)
    } catch (err) {
      Code.expect(err).to.be.an.error()
    }
  })

  lab.test('db error', async () => {
    Db.prototype.query.restore()
    sinon.stub(Db.prototype, 'query').callsFake((query) => {
      return Promise.reject(new Error('test error'))
    })
    const db = new Db(true)
    const s3 = new S3()
    const station = new Station(db, s3, util)
    const stations = await util.parseCsv(fs.readFileSync('./test/data/rloiStationData.csv').toString())
    try {
      await station.saveToDb(stations)
    } catch (err) {
      Code.expect(err).to.be.an.error()
    }
  })
})
