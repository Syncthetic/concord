const methodManager = require('../loader')

function playMusic (props) {
  if (props.msg.member.voiceChannel) {
    props.msg.member.voiceChannel.join()
    .then(connection => {
      let dispatcher = connection.playFile('./crave.mp3')
      dispatcher.on('end', function () {
        connection.disconnect()
      })
    })
    .catch(e => { console.log(e) })
  } else {
     props.msg.reply('I can not play audio in a text channel...')
  }
}

let musicMethod = {
  name: '!music', locked: false, help: '!music', cb: playMusic
}

methodManager.add(musicMethod)