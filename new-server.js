var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());

app.post("/users", function(req, res) {
  console.log(req.body);
  res.status(200).end();
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
