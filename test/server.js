const MailMonkey = require('../src')
const express = require('express')
const app = express()
const server = require('http').Server(app)

MailMonkey.config({
  server: {
    instance: app,
    endpoint: '/mail',
    resolver: function(req) {
      return {
        ...req.query,
        app: 'MailMonkey',
        subject: 'Demo',
      }
    },
  },
  handlebars: {
    configure(hb) {
      hb.registerPartial('sample', '<h1>Some kind of sample ({{app}})</h1>')
    },
  },
  provider: {
    name: 'Sendgrid',
    key: '---fake---',
  },
  templateDir: __dirname + '/templateDir',
})

server.listen(4040, err => {
  if (err) return process.exit(1, err)
  console.log('Server listening')
})
