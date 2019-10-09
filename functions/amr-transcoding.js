const AV = require('leanengine')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const os = require('os')
const path = require('path')
const request = require('request')

/*
 * 使用 ffmpeg 将 amr 音频转码为 mp3
 *
 * 安装依赖：
 *
 *   npm install fluent-ffmpeg request
 *
 * 在 `leanengine.yaml` 中添加：
 *
 *   systemDependencies:
 *     - ffmpeg
 *
 */

/*
 * 参数的 file 字段接受一个 AV.File（amr 音频）
 * 返回一个新的 AV.File（mp3 音频）
 */
AV.Cloud.define('amrToMp3', async request => {
  const amrPath = await downloadFile(request.params.file)
  const mp3Path = path.join(path.dirname(amrPath), path.basename('.amr') + '.mp3')

  await new Promise( (resolve, reject) => {
    ffmpeg(amrPath)
      .format('mp3')
      .on('end', () => resolve() )
      .on('error', err => reject(err) )
    .save(mp3Path)
  })

  const newFileName = path.basename(request.params.file.get('name'), '.amr') + '.mp3'
  const mp3File = await new AV.File(newFileName, fs.createReadStream(mp3Path)).save()

  await fs.promises.unlink(amrPath)
  await fs.promises.unlink(mp3Path)

  return mp3File
})

function downloadFile(file) {
  return new Promise( (resolve, reject) => {
    const filepath = `${os.tmpdir()}${file.id}.amr`

    request(file.get('url')).pipe(fs.createWriteStream(filepath))
      .on('close', () => resolve(filepath) )
      .on('error', err => reject(err) )
  })
}
