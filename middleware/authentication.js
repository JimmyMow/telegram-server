var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var connection = require('../database/database');
var User = connection.model('User');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({id: id}, function(err, user) {
    if(err){
      return done(err);
    }
    return done(null, user);
  });
});

passport.use(new LocalStrategy({
    usernameField: 'user[id]',
    passwordField: 'user[meta][password]'
  },
  function(username, password, done) {
    User.findOne({id: username}, function(err, user) {
      if(err){
        return done(err);
      }
      if(!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      bcrypt.compare(user.password, password, function(err, res) {
          if(res == true) {
            return done(null, false, { message: 'Incorrect password.' });
          }
      });
      // if(user.password !== password) {
      //   return done(null, false, { message: 'Incorrect password.' });
      // }
      return done(null, user);
    });
  }
));

module.exports = passport;
