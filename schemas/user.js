var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  id:  String,
  name: String,
  email:   String,
  picture: String,
  password: String
});

userSchema.methods.emberUser = function emberUser() {
  var newUser = {
    id: this.id,
    name: this.name
  };
  return newUser;
};

module.exports = userSchema;
