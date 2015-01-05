var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var md5 = require('MD5');
var nconf = require('nconf');
var passport = require('../../middleware/authentication');
var connection = require('../../database/database');
var User = connection.model('User');
var checkForAuthentication = require('../../middleware/ensureAuth');
var mailgun = require('mailgun-js')({apiKey: nconf.get('mailgunKey'), domain: nconf.get('mailgunDomain')});


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
        res.send({user: user.emberUser(req.user)});
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
        res.send({user: user.emberUser(req.user)});
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
        var randomPassword = makePass();
        var randomPasswordMd5 = md5(randomPassword);
        User.hashPassword(randomPasswordMd5, function(err, hash) {
          if(err) {
            return res.sendStatus(500);
          }
          if(!hash) {
            return res.sendStatus(500);
          }
          User.findOneAndUpdate({email: email}, {password: hash}, function(err, user) {
            if(err) {
              res.send(err);
            }
            var data = {
              from: 'postmaster@sandboxa66c118a321744cf8ad88c5441bc673f.mailgun.org',
              to: email,
              subject: 'Telegram reset password',
              text: 'We are reseting your password. Here it is: ' + randomPassword
            };
            mailgun.messages().send(data, function (err, body) {
              if(err) {
                res.send(err);
              }
              res.send( {user: user.emberUser()} );
            });
          });
        });
      break;
      default:
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

function makePass() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 10; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
