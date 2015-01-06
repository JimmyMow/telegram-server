var fs    = require('fs')
var nconf = require('nconf');
var path = require('path');

nconf.argv().env().file({ file: path.join(__dirname, 'config.json') });

nconf.set('database', 'mongodb://localhost/telegram');
nconf.set('port', 3000);
nconf.set('sessionSecret', 'scoop');
nconf.set('mailgun:key', 'key-c51e2b933c46f6e345bea404a4132061');
nconf.set('mailgun:domain', 'sandboxa66c118a321744cf8ad88c5441bc673f.mailgun.org');
nconf.set('mailgun:from', 'postmaster@sandboxa66c118a321744cf8ad88c5441bc673f.mailgun.org');

module.exports = nconf;
