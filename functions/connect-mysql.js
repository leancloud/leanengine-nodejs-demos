'use strict';

const AV = require('leanengine');
const Promise = require('bluebird');
const mysql = require('mysql');

/*
 * An example of connecting to LeanDB MySQL.
 *
 * Install dependencies:
 * 
 *     npm install --save bluebird mysql
 */

const mysqlPool = Promise.promisifyAll(mysql.createPool({
  host: process.env['MYSQL_HOST_MYRDB'],
  port: process.env['MYSQL_PORT_MYRDB'],
  user: process.env['MYSQL_ADMIN_USER_MYRDB'],
  password: process.env['MYSQL_ADMIN_PASSWORD_MYRDB'],
  database: 'test',
  connectionLimit: 10
}));

AV.Cloud.define('connectMysql', async request => {
    rows = await mysqlPool.queryAsync('SELECT 1 + 1 AS solution');
    return { solution: rows[0].solution };
});