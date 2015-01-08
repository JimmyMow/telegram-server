var fs = require('fs');
var Handlebars = require('handlebars');
var nconf = require('../config/config');
var mailgun = require('mailgun-js')({apiKey: nconf.get('mailgun').key, domain: nconf.get('mailgun').domain});

var emailObj = exports;

emailObj.sendPasswordReset = function(email, password, done) {
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
      text: result
    };
    mailgun.messages().send(data, function (err, body) {
      if(err) {
        console.log(err);
        return done(err);
      }
      return done(null, body);
    });
  });
};

function readContent(done) {
  fs.readFile(__dirname + "/template.hbs", "utf-8", function (err, template) {
      if (err) {
        return done(err)
      }
      return done(null, template)
  });
}
