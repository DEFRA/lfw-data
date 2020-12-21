const wreck = require('@hapi/wreck')
const retry = require('async-retry')

module.exports = {
  async request (method, url, options) {
    return retry(async () => {
      const { res, payload } = await wreck[method](url, options)
      if (res.statusCode !== 200) {
        const err = (payload || new Error('Unknown error'))
        throw err
      }
      return payload
    }, {
      retries: 4,
      factor: 2,
      minTimeout: 2000,
      onRetry: (err, attempt) => {
        console.error(`wreck attempt failed (${attempt})`)
        console.error(err)
      }
    })
  }
}
