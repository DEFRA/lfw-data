const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const util = require('../../../lib/helpers/util')

lab.experiment('util.js', () => {
  lab.test('toFixed', () => {
    Code.expect(util.toFixed(5.789, 2)).to.equal('5.79')
    Code.expect(util.toFixed()).to.equal()
  })

  lab.test('isNumeric', () => {
    Code.expect(util.isNumeric(NaN)).to.be.false()
    Code.expect(util.isNumeric(null)).to.be.false()
    Code.expect(util.isNumeric('1234sdf')).to.be.false()
    Code.expect(util.isNumeric('fghj')).to.be.false()
    Code.expect(util.isNumeric(undefined)).to.be.false()
    Code.expect(util.isNumeric(1)).to.be.true()
    Code.expect(util.isNumeric('1')).to.be.true()
  })

  lab.test('parseIntNull', () => {
    Code.expect(util.parseIntNull('sdf', 1)).to.equal(null)
    Code.expect(util.parseIntNull(5, 10)).to.equal(5)
  })

  lab.test('parseXml', async () => {
    await Code.expect(util.parseXml('xml></xml>')).to.reject()
  })
})
