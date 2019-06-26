const AV = require('leanengine')
const Promise = require('bluebird')
const _ = require('underscore')


/*
 * 缓存关联数据示例
 *
 * 这种模式适合被关联的数据量少、查询频繁、不常修改，或者关联结构非常复杂（需要多次查询或需要对被关联对象做计算）的情况，
 * 应用合理的话可以减少对云存储的查询次数、缩短请求的处理时间，但要注意当关联对象被修改时要及时刷新缓存，否则会出现数据不同步的情况。
 *
 * 例如我们有一个社区，Post 代表一篇文章，author 字段是一个 User 对象，代表文章的作者。
 * 在这个社区中活跃用户的数量和文章数量相比较小，且用户对象上的数据也不常变化（可以通过 User 的 afterUpdate Hook 来刷新缓存）。
 */

const {redisClient} = require('../redis')
const Post = AV.Object.extend('Post')

/* 生成测试数据，创建 100 个 Post, 从 User 表中随机选择用户作为 author */
AV.Cloud.define('createPostSamples', async request => {
  const users = await new AV.Query(AV.User).find()

  await AV.Object.saveAll(_.range(0, 100).map( () => {
    const post = new Post()
    post.set('author', _.sample(users))
    return post
  }))
})

/* 查询 100 个 Post */
AV.Cloud.define('getPostsWithAuthor', async request => {
  const posts = await new AV.Query(Post).find()

  const users = await fetchUsersFromCache(posts.map( post => {
    return post.get('author').id
  }))

  return posts.map( post => {
    return _.extend(post.toJSON(), {
      author: _.find(users, {id: post.get('author').id})
    })
  })
})

/* 查询单个 Post */
AV.Cloud.define('getPostWithAuthor', async request => {
  const post = await new AV.Query(Post).get(request.params.id)
  const user = await fetchUserFromCache(post.get('author').id)

  return _.extend(post.toJSON(), {
    author: user
  })
})

/* 在 User 被修改后删除缓存 */
AV.Cloud.afterUpdate('_User', function(request) {
  redisClient.del(redisUserKey(request.object.id)).catch(console.error)
})

/* 从缓存中读取一个 User, 如果没有找到则从云存储中查询 */
function fetchUserFromCache(userId) {
  return redisClient.get(userId).then(function(cachedUser) {
    if (cachedUser) {
      // 反序列化为 AV.Object
      return AV.parseJSON(JSON.parse(cachedUser))
    } else {
      new AV.Query(AV.User).get(userId).then(function(user) {
        if (user) {
          // 将序列化后的 JSON 字符串存储到 LeanCache
          redisClient.set(redisUserKey(userId), JSON.stringify(user.toFullJSON())).catch(console.error)
        }

        return user
      })
    }
  })
}

/* 从缓存中读取一组 User, 如果没有找到则从云存储中查询（会进行去重并合并为一个查询）*/
function fetchUsersFromCache(userIds) {
  // 先从 LeanCache 中查询
  return redisClient.mget(_.uniq(userIds).map(redisUserKey)).then(function(cachedUsers) {
    const parsedUsers = cachedUsers.map(function(user) {
      // 对 User（也就是 AV.Object）进行反序列化
      return AV.parseJSON(JSON.parse(user))
    })

    // 找到 LeanCache 中没有缓存的那些 User
    const missUserIds = _.uniq(userIds.filter(function(userId) {
      return !_.find(parsedUsers, {id: userId})
    }))

    return Promise.try(function() {
      if (missUserIds.length) {
        // 从云存储中查询 LeanCache 中没有的 User
        return new AV.Query(AV.User).containedIn('objectId', missUserIds).find()
      } else {
        return []
      }
    }).then(function(latestUsers) {
      if (latestUsers.length) {
        // 将从云存储中查询到的 User 缓存到 LeanCache, 此处为异步
        redisClient.mset(_.flatten(latestUsers.map(function(user) {
          return [redisUserKey(user.id), JSON.stringify(user.toFullJSON())]
        }))).catch(console.error)
      }

      // 将来自缓存和来自云存储的用户组合到一起作为结果返回
      return userIds.map(function(userId) {
        return _.find(parsedUsers, {id: userId}) || _.find(latestUsers, {id: userId})
      })
    })
  })
}

/* User 存储在 LeanCache 中的键名，值是经过 JSON 序列化的 AV.Object */
function redisUserKey(userId) {
  return 'users:' + userId
}

/*
 * 更进一步
 *
 * - 如果数据量较大，担心占用过多内存，可以考虑为缓存设置过期时间。
 * - 这个例子侧重展示关联数据，但在其实 Post 本身也是可以缓存的。
 * - 其实获取一个 User 是获取一组 User 的特例，完全可以用 `fetchUsersFromCache([id])` 代替 `fetchUserFromCache(id)`.
 * - 这个例子没有考虑到被关联的用户不存在的情况，如果一个 Post 关联了一个不存在的用户，那么会反复地从云存储查询这个用户，可以通过设置一个特殊的、表示用户不存在的值缓存到 LeanCache.
 */
