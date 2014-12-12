var mongoose = require('mongoose');
var userSchema = require("../schemas/user");
var postSchema = require("../schemas/post");

mongoose.connection.model('User', userSchema);
mongoose.connection.model('Post', postSchema);

mongoose.connect('mongodb://localhost/telegram');

module.exports = mongoose.connection;
