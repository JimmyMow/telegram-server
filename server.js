var config = require('./config/config.js');
var express = require('express');
var app = express();
var connection = require('./database/database');
var nconf = require('./config/config');
require('./middleware/express-config')(app);
require('./router/index')(app);

connection.once('open', function() {
  var server = app.listen(nconf.get('port'), function() {
      console.log('Listening on port %d', server.address().port);
  });
});
