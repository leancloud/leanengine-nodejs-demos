const AV = require('leanengine')

require('../server')

describe('weapp-decrypt', () => {
  it('should success', async () => {
    // appId uhx9ou96070bts3emcu6vyaxngnybkq07s6smzws3xp0ej4c
    // userId 587207a91b69e6005ca6b05b

    const result = await AV.Cloud.run('decryptWeappData', {
      encryptedData: 'dMZcop0wE2EONNFpSOWNKEjfc1LtABBG2I5Fno83Zt/jcIgbbrQzOWjmv9z+yZVmZi8YZntQ8CemE6jjsh/BIJa020IJ/afJtqc0lcrdPQ9YD/Bb176qrdZSajiM7lNtR33avYknP0zQ1APtNfDyiKehilTihfWYMUUcnKyaSihoye868MuOHa8SJEHvXxpeicq1j1op39nQEpX/9NnMjmWOgqmL1uvYyRgHOG7Kgs7D5mhpDs58q/fWGLav6d22WIQEcJmEDvKwe39CV6/9O1fyoNiHUGTUYbg5aarsM/4sG/bMD/Tw+YoIAC0n/xSYFH6Kk/jw3vubsW/AtBPeh3pQgl3gXo2ClxYc3OnJEx60kbzc9kw736NAQBxTurR0EAmHHKZagxPaaqGpFCJUwrHaEWIeiuVac3YejJ4TcxyFVWjKFsXWciNWWzXzXlsAZ8nTJJ7zQfnfH3QKnXRmMxA/7Rz04qtG52KT6u8thoYHmC2RHNWSb9h4EH8OdvDPD86ivTH6gnTfuK3HrDugOw==',
      iv: '3J0zu/VXwbZsaoQiBS8pkA=='
    }, {sessionToken: 'lfhz8hyibkzv5ujeiz4mrm6na'})

    result.city.should.be.equal('Suzhou')
  })
})
