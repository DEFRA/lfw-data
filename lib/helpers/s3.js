const AWS = require('aws-sdk')
const s3 = new AWS.S3()

module.exports.getObject = (params) => {
  return s3.getObject(params).promise()
}

module.exports.putObject = (params) => {
  return s3.putObject(params).promise()
}

module.exports.deleteObject = (params) => {
  return s3.deleteObject(params).promise()
}

module.exports.listObjects = (params) => {
  return s3.listObjectsV2(params).promise()
}
