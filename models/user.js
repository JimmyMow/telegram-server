var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  id:  String,
  name: String,
  email:   String,
  picture: String,
  password: String
});

module.exports = mongoose.model('User', userSchema);
