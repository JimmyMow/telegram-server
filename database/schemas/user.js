var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var md5 = require('MD5');

var userSchema = new Schema({
  id:  String,
  name: String,
  email:   String,
  picture: String,
  password: String,
  following: []
});

// var User = mongoose.connection.model('User', userSchema);

userSchema.methods.emberUser = function(loggedInUser) {
  var newUser = {
    id: this.id,
    name: this.name
  };

  if(loggedInUser) {
    if( loggedInUser.following.indexOf(this.id) != -1 ) {
      newUser.followedByCurrentUser = true;
    } else {
      newUser.followedByCurrentUser = false;
    }
  }
  return newUser;
};

userSchema.methods.checkPassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, res) {
    if(err) {
      return done(err);
    }
    return done(null, res);
  });
};

userSchema.methods.follow = function(whoToFollow, done) {
  this.model('User').findOneAndUpdate(
    { id: this.id },
    {$addToSet:
      { following: whoToFollow }
    }, function(err, user) {
    if(err) {
      return res.sendStatus(500);
    }
    res.send({user: user.emberUser(req.user)});
  });
};

userSchema.methods.unfollow = function(whoToUnfollow, done) {
  this.model('User').findOneAndUpdate(
    { id: this.id },
    {$pull:
      { following: whoToUnfollow }
    }, function(err, user) {
    if(err) {
      return done(err, null);
    }
    return done(null, user);
  });
};

userSchema.statics.hashPassword = function(password, done) {
  bcrypt.hash(password, 10, function(err, hash) {
    if(err) {
      return done(err, false);
    }
    return done(null, hash);
  });
}

userSchema.statics.resetPassword = function(email, randomPassword, done) {
  var randomPasswordMd5 = md5(randomPassword);
  var _this = this;
  this.hashPassword(randomPasswordMd5, function(err, hash) {
    if(err) {
      return done(err);
    }
    if(!hash) {
      return done(true);
    }
    _this.findOneAndUpdate({email: email}, {password: hash}, function(err, user) {
      if(err) {
        return done(err);
      }
      return done(null, randomPassword);
    });
  });
};

userSchema.statics.createUser = function(user, password, done) {
  this.hashPassword(password, function(err, hash) {
    if(err) {
      return done(err, null);
    }
    if(!hash) {
      return done(true, null);
    }
    user.password = hash;
    user.save(function(err, user){
      if(err){
        return done(err, null);
      }
      return done(null, user);
    });
  });
};

module.exports = userSchema;
