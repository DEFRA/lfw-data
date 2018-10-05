const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const fs = require('fs')
const Fwis = require('../../../lib/models/fwis')
const util = new (require('../../../lib/helpers/util'))()
const Db = require('../../../lib/helpers/db')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('fwis model', () => {
  lab.beforeEach(() => {
    // set the db mock
    sinon.stub(Db.prototype, 'query').callsFake((query) => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('Test BST date', async () => {
    sinon.restore()
    // Mock the db query to check the values we're inserting
    sinon.stub(Db.prototype, 'query').callsFake((query) => {
      if (query.text && query.text.indexOf('INSERT INTO "current_fwis"') > -1) {
        Code.expect(query.values[0]).to.equal('033WAF312')
        Code.expect(query.values[1]).to.equal('156542')
        Code.expect(query.values[2]).to.equal('River Sow and River Penk')
        Code.expect(query.values[3]).to.equal('Midlands')
        Code.expect(query.values[4]).to.equal('Central')
        Code.expect(query.values[5]).to.equal('f')
        Code.expect(query.values[6]).to.equal('Warning no longer in force')
        Code.expect(query.values[7]).to.equal('4')
        Code.expect(query.values[8]).to.equal('104085')
        Code.expect(query.values[9]).to.equal('2018-09-23T08:46:00.000Z') // Zulu time 8.46, file contains 9.46 BST (Europe/London)
        Code.expect(query.values[10]).to.equal('2018-09-23T08:46:00.000Z') // Fwis.xml suplies datetimes in locale timezone, with no utc offset given
        Code.expect(query.values[11]).to.equal('2018-09-23T08:46:00.000Z')
        Code.expect(query.values[12]).to.equal('')
        Code.expect(query.values[13]).to.equal('033WAF310')
        Code.expect(query.values[14]).to.equal('156540')
        Code.expect(query.values[15]).to.equal('Stone Trent')
        Code.expect(query.values[16]).to.equal('Midlands')
        Code.expect(query.values[17]).to.equal('Central')
        Code.expect(query.values[18]).to.equal('f')
        Code.expect(query.values[19]).to.equal('Flood Alert')
        Code.expect(query.values[20]).to.equal('3')
        Code.expect(query.values[21]).to.equal('104114')
        Code.expect(query.values[22]).to.equal('2018-09-20T17:38:00.000Z')
        Code.expect(query.values[23]).to.equal('2018-09-20T17:38:00.000Z')
        Code.expect(query.values[24]).to.equal('2018-09-20T17:38:00.000Z')
        Code.expect(query.values[25]).to.contain('Heavy rain has fallen within the R')
      }
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
    const db = new Db()
    const fwis = new Fwis(db)
    const file = await util.parseXml(fs.readFileSync('./test/data/fwis-smallEventBST.xml'))
    await fwis.save(file, 10000)
  })

  lab.test('Test GMT date', async () => {
    sinon.restore()
    // Mock the db query to check the values we're inserting
    sinon.stub(Db.prototype, 'query').callsFake((query) => {
      if (query.text && query.text.indexOf('INSERT INTO "current_fwis"') > -1) {
        Code.expect(query.values[0]).to.equal('033WAF312')
        Code.expect(query.values[1]).to.equal('156542')
        Code.expect(query.values[2]).to.equal('River Sow and River Penk')
        Code.expect(query.values[3]).to.equal('Midlands')
        Code.expect(query.values[4]).to.equal('Central')
        Code.expect(query.values[5]).to.equal('f')
        Code.expect(query.values[6]).to.equal('Warning no longer in force')
        Code.expect(query.values[7]).to.equal('4')
        Code.expect(query.values[8]).to.equal('104085')
        Code.expect(query.values[9]).to.equal('2018-11-23T09:46:00.000Z') // Zulu time 9.46, file contains 9.46 GMT (Europe/London)
        Code.expect(query.values[10]).to.equal('2018-11-23T09:46:00.000Z')
        Code.expect(query.values[11]).to.equal('2018-11-23T09:46:00.000Z')
        Code.expect(query.values[12]).to.equal('')
        Code.expect(query.values[13]).to.equal('033WAF310')
        Code.expect(query.values[14]).to.equal('156540')
        Code.expect(query.values[15]).to.equal('Stone Trent')
        Code.expect(query.values[16]).to.equal('Midlands')
        Code.expect(query.values[17]).to.equal('Central')
        Code.expect(query.values[18]).to.equal('f')
        Code.expect(query.values[19]).to.equal('Flood Alert')
        Code.expect(query.values[20]).to.equal('3')
        Code.expect(query.values[21]).to.equal('104114')
        Code.expect(query.values[22]).to.equal('2018-11-20T18:38:00.000Z') // Zulu time of 18:38 file contains 18.38 GMT (Europe/London)
        Code.expect(query.values[23]).to.equal('2018-11-20T18:38:00.000Z')
        Code.expect(query.values[24]).to.equal('2018-11-20T18:38:00.000Z')
        Code.expect(query.values[25]).to.contain('Heavy rain has fallen within the R')
      }
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
    const db = new Db()
    const fwis = new Fwis(db)
    const file = await util.parseXml(fs.readFileSync('./test/data/fwis-smallEventGMT.xml'))
    await fwis.save(file, 10000)
  })

  lab.test('Big warnings file', async () => {
    sinon.restore()
    // Mock the db query to check the values we're inserting
    sinon.stub(Db.prototype, 'query').callsFake((query) => {
      if (query.text && query.text.indexOf('INSERT INTO "current_fwis"') > -1) {
        Code.expect(query.values.length).to.equal(4563)
      }
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
    const db = new Db()
    const fwis = new Fwis(db)
    const file = await util.parseXml(fs.readFileSync('./test/data/fwis-bigEvent.xml'))
    await fwis.save(file, 10000)
  })

  lab.test('Empty warnings file', async () => {
    const db = new Db()
    const fwis = new Fwis(db)
    const file = await util.parseXml(fs.readFileSync('./test/data/fwis-noWarnings.xml'))
    await fwis.save(file, 10000)
  })
})
