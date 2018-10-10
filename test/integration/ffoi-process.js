'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const fs = require('fs')
const Code = require('code')
let s3 = require('../../lib/helpers/s3')
const xml = fs.readFileSync('./test/data/rloiTest.XML')

lab.experiment('Test Lambda functionality post deployment', () => {
  lab.before(async () => {
    try {
      // load the test.XML file
      let params = {
        Body: xml,
        Bucket: process.env.FFOI_SLS_BUCKET,
        Key: 'fwfidata/ENT_7024/test.XML'
      }
      console.log('putObject: ' + params.Key)
      await s3.putObject(params)
      // give lambda time to process the file
      console.log('File loaded')
      console.log('Pause 5 seconds')
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 5000)
      })
      console.log('Pause finished')
    } catch (err) {
      throw err
    }
  })

  lab.after(async () => {
    // delete the test files
    try {
      await s3.deleteObject({ Bucket: process.env.FFOI_SLS_BUCKET, Key: 'fwfidata/ENT_7024/test.XML' })
      console.log('Deleted: test.XML')
      for (let i = 1; i <= 10; i++) {
        await s3.deleteObject({ Bucket: process.env.FFOI_SLS_BUCKET, Key: 'ffoi/test' + i + '.json' })
        console.log('Deleted: test' + i + '.json')
      }
    } catch (err) {
      Code.expect(err).to.be.null()
      throw err
    }
  })

  lab.test('process', async () => {
    // Confirm that the file has produced 10 test files
    try {
      for (let i = 1; i <= 10; i++) {
        const data = await s3.getObject({Bucket: process.env.FFOI_SLS_BUCKET, Key: 'ffoi/test' + i + '.json'})
        Code.expect(data).to.not.be.null()
        let ffoi = JSON.parse(data.Body)
        Code.expect(ffoi.$.stationReference).to.equal('test' + i)
        Code.expect(ffoi.SetofValues.length).to.be.greaterThan(0)
        console.log('Tested: test' + i + '.json')
      }
    } catch (err) {
      Code.expect(err).to.be.null()
      throw err
    }
  })
})
