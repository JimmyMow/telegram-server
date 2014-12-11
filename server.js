var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var connection = mongoose.connection;
var Schema = mongoose.Schema;
var logger = require('nlogger').logger(module);

// Models
var User = require("./models/user");
var Post = require("./models/post");

// Passport
var LocalStrategy = require('passport-local').Strategy;
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
  secret: 'scoop',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({"id": id}, function(err, user) {
    if(err){ return done(err); }
    return done(null, user);
  });
});

passport.use(new LocalStrategy({
    usernameField: 'id',
  },
  function(username, password, done) {
    User.findOne({"id": username}, function(err, user) {
      if(err){ return done(err); }
      if(!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if(user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

// Middleware
app.use(function(req, res, next) {
  req.User = User;
  req.Post = Post;
  req.emberUser = function emberUser(user) {
    var newUser = {
      id: user.id,
      name: user.name
    };
    return newUser;
  };
  next();
});

function checkForAuthentication(req, res, next) {
  if( req.isAuthenticated() ) {
    return next();
  } else {
    return res.status(403).end();
  }
}

// Route implementation
var routes = require('./routes/index');

app.get('/api/logout', checkForAuthentication, routes.auth.logout);

app.get('/api/users', routes.auth.index);
app.get('/api/users/:id', routes.users.show);
app.post('/api/users', routes.users.create);

app.get('/api/posts', routes.posts.index);
app.post('/api/posts', checkForAuthentication, routes.posts.create);
app.delete('/api/posts/:id', routes.posts.delete);

// Mongoose
mongoose.connect('mongodb://localhost/telegram');

connection.once('open', function() {
  var server = app.listen(3000, function() {
      console.log('Listening on port %d', server.address().port);
  });
});
