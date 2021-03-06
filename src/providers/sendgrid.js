const Sendgrid = require("@sendgrid/mail");
const Log = require("../log");

module.exports = function(options = {}) {
  const { key } = options;
  if (!key) return Log.error("Invalid provider setup");

  Sendgrid.setApiKey(key);
  return {
    send(payload) {
      let { html, ...data } = payload;

      data.content = [
        {
          type: "text/html",
          value: html
        }
      ];

      return Sendgrid.send(data);
    }
  };
};
