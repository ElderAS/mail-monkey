const fs = require('fs')
let Providers = require('./providers')
const Log = require('./log')
const mjml2html = require('mjml')
const utils = require('./utils')
const R = require('ramda')
const HandlebarsBuilder = require('./builders/handlebars')

let validOptions = ['provider', 'handlebars', 'templateDir', 'defaultData', 'mailSettings', 'server', 'debug']

function MailMonkey() {
  this.server = null
  this.provider = null
  this.providers = Providers
  this.handlebars = HandlebarsBuilder()
  this.templates = {}
  this.mailSettings = {}
  this.defaultData = {}
  this.interface = {
    addProvider: this.addProvider.bind(this),
    config: opts => this.config(opts),
  }
  return this.interface
}

MailMonkey.prototype.config = function(options) {
  if (!options) return Log.error('Invalid config')

  validOptions.forEach(key => {
    if (key in options === false) return
    this['set' + utils.Capitalize(key)](options)
  })

  return this
}

MailMonkey.prototype.addProvider = function(name, func) {
  if (!name) return Log.error('Name is required')
  if (!func || typeof func !== 'function') return Log.error('Function is required')
  this.providers[name] = func

  return this
}

MailMonkey.prototype.setProvider = function({ provider }) {
  if (!provider || provider.name in this.providers === undefined) return Log.error('Invalid provider')
  this.provider = this.providers[provider.name](provider)

  return this
}

MailMonkey.prototype.setMailSettings = function({ mailSettings = {} }) {
  this.mailSettings = mailSettings

  return this
}

MailMonkey.prototype.setDebug = function({ debug }) {
  this.debug = debug

  return this
}

MailMonkey.prototype.exposeTemplates = function() {
  if (!this.provider) return Log.error('Provider not configured')

  Object.entries(this.templates).forEach(([key, value]) => {
    this.interface[key] = ({
      to,
      from = R.path(['sender', 'email'], this.mailSettings),
      data = {},
      subject,
      attachments,
    }) => {
      return this.provider.send({
        to,
        from,
        subject,
        attachments,
        html: value(Object.assign({}, this.defaultData, data)),
      })
    }
  })
}

MailMonkey.prototype.setTemplateDir = function({ templateDir }) {
  if (!templateDir) return Log.error('Invalid templateDir')
  let Templates = {}

  try {
    Templates = fs
      .readdirSync(templateDir)
      .filter(file => file.includes('.mjml'))
      .map(file => ({
        name: utils.CamelCase(file.replace('.mjml', '')),
        file: fs.readFileSync(templateDir + (templateDir.substring(templateDir.length - 1) === '/' ? '' : '/') + file, {
          encoding: 'utf-8',
        }),
      }))
      .reduce((result, entry) => {
        result[entry.name] = this.handlebars.compile(entry.file)
        return result
      }, {})
  } catch (e) {
    return Log.error('Invalid templateDir: ' + templateDir)
  }

  this.templates = Object.keys(Templates).reduce((result, key) => {
    let entry = Templates[key]
    result[key] = function(data = {}) {
      return mjml2html(entry(data)).html
    }

    return result
  }, {})

  this.exposeTemplates()

  return this
}

MailMonkey.prototype.setHandlebars = function({ handlebars }) {
  if (!handlebars) return Log.error('Invalid handlebars config')
  this.handlebars = HandlebarsBuilder(handlebars)

  return this
}

MailMonkey.prototype.setDefaultData = function({ defaultData }) {
  this.defaultData = defaultData

  return this
}

MailMonkey.prototype.setServer = function({ server }) {
  if (this.server) return
  if (!server) return Log.error('Invalid server config')
  if (this.debug) Log.success(`Serving emails at ${server.endpoint}`)

  let hasTemplateParam = /(:template\b)/g.test(server.endpoint)
  if (!hasTemplateParam) server.endpoint += utils.hasTrailingSlash(server.endpoint) ? ':template' : '/:template'

  function defaultResolver(req) {
    return req.query
  }

  server.instance.get(server.endpoint, (req, res, next) => {
    let key = utils.CamelCase(req.params.template)
    let template = this.templates[key]
    if (!template) return res.sendStatus(404)

    let resolver = server.resolver || defaultResolver

    Promise.resolve(resolver(req))
      .then(data => res.send(template(Object.assign({}, this.defaultData, data))))
      .catch(err => res.status(500).send(err))
  })

  this.server = true

  return this
}

module.exports = new MailMonkey()
