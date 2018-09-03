'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const fs = require('fs')
const handler = require('../../lib/functions/rloiProcess').handler
let s3 = require('../../lib/helpers/s3')
const event = require('../events/rloiEvent.json')
const xml = fs.readFileSync('./test/data/rloiTest.XML')
const station = require('../data/station.json')
const db = require('../../lib/helpers/db')

lab.experiment('RLOI processing', () => {
  lab.beforeEach(async () => {
    s3.getObject = (params) => {
      return new Promise((resolve, reject) => {
        if (params.Key.indexOf('fwfidata/rloi/') > -1) {
          resolve({
            Body: xml
          })
        } else {
          resolve({
            Body: JSON.stringify(station)
          })
        }
      })
    }

    // Mock database call
    db.query = (query, vars) => {
      return new Promise((resolve, reject) => {
        resolve({
          rows: [{
            telemetry_value_parent_id: 1
          }]
        })
      })
    }
  })

  lab.test('RLOI process', async () => {
    try {
      await handler(event)
    } catch (err) {
      throw err
    }
  })
})

// TODO: complete tests for business logic, ie the data processing values
// TODO: Cover 100% of function code