var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
  id:  String,
  body: String,
  createdAt: { type: Date, default: Date.now },
  user: String,
  repost: String
});

module.exports = mongoose.model('Post', postSchema);
