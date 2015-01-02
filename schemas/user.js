var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
  id:  String,
  name: String,
  email:   String,
  picture: String,
  password: String,
  following: []
});

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

userSchema.statics.hashPassword = function(password, done) {
  bcrypt.hash(password, 10, function(err, hash) {
    if(err) {
      return done(err, false);
    }
    return done(null, hash);
  });
}

module.exports = userSchema;
