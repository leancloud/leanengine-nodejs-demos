const AV = require('leanengine')
const Redis = require('ioredis')
const assert = require('assert')
const marked = require('marked')
const _ = require('lodash')
const mysql = require('mysql')
const express = require('express')
const Promise = require('bluebird')
const {MongoClient} = require('mongodb')

const app = express()

app.use(AV.express())

app.get('/', async (req, res, next) => {
  try {
    let result = '# Stateful Tester\n'

    result += await getRedisInfos()
    result += await getMysqlInfos()
    result += await getMongoInfos()

    res.send(marked(result))
  } catch (err) {
    next(err)
  }
})

app.use(function(err, req, res, _next) {
  var statusCode = err.status || 500

  if (statusCode === 500) {
    console.error(err.stack || err)
  }

  res.status(statusCode)
  res.json({
    error: err.message
  })
})

async function getRedisInfos() {
  let result = ''

  const redisKeys = _.filter(_.keys(process.env), name => {
    return name.startsWith('REDIS_URL_')
  })

  for (const redisKey of redisKeys) {
    const redisString = process.env[redisKey]

    console.log('connecting to Redis', redisKey, redisString)

    result += `## ${redisKey.slice('REDIS_URL_'.length)}\n`

    let redisClient

    try {
      redisClient = new Redis(redisString)
      const randomString = new Date().toString()

      await redisClient.info()
      await redisClient.set('stateful-tester', randomString)
      assert.strictEqual(await redisClient.get('stateful-tester'), randomString)

      result += `OK\n`
    } catch (err) {
      result += `\`${err.message}\`\n`
    } finally {
      redisClient.quit()
    }
  }

  return result
}

async function getMysqlInfos() {
  let result = ''

  const mysqlKeys = _.filter(_.keys(process.env), name => {
    return name.startsWith('MYSQL_HOST_')
  })

  for (const mysqlKey of mysqlKeys) {
    const mysqlName = mysqlKey.slice('MYSQL_HOST_'.length)

    const mysqlOptions = {
      host: process.env[`MYSQL_HOST_${mysqlName}`],
      port: process.env[`MYSQL_PORT_${mysqlName}`],
      user: process.env[`MYSQL_ADMIN_USER_${mysqlName}`],
      password: process.env[`MYSQL_ADMIN_PASSWORD_${mysqlName}`],
      database: 'test',
    }

    console.log('connecting to MySQL', mysqlName, JSON.stringify(mysqlOptions))

    result += `## ${mysqlName}\n`

    let mysqlPool

    try {
      mysqlPool = Promise.promisifyAll(mysql.createPool(mysqlOptions))

      const rows = await mysqlPool.queryAsync('SELECT 1 + 1 AS solution')

      assert.strictEqual(rows[0].solution, 2)

      result += `OK\n`
    } catch (err) {
      result += `\`${err.message}\`\n`
    } finally {
      mysqlPool.end()
    }
  }

  return result
}

async function getMongoInfos() {
  let result = ''

  const mongoKeys = _.filter(_.keys(process.env), name => {
    return name.startsWith('MONGODB_URL_')
  })

  for (const mongoKey of mongoKeys) {
    const mongoString = process.env[mongoKey]

    console.log('connecting to MongoDB', mongoKey, mongoString)

    result += `## ${mongoKey.slice('MONGODB_URL_'.length)}\n`

    const mongoClient = new MongoClient(mongoString, {useUnifiedTopology: true})

    try {
      await mongoClient.connect()

      await mongoClient.db('test').command({dbStats: 1})

      result += `OK\n`
    } catch (err) {
      result += `\`${err.message}\`\n`
    } finally {
      mongoClient.close()
    }
  }

  return result
}

module.exports = app
