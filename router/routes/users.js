var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var passport = require('../../middleware/authentication');
var connection = require('../../database/database');
var User = connection.model('User');
var checkForAuthentication = require('../../middleware/ensureAuth');

router.get('/', function(req, res) {
  switch(req.query.operation){
    case 'following':
      following(req.query.user, req, res);
    break;
    case 'followers':
      followers(req.query.user, req, res);
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

router.put('/:id', checkForAuthentication, function(req, res) {
  switch(req.body.user.meta.operation) {
    case 'follow':
      var whoToFollow = req.body.user.meta.userId;
      User.findOneAndUpdate(
        { id: req.user.id },
        {$addToSet:
          { following: whoToFollow }
        }, function(err, user) {
        if(err) {
          return res.sendStatus(500);
        }
        res.send({user: user.emberUser()});
      });
    break;
    case 'unfollow':
      var whoToUnfollow = req.body.user.meta.userId;
      User.findOneAndUpdate(
        { id: req.user.id },
        {$pull:
          { following: whoToUnfollow }
        }, function(err, user) {
        if(err) {
          return res.sendStatus(500);
        }
        res.send({user: user.emberUser()});
      });
    break;
  }
});

router.post('/', function(req, res) {
  if(req.body.user.meta.operation === 'login') {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
          return res.status(500).end();
        }
        if (!user) {
          return res.send({ user: false });
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
      email: req.body.user.email
    })

    User.hashPassword(req.body.user.password, function(err, hash) {
      if(err) {
        return res.sendStatus(500);
      }
      if(!hash) {
        return res.sendStatus(500);
      }
      user.password = hash;

      user.save(function(err, user){
        req.logIn(user, function(err) {
          if (err) {
            return res.status(500).end();
          }
          return res.send({ user: user.emberUser() });
        });
      });
    });

  }
});

module.exports = router;

function following(userId, req, res) {
  User.findOne({id: userId}, function(err, user) {
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
}

function followers(userId, req, res) {
  User.find({following: userId}, function(err, users) {
    if(err) {
      return res.sendStatus(500);
    }
    var emberUsers = users.map(function(user) {
      return user.emberUser();
    });
    return res.send({ users: emberUsers });
  });
}
