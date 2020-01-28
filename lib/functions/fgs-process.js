// const s3 = new (require('../helpers/s3'))()
const request = require('../helpers/wreck').request

module.exports.handler = async (event) => {
  // To do
  // 1: Get latest statements from metoffice
  const statements = await request('get', 'https://api.ffc-environment-agency.fgs.metoffice.gov.uk/api/public/statements', {}, true)
  console.log(statements)

  // 2: Get all objects from fgs in bucket

  // 3: Do we have any files we haven't processed (this should just be the latest file)

  // 4a: Process new files in reverse order, ie oldest first, so that newest file is created last and is latest

  // 4b: Process each file (should normally be one) forming details required by lfw app

  // 4c: Store in s3 bucket {}.json

  // 5: return
}