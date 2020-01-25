const Sendgrid = require("@sendgrid/mail");
const Log = require("../log");

module.exports = function(options = {}) {
  const { key } = options;
  if (!key) return Log.error("Invalid provider setup");

  Sendgrid.setApiKey(key);

  return {
    send(data) {
      if (typeof data.from === "string") data.from = { email: data.from };
      if (typeof data.to === "string") data.to = { email: data.to };

      data.content = [
        {
          type: "text/html",
          value: data.html
        }
      ];

      delete data.html;

      return Sendgrid.send(data);
    }
  };
};
