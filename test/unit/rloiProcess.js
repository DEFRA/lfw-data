'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const Joi = require('joi')
const fs = require('fs')
const handler = require('../../lib/functions/rloiProcess').handler
let s3 = require('../../lib/helpers/s3')
const event = require('../events/rloiEvent.json')
const xml = fs.readFileSync('./test/data/rloiTest.XML')
const station = require('../data/station.json')
const db = require('../../lib/helpers/db')
const rloiValueParentSchema = require('../schemas/rloiValueParent')
const rloiValuesSchema = require('../schemas/rloiValues')

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
    db.query = (query, vars) => {
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
    }
    try {
      await handler(event)
    } catch (err) {
      throw err
    }
  })
})
