var app = require('../server');

module.exports = function (app) {
  app.use('/api/posts', require('./routes/posts'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/logout', require('./routes/posts'));
};
