const handlebars = require('handlebars')

module.exports = function(options = {}) {
  const { helpers = [], configure } = options

  helpers.forEach(helper => handlebars.registerHelper(helper.name, helper.function))

  if (configure) configure(handlebars)

  return handlebars
}
