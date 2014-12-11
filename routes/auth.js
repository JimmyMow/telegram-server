var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;

exports.index = function(req, res) {
  if(req.query.operation === 'login') {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return res.status(500).end(); }
      if (!user) { return res.send({ users: [] }); }
      req.logIn(user, function(err) {
        if (err) { return res.status(500).end(); }
        return res.send({ users: [req.emberUser(user)] });
      });
    })(req, res);
  } else if(req.query.isAuthenticated) {
    if( req.isAuthenticated() ) {
      return res.send({ users: [req.emberUser(req.user)] });
    } else {
      return res.send({ users: [] });
    }
  } else {
    req.User.find(function(err, users) {
      if(err) { return res.send(err); }
      var emberUsers = users.map(function(user) {
        return req.emberUser(user);
      });
      return res.send({ users: emberUsers });
    });
  }
};

exports.logout = function(req, res) {
  req.logout();
  return res.send(true);
}
