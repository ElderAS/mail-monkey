# mail-monkey

[![Build Status](https://travis-ci.org/ElderAS/mail-monkey.svg?branch=master&style=flat-square)](https://travis-ci.org/ElderAS/mail-monkey)
[![npm](https://img.shields.io/npm/dt/mail-monkey.svg?style=flat-square)](https://www.npmjs.com/package/mail-monkey)
[![npm](https://img.shields.io/npm/v/mail-monkey.svg?style=flat-square)](https://www.npmjs.com/package/mail-monkey)

![MailMonkey](./logo.png)

Plugin to simplify the mailing process with the help of [MJML](https://mjml.io/) and [Handlebars](https://handlebarsjs.com/)

### Installation

`npm install --save mail-monkey`

### Usage

```js
const MailMonkey = require('mail-monkey')

/* This is the most simplest configuration, check out the docs for more features */
MailMonkey.config({
  templateDir: 'YOURTEMPLATEFOLDER',
  provider: {
    name: 'Sendgrid',
    key: 'YOURAPIKEY',
  },
})
```

After you've configured `MailMonkey` you are ready to send off your mails, like this:

```js
const MailMonkey = require('mail-monkey')

/* Assuming you have a template called Confirmation */
MailMonkey.Confirmation({
  to: 'who@ever.org',
  from: 'me@ofcourse.com',
  subject: 'Check this out!',
  data: {
    name: 'Awesome...',
  },
  attachments: [
    /* You get it ;) */
  ],
})
```

### Config

You can configurate `MailMonkey` anytime by calling:

```js
MailMonkey.config({
  /* Your config */
})
```

The following props are available for configuration:

#### provider

Sets the mail provider. At the moment only [Sendgrid](https://sendgrid.com/) is implemented. (Drop a line if you would like to see more)

It should look like this:

```js
MailMonkey.config({
  provider: {
    name: 'Sendgrid',
    key: 'abc', //Your Sendgrid API Key
  },
})
```

#### handlebars

Sometimes you need more features like helpers.

It should look like this:

```js
MailMonkey.config({
  handlebars: {
    helpers: [
      {
        name: 'eval',
        function: function(options) {
          return new handlebars.SafeString(eval(options.fn(this)))
        },
      },
    ],
  },
})
```

#### templateDir

This is the path to you template directory. `MailMonkey` will read all files ending with `.mjml` and make them available. (CamelCase)

Example:

```
templates
  - Confirmation.mjml --> MailMonkey.Confirmation
  - sign-up.mjml --> MailMonkey.SignUp
  - recover.mjml --> MailMonkey.Recover
```

```js
MailMonkey.config({
  templateDir: '/mail/templates',
})
```

#### defaultData

If you have data that should be available in all templates you can provide it via `defaultData`.

Usually stuff like logo url etc.

It should look like this:

```js
MailMonkey.config({
  defaultData: {
    company: {
      name: 'Elder AS',
    },
    logo: 'path...',
  },
})
```

#### server

If you would like to make your emails available at a given url you can solve it via `server`.

Currently only [Express](https://expressjs.com/) is supported.

It should look like this:

```js
MailMonkey.config({
  server: {
    instance: EXPRESSAPP,
    endpoint: '/mail', //All emails are available at /mail/TEMPLATENAME
    resolver: function(req) {
      //OPTIONAL
      //Write your custom data resolver here
      //This function should return your template data (async as Promise or sync Object)
      //DEFAULT: returns req.query
    },
  },
})
```

`server.endpoint` uses the same syntax as [Express](https://expressjs.com/). `:template` is reserved by `mail-monkey` and will be appended to your endpoint config if it isn't present.

**Examples (template name is "confirmation")**

```
 endpoint: '/mail' -> available @ /mail/confirmation
 endpoint: '/' -> available @ /confirmation
 endpoint: '/mail/:template/:YOURID' -> available @ /mail/confirmation/YOURID
 endpoint: '/mail/:YOURID/:template' -> available @ /mail/YOURID/confirmation
```

`server.resolver` can be used to resolve data you want to have accessible in your template. By default it returns QueryStrings via `req.query`.

#### debug

You can enable logging by setting `debug` to true

## License

[The MIT License](http://opensource.org/licenses/MIT)
Copyright (c) Carsten Jacobsen
