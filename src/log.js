const chalk = require('chalk')
const { name } = require('../package.json')

module.exports = {
  default: function(msg) {
    console.log(chalk`{yellow [${name}]} ${msg}`)
  },
  error: function(msg) {
    console.log(chalk`{yellow [${name}]} {red Error:} ${msg}`)
  },
  success: function(msg) {
    console.log(chalk`{yellow [${name}]} {green Success:} ${msg}`)
  },
}
