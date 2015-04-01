var AV = require('cloudcode-nodejs-sdk');

AV.Cloud.define('hello', function(req, res) {
  if (req.params.name) {
    res.success('Hello~ ' + req.params.name);
  } else {
    res.success('Hello~ you are ...?');
  }
});

module.exports = AV.Cloud;
