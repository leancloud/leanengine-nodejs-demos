const AV = require('leanengine')

require('../server')

describe('imagemagick', () => {
  it('imageMagicResize', async () => {
    const result = await AV.Cloud.run('imageMagicResize')

    result.should.have.properties(['imageUrl'])
  })
})
