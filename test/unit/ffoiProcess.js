'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const Joi = require('joi')
const fs = require('fs')
const handler = require('../../lib/functions/ffoiProcess').handler
let s3 = require('../../lib/helpers/s3')
const event = require('../events/ffoiEvent.json')
const xml = fs.readFileSync('./test/data/ffoiTest.XML')
const xmlNoWaterLevel = fs.readFileSync('./test/data/ffoiTestNoWaterLevel.XML')
let file = {
  Body: xml
}
const ffoiSchema = require('../schemas/ffoi')
const s3PutSchema = require('../schemas/s3Put')

lab.experiment('FFOI processing', () => {
  lab.beforeEach(async () => {
    s3.getObject = (params) => {
      return new Promise((resolve, reject) => {
        resolve(file)
      })
    }

    s3.putObject = (params) => {
      return new Promise((resolve, reject) => {
        resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
      })
    }
  })

  lab.test('FFOI happy process', async () => {
    s3.putObject = (params) => {
      let result = Joi.validate(params, s3PutSchema)
      Code.expect(result.error).to.be.null()
      const file = JSON.parse(params.Body)
      result = Joi.validate(file, ffoiSchema)
      Code.expect(result.error).to.be.null()
      return new Promise((resolve, reject) => {
        resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
      })
    }
    try {
      await handler(event)
    } catch (err) {
      throw err
    }
  })

  lab.test('XML parse Error', async () => {
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

  lab.test('S3 put error', async () => {
    s3.putObject = (params) => {
      return new Promise((resolve, reject) => {
        reject(new Error())
      })
    }    
    try {
      await handler(event)
    } catch (err) {
      // function handles issue with put and continues through files
      Code.expect(true).to.equal(false)
      throw err
    }
  })

  lab.test('S3 get error', async () => {
    s3.getObject = (params) => {
      return new Promise((resolve, reject) => {
        reject(new Error())
      })
    }    
    try {
      await handler(event)
    } catch (err) {
      Code.expect(err).to.be.an.error()
    }
  })

  lab.test('File with no water level data', async () => {
    s3.getObject = (params) => {
      return new Promise((resolve, reject) => {
        resolve({
          Body: xmlNoWaterLevel
        })
      })
    }
    await handler(event)
  })

  lab.test('production console log', async () => {
    const stage = process.env.stage
    process.env.stage = 'ea'
    await handler(event)
    process.env.stage = stage
  })
})
