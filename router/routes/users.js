var express = require('express');
var router = express.Router();
var passport = require('../../middleware/authentication');
var connection = require('../../database/database');
var User = connection.model('User');

router.get('/', function(req, res) {
  if(req.query.operation === 'login') {
    passport.authenticate('local', function(err, user, info) {

      if (err) { return res.status(500).end(); }
      if (!user) { return res.send({ users: [] }); }
      req.logIn(user, function(err) {
        if (err) { return res.status(500).end(); }
        return res.send({ users: [user.emberUser()] });
      });
    })(req, res);
  } else if(req.query.isAuthenticated) {
    if( req.isAuthenticated() ) {
      return res.send({ users: [req.user.emberUser()] });
    } else {
      return res.send({ users: [] });
    }
  } else {
    User.find(function(err, users) {
      if(err) { return res.send(err); }
      var emberUsers = users.map(function(user) {
        return user.emberUser();
      });
      return res.send({ users: emberUsers });
    });
  }
});
router.get('/:id', function(req, res) {
  User.findOne({"id": req.params.id}, function(err, user) {
    if(err) { return res.status(404).end(); }
    return res.send({ user: user });
  });
});

router.post('/', function(req, res) {
  var user = new User({
    id: req.body.user.id,
    name: req.body.user.name,
    email: req.body.user.email,
    password: req.body.user.password
  })
  user.save(function(err, user){
    if(err) { return res.status(500).end(); }
    return res.send({ user: user });
  });
});

module.exports = router;
