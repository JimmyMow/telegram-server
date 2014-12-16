var express = require('express');
var app = express();
var connection = require('./database/database');
require('./middleware/express-config')(app);
var routes = require('./router/index')(app);

connection.once('open', function() {
  var server = app.listen(3000, function() {
      console.log('Listening on port %d', server.address().port);
  });
});

module.exports = app;
