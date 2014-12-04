var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');

// Passport
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
    usernameField: 'id',
  },
  function(username, password, done) {
    var user;
    for(var i=0; i < users.length; i++) {
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

app.use(bodyParser.json());
// Route implementation
app.get('/api/users', function(req, res) {
  if(req.query.operation === 'login') {
  //   var user;
  //   for(var i=0; i < users.length; i++) {
  //     if(users[i].id === req.query.id) {
  //       user = users[i];
  //     }
  //   }
    console.log(req.query);
    passport.authenticate('local'),
    function(req, res) {
      res.send({ users: [user] });
    }

    // if(!user) {
    //   return res.status(404).end();
    // }

    // if(user.password === req.query.password) {
    //   res.send( {users: [user]} );
    // } else {
    //   res.status(403).end();
    // }

  } else {
    res.send({users: users});
  }
});

app.get('/api/posts', function(req, res) {
  var userPosts = [], username = req.query.user;

  if(username) {
    for(var i=0; i < posts.length; i++) {
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

  for(var i=0; i < users.length; i++) {
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

app.post('/api/posts', function(req, res) {
  var post = req.body.post;
  post.id = posts.length + 1;
  posts.push(post);

  res.send({post: post});
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

app.delete('/api/posts/:id', function(req, res) {
  var postID = parseInt(req.params.id);

  for(var i=0; i < posts.length; i++) {
    if(posts[i].id === postID) {
      var index = posts.indexOf(posts[i]);
      posts.splice(index, 1);
      res.send({});
    }
  }
  res.status(500).end();
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

