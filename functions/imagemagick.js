const AV = require('leanengine')
const gm = require('gm')

/*
 * 使用 imageMagick 处理图像
 *
 * 安装依赖：
 *
 *   npm install gm
 *
 * 在 `leanengine.yaml` 中添加：
 *
 *   systemDependencies:
 *     - imagemagick
 *
 */

const imageMagick = gm.subClass({imageMagick: true})

AV.Cloud.define('imageMagicResize', async request => {
  return new Promise( (resolve, reject) => {
    imageMagick('public/leanstorage.png').resize(91, 77).toBuffer('png', (err, buffer) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          imageUrl: 'data:image/png;base64,' + buffer.toString('base64')
        })
      }
    })
  })
})
