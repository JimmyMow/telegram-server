var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
  body: String,
  createdAt: { type: Date, default: Date.now },
  user: String,
  owner: String
});

postSchema.methods.emberPost = function() {
  var newPost = {
    _id: this._id,
    body: this.body,
    createdAt: this.createdAt
  };
  if(this.owner) {
    newPost.user = this.owner;
    newPost.repost = this.user;
  } else {
    newPost.user = this.user;
  }
  return newPost;
};

module.exports = postSchema;
