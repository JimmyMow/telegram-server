var express = require('express');
var router = express.Router();
var logger = require('nlogger').logger(module);
var connection = require('../../database/database');
var Post = connection.model('Post');
var ensureAuthentication = require('../../middleware/ensureAuth');

router.get('/', function(req, res) {
  switch (req.query.operation) {
    case 'userProfile':
      handleUserProfile(req, res);
    break;
    case 'dashboard':
      handleDashboard(req, res);
    break;
    default:
      res.sendStatus(400);
    break;
  }
});

router.post('/', ensureAuthentication, function(req, res) {
  var post = {
    body: req.body.post.body,
    createdAt: req.body.post.createdAt
  }
  if(req.body.post.repost) {
    post.user = req.body.post.repost;
    post.owner = req.body.post.user;
  } else {
    post.user = req.body.post.user;
  }
  if(req.user.id === req.body.post.user || req.user.id === req.body.post.repost) {
    Post.create(post, function(err, post) {
      if(err) {
        return res.send(err);
        logger.error('Could not craete post:', err);
      }
      return res.send({ post: post.emberPost() });
    });
  } else {
    return res.sendStatus(403);
  }
});

router.delete('/:id', function(req, res) {
  var postID = req.params.id;
  Post.findByIdAndRemove(postID, function(err, result) {
    if(err) {
      return res.sendStatus(500);
      logger.error('Could not find or remove post. Post id:', postID);
    }
    return res.send({});
  });
});

module.exports = router;

function handleUserProfile(req, res) {
  var username = req.query.user;
  Post.find( { user : username }, function(err, posts) {
    if(err) {
      return res.send(err);
      logger.error('Could not find post:', err);
    }
    var emberPosts = posts.map(function(post) {
      return post.emberPost();
    });
    return res.send( {posts: emberPosts} );
  });
}

function handleDashboard(req, res) {
  if ( req.isAuthenticated() ) {
    var postUsers = req.user.following.push(req.user.id);
    Post.find( { user : { $in : req.user.following } }, function(err, posts){
      if(err){
        return res.send(err);
        logger.error('Could not find post:', err);
      }
      var emberPosts = posts.map(function(post) {
        return post.emberPost();
      });
      return res.send( {posts: emberPosts} );
    });
  } else {
    res.sendStatus(403);
  }
}
