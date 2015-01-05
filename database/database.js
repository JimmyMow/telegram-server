var mongoose = require('mongoose');
var userSchema = require("../schemas/user");
var postSchema = require("../schemas/post");
var nconf = require('nconf');

mongoose.connection.model('User', userSchema);
mongoose.connection.model('Post', postSchema);

mongoose.connect(nconf.get('database'));

module.exports = mongoose.connection;
