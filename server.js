var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');

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
  for(var i = 0; i < users.length; i++) {
    if(users[i].id === id) {
      return done(null, users[i]);
    }
  }
  done(null, null);
});

passport.use(new LocalStrategy({
    usernameField: 'id',
  },
  function(username, password, done) {
    var user = null;
    for(var i = 0; i < users.length; i++) {
      if(users[i].id === username){
        user = users[i]
      }
    }

    if(!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    if(user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user);
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
  } else {
    res.send({ users: users });
  }
});

app.get('/api/logout', checkForAuthentication, function(req, res) {
  req.logout();
  return res.send(true);
});

app.get('/api/posts', function(req, res) {
  var userPosts = []
  var username = req.query.user;

  if(username) {
    for(var i = 0; i < posts.length; i++) {
      if( (posts[i].user === username && posts[i].repost === null) || (posts[i].repost === username) ) {
        userPosts.push(posts[i]);
      }
    }
    res.send( {posts: userPosts} );
  } else {
    res.send( {posts: posts} );
  }
});

app.get('/api/users/:id', function(req, res) {
  var userID = req.params.id;

  for(var i = 0; i < users.length; i++) {
    if(users[i].id === userID) {
      return res.send( {user: users[i]} );
    }
  }
  res.status(404).end();
});

app.post('/api/users', function(req, res) {
  var user = req.body.user;
  users.push(user);
  res.send({ user: user });
});

app.post('/api/posts', checkForAuthentication, function(req, res) {
  if(req.user.id === req.body.post.user) {
    var post = req.body.post;
    post.id = posts.length + 1;
    posts.push(post);

    return res.send({post: post});
  } else {
    return res.status(403).end();
  }
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

app.delete('/api/posts/:id', function(req, res) {
  var postID = req.params.id;
  var index = null;

  for(var i = 0; i < posts.length; i++) {
    if(posts[i].id == postID) {
      index = posts.indexOf(posts[i]);
      posts.splice(index, 1);
      res.send({});
    }
  }

  if(index === null) {
    res.status(500).end();
  }
});


 var posts = [
    {
      id: 1,
      body: 'Bobby Fischer is the greatest chess player of all time',
      createdAt: new Date(),
      user: 'JimmyMow',
      repost: 'Fischer'
    },
    {
      id: 2,
      body: 'I am the greatest player of all time',
      createdAt: new Date(),
      user: 'Fischer',
      repost: null
    },
    {
      id: 3,
      body: 'I\'m the champ #FuckBorris',
      createdAt: new Date(),
      user: 'Fischer',
      repost: null
    },
    {
      id: 4,
      body: 'Let\'s hoop',
      createdAt: new Date(),
      user: 'JimmyMow',
      repost: null
    },
    {
      id: 5,
      body: 'Bobby Fischer is the greatest chess player of all time',
      createdAt: new Date(),
      user: 'JimmyMow',
      repost: null
    }
  ];

  var users = [
    {
      id: 'JimmyMow',
      name: 'Jack Mallers',
      email: 'jimmymowschess@gmail.com',
      picture: 'https://lh6.googleusercontent.com/-hBbaFeCzpFs/AAAAAAAAAAI/AAAAAAAAANA/r02VbznNRIs/w48-c-h48/photo.jpg',
      password: '12345678'
    },
    {
      id: 'Fischer',
      name: 'Bobby Fischer',
      email: 'bobbyfischer@gmail.com',
      picture: 'https://pbs.twimg.com/profile_images/1264692865/bobby_fischer_01_normal.jpg',
      password: '12345678'
    }
  ];

