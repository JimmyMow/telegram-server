exports.index = function(req, res) {
  var username = req.query.user;
  if(username) {
    // Post.find( { user : username }, function(err, posts) {
    req.Post.find( { $or : [ { $and : [ { user : username }, { repost : null } ] }, { repost: username } ] }, function(err, posts) {
      if(err) { return res.send(err); }
      return res.send( {posts: posts} );
    });
  } else {
    req.Post.find(function(err, posts) {
      if(err) { return res.send(err); }
      return res.send( {posts: posts} );
    });
  }
};

exports.create = function(req, res) {
  if(req.user.id === req.body.post.user || req.user.id === req.body.post.repost) {
    var post = new req.Post({
      body: req.body.post.body,
      user: req.body.post.user,
      repost: req.body.post.repost,
      createdAt: req.body.post.createdAt
    });

    post.save(function(err, post){
      if(err) { return res.status(500).end(); }
      return res.send({ post: post });
    });
  } else {
    return res.status(403).end();
  }
};

exports.delete = function(req, res) {
  var postID = req.params.id;
  req.Post.findByIdAndRemove(postID, function(err, result) {
    if(err) { return res.send(err); }
    return res.send({});
  });
};
