const wreck = require('@hapi/wreck').defaults({
  timeout: 20000
})

let wreckExt

module.exports = {
  request: (method, url, options, ext = false) => {
    const thisWreck = (ext && wreckExt) ? wreckExt : wreck
    return thisWreck[method](url, options)
      .then(response => {
        const res = response.res
        const payload = response.payload

        if (res.statusCode !== 200) {
          const err = (payload || new Error('Unknown error'))
          throw err
        }

        return payload
      })
  }
}
