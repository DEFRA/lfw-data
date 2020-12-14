const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const fs = require('fs')
const fwis = require('../../../lib/models/fwis')
const { Client } = require('pg')

// start up Sinon sandbox
const sinon = require('sinon').createSandbox()

lab.experiment('fwis model', () => {
  lab.beforeEach(() => {
    // set the db mock
    sinon.stub(Client.prototype, 'connect').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(Client.prototype, 'query').callsFake(() => {
      return Promise.resolve({})
    })
    sinon.stub(Client.prototype, 'end').callsFake(() => {
      return Promise.resolve({})
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('fwis save', async () => {
    const file = JSON.parse(fs.readFileSync('./test/data/fwis.json').toString())
    const client = new Client()
    await fwis.save(file, 10000, client)
  })
})
