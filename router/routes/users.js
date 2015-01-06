var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var nconf = require('../../config/config');
var randomstring = require('randomstring');
var passport = require('../../middleware/authentication');
var connection = require('../../database/database');
var User = connection.model('User');
var ensureAuthentication = require('../../middleware/ensureAuth');
var mailgun = require('mailgun-js')({apiKey: nconf.get('mailgun').key, domain: nconf.get('mailgun').domain});

router.get('/', function(req, res) {
  switch(req.query.operation){
    case 'following':
      handleGetFollowingRequest(req.query.user, req, res);
    break;
    case 'followers':
      handleGetFollowersRequest(req.query.user, req, res);
      break;
    case 'authenticate':
      handleCheckAuthRequest(req, res);
    break;
    default:
      res.sendStatus(400);
  }
});

router.get('/:id', function(req, res) {
  User.findOne({"id": req.params.id}, function(err, user) {
    if(err) {
      return res.status(404).end();
    }
    return res.send({ user: user.emberUser(req.user) });
  });
});

router.put('/:id', ensureAuthentication, function(req, res) {
  switch(req.body.user.meta.operation) {
    case 'follow':
      var whoToFollow = req.body.user.meta.userId;
      req.user.follow(whoToFollow, function(err, user) {
        if(err) {
          return res.send(err);
        }
        return res.send({ user: user.emberUser() });
      });
    break;
    case 'unfollow':
      var whoToUnfollow = req.body.user.meta.userId;
      req.user.unfollow(whoToUnfollow, function(err, user) {
        if(err) {
          return res.send(err);
        }
        return res.send({ user: user.emberUser() });
      });
    break;
  }
});

router.post('/', function(req, res) {
  switch(req.body.user.meta.operation){
    case 'login':
      passport.authenticate('local', function(err, user, info) {
          if (err) {
            return res.sendStatus(500);
          }
          if (!user) {
            return res.send({ user: false });
          }
          req.logIn(user, function(err) {
            if (err) {
              return res.sendStatus(500);
            }
            return res.send({ user: user.emberUser() });
          });
        })(req, res);
      break;
      case 'reset_password':
        var email = req.body.user.email;
        var randomPassword = randomstring.generate(10);
        User.resetPassword(email, randomPassword, function(err, password) {
          var data = {
            from: nconf.get('mailgun').from,
            to: email,
            subject: 'Telegram reset password',
            text: 'We are reseting your password. Here it is: ' + password
          };
          mailgun.messages().send(data, function (err, body) {
            if(err) {
              console.log(err);
              return res.send(err);
            }
            return res.send( {user: {}} );
          });
        });
      break;
      default:
      var user = new User({
        id: req.body.user.id,
        name: req.body.user.name,
        email: req.body.user.email
      });
      User.createUser(user, req.body.user.password, function(err, user) {
        if(err) {
          return res.send(err);
        }
        if(!user) {
          return res.sendStatus(500);
        }
        req.logIn(user, function(err) {
          if (err) {
            return res.send(err);
          }
          return res.send({ user: user.emberUser() });
        });
      });
    }
});

module.exports = router;

function handleGetFollowingRequest(userId, req, res) {
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
        return user.emberUser(req.user);
      });
      return res.send({ users: emberUsers });
    });
  });
}

function handleGetFollowersRequest(userId, req, res) {
  User.find({following: userId}, function(err, users) {
    if(err) {
      return res.sendStatus(500);
    }
    var emberUsers = users.map(function(user) {
      return user.emberUser(req.user);
    });
    return res.send({ users: emberUsers });
  });
}

function handleCheckAuthRequest(req, res){
  if( req.isAuthenticated() ) {
    return res.send({ users: [req.user.emberUser()] });
  } else {
    return res.send({ users: [] });
  }
}
