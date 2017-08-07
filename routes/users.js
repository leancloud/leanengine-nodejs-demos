var express = require('express');
var router = express.Router();

var AV = require('leanengine');

router.get('/login', function(req, res) {
  var errMsg = req.query.errMsg;
  res.render('users/login', {title: '用户登录', errMsg: errMsg});
});

router.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  AV.User.logIn(username, password).then(function(user) {
    res.saveCurrentUser(user);
    res.redirect('/todos');
  }, function(err) {
    res.redirect('/users/login?errMsg=' + err.message);
  }).catch(next);
});

router.get('/register', function(req, res) {
  var errMsg = req.query.errMsg;
  res.render('users/register', {title: '用户注册', errMsg: errMsg});
});

router.post('/register', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  if (!username || username.trim().length == 0
    || !password || password.trim().length == 0) {
    return res.redirect('/users/register?errMsg=用户名或密码不能为空');
  }
  var user = new AV.User();
  user.set('username', username);
  user.set('password', password);
  user.signUp().then(function(user) {
    res.saveCurrentUser(user);
    res.redirect('/todos');
  }, function(err) {
    res.redirect('/users/register?errMsg=' + err.message);
  }).catch(next);
});

router.get('/logout', function(req, res) {
  req.currentUser.logOut();
  res.clearCurrentUser();
  return res.redirect('/users/login');
});

module.exports = router;
