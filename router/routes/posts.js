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
  if(req.user.id === req.body.post.creator) {
    Post.create(req.body.post, function(err, post) {
      if(err) {
        return res.send(err);
        logger.error('Could not craete post:', err);
        console.log(err);
      }
      console.log("HERE");
      return res.send({ post: post });
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
  Post.find( { creator : username }, function(err, posts) {
    if(err) {
      return res.send(err);
      logger.error('Could not find post:', err);
    }

    return res.send( {posts: posts} );
  });
}

function handleDashboard(req, res) {
  if ( req.isAuthenticated() ) {
    var postUsers = req.user.following.push(req.user.id);
    Post.find( { creator : { $in : req.user.following } }, function(err, posts){
      if(err){
        return res.send(err);
        logger.error('Could not find post:', err);
      }
      return res.send( {posts: posts} );
    });
  } else {
    res.sendStatus(403);
  }
}
