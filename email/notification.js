var fs = require('fs');
var Handlebars = require('handlebars');
var nconf = require('../config/config');
var mailgun = require('mailgun-js')({apiKey: nconf.get('mailgun').key, domain: nconf.get('mailgun').domain});

function readContent(done) {
  fs.readFile(__dirname + "/template.hbs", "utf-8", function (err, template) {
      if (err) {
        return done(err)
      }
      return done(null, template)
  });
}

module.exports = function(email, password, done) {
  readContent(function (err, template) {
    if(err) {
      return done(err);
    }
    var handlebarsTemplate = Handlebars.compile(template);
    var result = handlebarsTemplate({password: password});
    var data = {
      from: nconf.get('mailgun').from,
      to: email,
      subject: 'Telegram reset password',
      text: 'We are reseting your password. Here it is: ' + password
    };
    mailgun.messages().send(data, function (err, body) {
      if(err) {
        return done(err);
      }
      return done(null, body);
    });
  });
}
