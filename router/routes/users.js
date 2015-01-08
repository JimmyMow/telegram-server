var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var randomstring = require('randomstring');
var logger = require('nlogger').logger(module);
var nconf = require('../../config/config');
var passport = require('../../middleware/authentication');
var connection = require('../../database/database');
var User = connection.model('User');
var ensureAuthentication = require('../../middleware/ensureAuth');
var mailgun = require('mailgun-js')({apiKey: nconf.get('mailgun').key, domain: nconf.get('mailgun').domain});
var emailObj = require('../../email/notification');

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
      return res.sendStatus(404);
      logger.error('User not found. User id:', req.params.id);
    }
    if(!user) {
      return res.sendStatus(404);
      logger.error('User not found. User id:', req.params.id);
    }
    return res.send({ user: user.emberUser(req.user) });
  });
});

router.put('/:id', ensureAuthentication, function(req, res) {
  switch(req.body.user.meta.operation) {
    case 'follow':
      handleFollowRequest(req, res);
    break;
    case 'unfollow':
      handleUnfollowRequest(req, res);
    break;
  }
});

router.post('/', function(req, res) {
  switch(req.body.user.meta.operation){
    case 'login':
      handleLogin(req, res);
    break;
    case 'reset_password':
      handlePasswordReset(req, res);
    break;
    default:
      handleSignup(req, res);
  }
});

module.exports = router;

function handleGetFollowingRequest(userId, req, res) {
  User.findOne({id: userId}, function(err, user) {
    if(err) {
      return res.sendStatus(500);
      logger.error('User not found. User id:', userId);
    }
    var userIds = user.following;
    User.find({
      id: { $in: userIds}
    }, function(err, users){
      if(err) {
        res.sendStatus(500);
        logger.error('Users not found. User ids:', userIds);
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
      logger.error('User not found. User id:', userId);
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

function handleLogin(req, res) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.sendStatus(500);
      logger.error('Could not authenticate because of error:', err);
    }
    if (!user) {
      return res.send({ user: false });
      logger.error('Could not authenticate because there is no user');
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.sendStatus(500);
        logger.error('Could not log in session:', err);
      }
      return res.send({ user: user.emberUser() });
    });
  })(req, res);
}

function handlePasswordReset(req, res) {
  var email = req.body.user.email;
  var randomPassword = randomstring.generate(10);
  User.resetPassword(email, randomPassword, function(err, password) {
    emailObj.sendPasswordReset(email, password, function(err, body) {
      if(err) {
        return res.send(err);
        logger.error('Could not reset password', err);
      }
      if(!body) {
        return res.sendStatus(500);
        logger.error('Could not reset password becuase there was no message body');
      }
      return res.send( {user: {}} );
    });
  });
}

function handleSignup(req, res) {
  var user = new User({
    id: req.body.user.id,
    name: req.body.user.name,
    email: req.body.user.email
  });
  User.createUser(user, req.body.user.password, function(err, user) {
    if(err) {
      return res.send(err);
      logger.error('Could not create user:', err);
    }
    if(!user) {
      return res.sendStatus(500);
      logger.error('Could not create user becuase no user was returned');
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.send(err);
        logger.error('Could not log in session:', err);
      }
      return res.send({ user: user.emberUser() });
    });
  });
}

function handleFollowRequest(req, res) {
  var whoToFollow = req.body.user.meta.userId;
  req.user.follow(whoToFollow, function(err, user) {
    if(err) {
      return res.send(err);
      logger.error('Could not follow user:', err);
    }
    return res.send({ user: user.emberUser() });
  });
}

function handleUnfollowRequest(req, res) {
  var whoToUnfollow = req.body.user.meta.userId;
  req.user.unfollow(whoToUnfollow, function(err, user) {
    if(err) {
      return res.send(err);
      logger.error('Could not unfollow user:', err);
    }
    return res.send({ user: user.emberUser() });
  });
}
