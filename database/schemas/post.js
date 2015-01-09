var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
  body: String,
  createdAt: { type: Date, default: Date.now },
  creator: String,
  originalCreator: String
});

module.exports = postSchema;
