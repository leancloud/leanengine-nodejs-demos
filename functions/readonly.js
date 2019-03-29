const AV = require('leanengine')
const _ = require('lodash')

/*
 * 热点只读数据缓存示例
 *
 * 在系统中有些数据是需要非常频繁地读取的，但这些数据量很小而且不常修改，比较适合整个放到 LeanCache 中
 *
 * 在这个示例中我们以缓存一个电商网站的商品分类信息为例。
 *
 * 安装依赖：
 *
 *   npm install lodash
 */

 const {redisClient} = require('../redis')
 const Category = AV.Object.extend('Category')

/* 设置特定分类的信息，如不存在会新建，会触发 afterSave 或 afterUpdate 的 Hook */
AV.Cloud.define('updateCategory', async request => {
  try {
    const category = await new AV.Query(Category).equalTo('name', req.params.name).first()

    if (category) {
      return category.save(request.params)
    } else {
      return new Category().save(request.body)
    }
  } catch (err) {
    if (err.code == 101) { // Class or object doesn't exists.
      return new Category().save(request.body)
    } else {
      throw err
    }
  }
})

/* 从 Redis 中获取分类信息，不会查询云存储 */
AV.Cloud.define('getCategories', async request => {
  const categories = await redisClient.hgetall('categories')
  return categories.map(AV.parseJSON)
})


/* Redis 中的数据是通过下面三个 Class Hook 来和云存储保持同步的 */

AV.Cloud.afterUpdate('Category', async request => {
  redisClient.hset('categories', request.object.get('name'), request.object.toFullJSON())
})

AV.Cloud.afterSave('Category', async request => {
  redisClient.hset('categories', request.object.get('name'), request.object.toFullJSON())
})

AV.Cloud.afterDelete('Category', async request => {
  redisClient.hdel('categories', request.object.get('name'))
})

/* 我们还可以设置一个一天的定时器，每天与云存储进行一次全量的同步，以免错过某个 Class Hook */
AV.Cloud.define('refreshCategories', async request => {
  const categories = await new AV.Query(Category).find()
  const categorieSerialized = _.mapValues(_.keyBy(categories, category => category.get('name')), object => object.toFullJSON())
  await redisClient.hmset('categories', categorieSerialized)
})
