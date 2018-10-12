const handlebars = require('handlebars')

module.exports = function(options = {}) {
  const { helpers = [] } = options

  helpers.forEach(helper => handlebars.registerHelper(helper.name, helper.function))

  return handlebars
}
