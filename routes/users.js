exports.show = function(req, res) {
  req.User.findOne({"id": req.params.id}, function(err, user) {
    if(err) { return res.status(404).end(); }
    return res.send({ user: user });
  });
};

exports.create = function(req, res) {
  var user = new req.User({
    id: req.body.user.id,
    name: req.body.user.name,
    email: req.body.user.email,
    password: req.body.user.password
  })
  user.save(function(err, user){
    if(err) { return res.status(500).end(); }
    return res.send({ user: user });
  });
};
