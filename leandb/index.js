'use strict';

const Promise = require('bluebird');
const router = require('express').Router();
const mysql = require('mysql');

const mysqlPool = Promise.promisifyAll(mysql.createPool({
  host: process.env['MYSQL_HOST_MYRDB'],
  port: process.env['MYSQL_PORT_MYRDB'],
  user: process.env['MYSQL_ADMIN_USER_MYRDB'],
  password: process.env['MYSQL_ADMIN_PASSWORD_MYRDB'],
  database: 'test',
  connectionLimit: 10
}));

router.get('/mysql', function(req, res) {
  mysqlPool.queryAsync('SELECT 1 + 1 AS solution').then( rows => {
    res.json({solution: rows[0].solution});
  }).catch( err => {
    res.status(500).json({error: error});
  });
});


module.exports = router;