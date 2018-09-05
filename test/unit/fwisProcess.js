'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const fs = require('fs')
const handler = require('../../lib/functions/fwisProcess').handler
let s3 = require('../../lib/helpers/s3')
const event = require('../events/fwisEvent.json')
const fwisXml = fs.readFileSync('./test/data/fwis-1479810603.xml')
const db = require('../../lib/helpers/db')

lab.experiment('fwis processing', () => {
  lab.beforeEach(async () => {
    s3.getObject = (params) => {
      return new Promise((resolve, reject) => {
        resolve({
          Body: fwisXml.toString()
        })
      })
    }

    // Mock database call
    db.query = (query, vars) => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    }
  })

  lab.test('fwis process', async () => {
    try {
      await handler(event)
    } catch (err) {
      throw err
    }
  })

  lab.test('xml Error', async () => {
    s3.getObject = (params) => {
      return new Promise((resolve, reject) => {
        resolve({
          Body: 'xml></xml>'
        })
      })
    }
    try {
      await handler(event)
    } catch (err) {
      Code.expect(err).to.be.an.error()
    }
  })
})
