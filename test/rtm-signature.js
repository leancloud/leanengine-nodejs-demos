const AV = require('leanengine')
const {Realtime} = require('leancloud-realtime')

require('../server')

describe('rtm-signature', () => {
  let client, conversation

  const realtime = new Realtime({
    appId: process.env.LEANCLOUD_APP_ID,
    appKey: process.env.LEANCLOUD_APP_KEY
  })

  const signLogin = clientId => {
    return AV.Cloud.run('signLogin', {clientId})
  }

  const signStartConversation = async (conversationId, clientId, members, action) => {
    if (action === 'create') {
      return AV.Cloud.run('signStartConversation', {
        conversationId, clientId, members, action
      })
    } else {
      const actionMapping = {
        add: 'invite',
        remove: 'kick'
      }

      return AV.Cloud.run('signOperateConversation', {
        conversationId, clientId, members,
        action: actionMapping[action]
      })
    }
  }

  after( () => {
    if (client) {
      return client.close()
    }
  })

  it('should failed without signature', async () => {
    try {
      await realtime.createIMClient('should-failed')
    } catch (err) {
      err.message.should.be.equal('SIGNATURE_FAILED')
      return
    }

    throw new Error('should failed without signature')
  })

  it('login with signature', async () => {
    client = await realtime.createIMClient('signature-test', {
      signatureFactory: signLogin,
      conversationSignatureFactory: signStartConversation
    })
  })

  it('start conversation with signature', async () => {
    conversation = await client.createConversation({
      members: ['signature-test'],
      transient: true
    })
  })

  it('invite to conversation with signature', async () => {
    await conversation.add(['Tom'])
  })
})
