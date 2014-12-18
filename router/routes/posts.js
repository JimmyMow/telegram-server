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
  } else {
    Post.find(function(err, posts) {
      if(err) {
        res.sendStatusCode(500);
        return res.send(err);
      }
      return res.send( {posts: posts} );
    });
  }
});

router.post('/', checkForAuthentication, function(req, res) {
  if(req.user.id === req.body.post.user || req.user.id === req.body.post.repost) {
    var post = new Post({
      body: req.body.post.body,
      user: req.body.post.user,
      repost: req.body.post.repost,
      createdAt: req.body.post.createdAt
    });

    post.save(function(err, post){
      if(err) {
        res.sendStatusCode(500);
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
      res.sendStatusCode(500);
      return res.send(err);
    }
    return res.send({});
  });
});

module.exports = router;
