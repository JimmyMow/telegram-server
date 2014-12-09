var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/telegram');
var connection = mongoose.connection;
var Schema = mongoose.Schema;

var userSchema = new Schema({
  id:  String,
  name: String,
  email:   String,
  picture: String,
  password: String
});

var postSchema = new Schema({
  id:  String,
  body: String,
  createdAt: { type: Date, default: Date.now },
  user: String,
  repost: String
});

var User = connection.model('User', userSchema);
var Post = connection.model('Post', postSchema);

// Passport
var passport = require('passport')
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

// Middleware functions
function checkForAuthentication(req, res, next) {
  if( req.isAuthenticated() ) {
    return next();
  } else {
    return res.status(403).end();
  }
}

// Route implementation
app.get('/api/users', function(req, res) {
  if(req.query.operation === 'login') {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return res.status(500).end(); }
      if (!user) { return res.send({ users: [] }); }
      req.logIn(user, function(err) {
        if (err) { return res.status(500).end(); }
        return res.send({ users: [user] });
      });
    })(req, res);
  } else if(req.query.isAuthenticated) {
    if( req.isAuthenticated() ) {
      return res.send({ users: [req.user] });
    } else {
      return res.send({ users: [] });
    }
  } else {
    User.find(function(err, users) {
      if(err) { return res.send(err); }

      return res.send({ users: users });
    });
  }
});

app.get('/api/logout', checkForAuthentication, function(req, res) {
  req.logout();
  return res.send(true);
});

app.get('/api/posts', function(req, res) {
  var username = req.query.user;

  if(username) {
    Post.find( { $or : [ { $and : [ { user : username }, { repost : null } ] }, { repost: username } ] }, function(err, posts) {
      if(err) { return res.send(err); }

      return res.send( {posts: posts} );
    });
  } else {
    Post.find(function(err, posts) {
      if(err) { return res.send(err); }

      return res.send( {posts: posts} );
    });
  }
});

app.get('/api/users/:id', function(req, res) {
  User.findOne({"id": req.params.id}, function(err, user) {
    if(err) { return res.status(404).end(); }

    return res.send({ user: user });
  });
});

app.post('/api/users', function(req, res) {
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

app.post('/api/posts', checkForAuthentication, function(req, res) {
  if(req.user.id === req.body.post.user || req.user.id === req.body.post.repost) {
    var post = new Post({
      body: req.body.post.body,
      user: req.body.post.user,
      repost: req.body.post.repost,
      createdAt: req.body.post.createdAt
    });

    post.save(function(err, post){
      if(err) { return res.status(500).end(); }
      return res.send({ post: post });
    });
  } else {
    return res.status(403).end();
  }
});

app.delete('/api/posts/:id', function(req, res) {
  var postID = req.params.id;

  User.remove({id: postID}, function(err, result) {
    if(err) { return res.send(err); }

    return res.send({});
  });
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
