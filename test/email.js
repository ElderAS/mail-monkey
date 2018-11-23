require('dotenv').config()
const MailMonkey = require('../src')

MailMonkey.config({
  handlebars: {
    configure(hb) {
      hb.registerPartial('sample', '<h1>Some kind of sample ({{app}})</h1>')
    },
  },
  provider: {
    name: 'Sendgrid',
    key: process.env.SENDGRID_API_KEY,
  },
  templateDir: __dirname + '/templateDir',
  mailSettings: {
    sender: {
      email: process.env.TEST_FROM,
    },
  },
})

MailMonkey.Demo({
  to: process.env.TEST_TO,
  subject: 'Test',
  data: {},
})
  .then(() => process.exit(1))
  .catch(err => console.log(err.response.body.errors))
