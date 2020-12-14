const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const fs = require('fs')
const Fwis = require('../../../lib/models/fwis')
const db = require('../../../lib/helpers/db')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('fwis model', () => {
  lab.beforeEach(() => {
    // set the db mock
    sinon.stub(db, 'connect').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(db, 'query').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(db, 'end').callsFake(() => {
      return Promise.resolve({})
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('fwis save', async () => {
    const fwis = new Fwis(db)
    const file = JSON.parse(fs.readFileSync('./test/data/fwis.json').toString())
    await fwis.save(file, 10000)
  })
})
