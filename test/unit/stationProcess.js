'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const fs = require('fs')
const handler = require('../../lib/functions/stationProcess').handler
let s3 = require('../../lib/helpers/s3')
let db = require('../../lib/helpers/db')
const event = require('../events/stationEvent.json')
const file = {
  Body: fs.readFileSync('./test/data/rloiStationData.csv')
}

lab.experiment('RLOI Station processing', () => {
  lab.beforeEach(async () => {
    s3.getObject = (params) => {
      return new Promise((resolve) => {
        resolve(file)
      })
    }

    s3.putObject = (params) => {
      return new Promise((resolve) => {
        resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
      })
    }

    db.query = (query, vars) => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    }
  })

  lab.test('RLOI Station process', async () => {
    try {
      await handler(event)
    } catch (err) {
      throw err
    }
  })

  lab.test('station put object fail', async () => {
    s3.putObject = (params) => {
      return new Promise((resolve, reject) => {
        if (params.Key === 'rloi/stations.json') {
          resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
        } else {
          reject(new Error('Test error'))
        }
      })
    }
    await handler(event)
  })

  lab.test('throw error', async () => {
    s3.putObject = (params) => {
      throw new Error('test error')
    }
    try {
      await handler(event)
    } catch (err) {
      Code.expect(err).to.be.an.error()
    }
  })

  lab.test('production console log', async () => {
    const stage = process.env.stage
    process.env.stage = 'ea'
    await handler(event)
    process.env.stage = stage
  })
})
