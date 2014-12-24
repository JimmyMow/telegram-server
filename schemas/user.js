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
  return newUser;
};

userSchema.methods.checkPassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, res) {
    if(err) {
      return done(null, false, { message: 'Incorrect password' });
    }
    return done(null, res);
  });
};

userSchema.statics.hashPassword = function(password, done) {
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
        if(err) {
          return done(err, false);
        }
        return done(null, hash);
      });
  });
}

module.exports = userSchema;
