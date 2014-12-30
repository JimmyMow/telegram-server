var express = require('express');
var router = express.Router();
var connection = require('../../database/database');
var Post = connection.model('Post');
var checkForAuthentication = require('../../middleware/ensureAuth');

router.get('/', function(req, res) {
  var username = req.query.user;
  if(username) {
    Post.find( { $or : [ { $and : [ { user : username }, { repost : null } ] }, { repost: username } ] }, function(err, posts) {
      if(err) {
        return res.send(err);
      }
      return res.send( {posts: posts} );
    });
  } else if(req.query.operation === 'dashboard') {
    var postUsers = req.user.following.push(req.user.id);
    Post.find( { user : { $in : req.user.following } }, function(err, posts){
      if(err){
        return res.send(err);
      }
      return res.send( {posts: posts} );
    });

  } else {
    Post.find(function(err, posts) {
      if(err) {
        return res.sendStatus(500);
      }
      return res.send( {posts: posts} );
    });
  }
});

router.post('/', checkForAuthentication, function(req, res) {
  if(req.user.id === req.body.post.user || req.user.id === req.body.post.repost) {
    Post.create(req.body.post, function(err, post) {
      if(err) {
        return res.status(500).end();
      }
      return res.send({ post: post });
    });
  } else {
    return res.status(403).end();
  }
});

router.delete('/:id', function(req, res) {
  var postID = req.params.id;
  Post.findByIdAndRemove(postID, function(err, result) {
    if(err) {
      return res.sendStatus(500);
    }
    return res.send({});
  });
});

module.exports = router;
