const fs = require('fs')
const Providers = require('./providers')
const Log = require('./log')
const mjml2html = require('mjml')
const utils = require('./utils')
const HandlebarsBuilder = require('./builders/handlebars')

let validOptions = ['provider', 'handlebars', 'templateDir', 'defaultData', 'server', 'debug']

function MailMonkey() {
  this.server = null
  this.provider = null
  this.handlebars = HandlebarsBuilder()
  this.templates = {}
  this.defaultData = {}
  this.interface = {
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

MailMonkey.prototype.setProvider = function({ provider }) {
  if (!provider || provider.name in Providers === undefined) return Log.error('Invalid provider')
  this.provider = Providers[provider.name]({ key: provider.key })

  return this
}

MailMonkey.prototype.setDebug = function({ debug }) {
  this.debug = debug

  return this
}

MailMonkey.prototype.exposeTemplates = function() {
  if (!this.provider) return Log.error('Provider not configured')

  Object.entries(this.templates).forEach(([key, value]) => {
    this.interface[key] = ({ to, from, data, subject, attachments }) => {
      return this.provider.send({
        to,
        from,
        subject,
        attachments,
        html: value(Object.assign(data, this.defaultData)),
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
      return mjml2html.default(entry(data)).html
    }

    return result
  }, {})

  this.exposeTemplates()

  return this
}

MailMonkey.prototype.setHandlebars = function(options = {}) {
  if (!options.handlebars) return Log.error('Invalid handlebars config')
  this.handlebars = HandlebarsBuilder(options)

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
      .then(data => res.send(template(Object.assign({}, data, this.defaultData))))
      .catch(err => res.status(500).send(err))
  })

  this.server = true

  return this
}

module.exports = new MailMonkey()
