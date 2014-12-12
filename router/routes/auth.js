var express = require('express');
var router = express.Router();

router.get('/', checkForAuthentication, function(req, res) {
  req.logout();
  return res.send(true);
});

module.exports = router;
