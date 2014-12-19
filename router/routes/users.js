var express = require('express');
var router = express.Router();
var passport = require('../../middleware/authentication');
var connection = require('../../database/database');
var User = connection.model('User');

router.get('/', function(req, res) {
  switch(req.query.operation){
    case 'login':
    passport.authenticate('local', function(err, user, info) {
        if (err) {
          return res.status(500).end();
        }
        if (!user) {
          return res.send({ users: [] });
        }
        req.logIn(user, function(err) {
          if (err) {
            return res.status(500).end();
          }
          return res.send({ users: [user.emberUser()] });
        });
      })(req, res);
      break;
    case 'follow':
      var whoToFollow = req.query.follow;
      User.findOneAndUpdate(
        { id: req.user.id },
        {$addToSet:
          { following: whoToFollow }
        }, function(err, user) {
          if(err) {
            return res.sendStatus(500);
          }
          res.send({users: [user.emberUser()]});
        });
      break;
    case 'unfollow':
      var whoToUnfollow = req.query.unfollow;
      User.findOneAndUpdate(
        { id: req.user.id },
        {$pull:
          { following: whoToUnfollow }
        }, function(err, user) {
          if(err) {
            return res.sendStatus(500);
          }
          res.send({users: [user.emberUser()]});
        });
      break;
    case 'following':
      var userIds;
      User.findOne({id: req.user.id}, function(err, user) {
        if(err) {
          return res.sendStatus(500);
        }
        var userIds = user.following;
        User.find({
          id: { $in: userIds}
        }, function(err, users){
          if(err) {
            res.sendStatus(500);
            res.send(err);
          }
          var emberUsers = users.map(function(user) {
            return user.emberUser();
          });
          return res.send({ users: emberUsers });
        });
      });
      break;
    case 'followers':
      User.find({following: 'bill'}, function(err, users) {
        if(err) {
          return res.sendStatus(500);
        }
        var emberUsers = users.map(function(user) {
          return user.emberUser();
        });
        return res.send({ users: emberUsers });
      });
      break;
    case 'authenticate':
      if( req.isAuthenticated() ) {
        return res.send({ users: [req.user.emberUser()] });
      } else {
        return res.send({ users: [] });
      }
      break;
    default:
      User.find(function(err, users) {
        if(err) {
          return res.sendStatus(500);
        }
        var emberUsers = users.map(function(user) {
          return user.emberUser();
        });
        return res.send({ users: emberUsers });
      });
  }
});

router.get('/:id', function(req, res) {
  User.findOne({"id": req.params.id}, function(err, user) {
    if(err) {
      return res.status(404).end();
    }
    return res.send({ user: user });
  });
});

router.post('/', function(req, res) {
  if(req.body.user.meta.operation === 'login') {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
          return res.status(500).end();
        }
        if (!user) {
          return res.send({ user: null });
        }
        req.logIn(user, function(err) {
          if (err) {
            return res.status(500).end();
          }
          return res.send({ user: user.emberUser() });
        });
      })(req, res);
  } else {
    var user = new User({
      id: req.body.user.id,
      name: req.body.user.name,
      email: req.body.user.email,
      password: req.body.user.password
    })
    user.save(function(err, user){
      if(err) {
        return res.status(500).end();
      }
      return res.send({ user: user });
    });
  }
});

module.exports = router;
