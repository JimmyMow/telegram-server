var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
// Route implementation
app.get('/api/users', function(req, res) {
  console.log(req.query);

  if(req.query.operation === 'login') {
    var user;
    for(var i=0; i < users.length; i++) {
      if(users[i].id === req.query.id) {
        user = users[i];
      }
    }

    if(!user) {
      return res.status(404).end();
    }

    if(user.password === req.query.password) {
      res.send( {users: [user]} );
    } else {
      res.status(403).end();
    }

  } else {
    res.send({users: users});
  }
});

app.get('/api/posts', function(req, res) {
  res.send( {posts: posts} );
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
  console.log(req.body);
  res.status(200).end();
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});


 var posts = [
    {
      id: 1,
      body: "Bobby Fischer is the greatest chess player of all time",
      createdAt: new Date(),
      user: "JimmyMow",
      repost: "Fischer"
    },
    {
      id: 2,
      body: "I am the greatest player of all time",
      createdAt: new Date(),
      user: "Fischer",
      repost: null
    },
    {
      id: 3,
      body: "I'm the champ #FuckBorris",
      createdAt: new Date(),
      user: "Fischer",
      repost: null
    },
    {
      id: 4,
      body: "Let's hoop",
      createdAt: new Date(),
      user: "JimmyMow",
      repost: null
    }
  ];

  var users = [
    {
      id: "JimmyMow",
      name: "Jack Mallers",
      email: "jimmymowschess@gmail.com",
      picture: "https://lh6.googleusercontent.com/-hBbaFeCzpFs/AAAAAAAAAAI/AAAAAAAAANA/r02VbznNRIs/w48-c-h48/photo.jpg",
      password: "12345678"
    },
    {
      id: "Fischer",
      name: "Bobby Fischer",
      email: "bobbyfischer@gmail.com",
      picture: "https://pbs.twimg.com/profile_images/1264692865/bobby_fischer_01_normal.jpg",
      password: "12345678"
    }
  ];

