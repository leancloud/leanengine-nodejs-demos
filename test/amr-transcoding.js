const AV = require('leanengine')

require('../server')

describe('amr-transcoding', () => {
  it('amrToMp3', async () => {
    const amrFile = await new AV.Query('_File').get('5d9d8c087b968a008bb1a12c')

    const result = await AV.Cloud.run('amrToMp3', {file: amrFile})

    result.get('name').should.be.equal('test.mp3')
  })
})
