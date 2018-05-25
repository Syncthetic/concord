const methodManager = require('../loader')

function playYoutube (props) {
  // try to leave before instantiating new stream

  if (props.msg.member.voiceChannel) {
    const ytdl = require('ytdl-core');
    const streamOptions = { seek: 0, volume: 1 };

    props.msg.member.voiceChannel.join()
    .then(connection => {
      const stream = ytdl(props.parts[1], { filter : 'audioonly' })
      const dispatcher = connection.playStream(stream, streamOptions);
      // dispatcher.on('end', function (d) {
      //   console.log('Dispatcher ended: ', d)
      //   connection.disconnect()
      // })
      dispatcher.on('failed', (err) => {
        console.log('Dispatcher failed: ', err)
      })
    })
    .catch(e => { console.log('Error: ', e) })
  } else {
     props.msg.reply('I can not play audio in a text channel...')
  }
}

let youtubeMethod = {
  name: '!youtube', locked: false, help: '!youtube <video link>', cb: playYoutube
}

methodManager.add(youtubeMethod)

