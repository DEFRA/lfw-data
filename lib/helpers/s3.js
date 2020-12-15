const AWS = require('aws-sdk')
const s3 = new AWS.S3()

module.exports = {
  getObject (params) {
    return s3.getObject(params).promise()
  },

  putObject (params) {
    // Put object then set ACL to allow bucket-owner-full-control
    params.ACL = 'bucket-owner-full-control'
    return s3.putObject(params).promise()
  },

  deleteObject (params) {
    return s3.deleteObject(params).promise()
  },

  listObjects (params) {
    return s3.listObjectsV2(params).promise()
  }
}
