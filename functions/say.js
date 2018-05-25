const methodManager = require('../loader')

function say (props) {
  let content = props.parts.slice(1, props.parts.length).join(' ')
  console.log(content)

  let createAudioFile = new Promise(function(resolve, reject) {
    let exec = require('child_process').exec;
    exec(`espeak '${content}' -s 140 -v male4 --stdout > ./audio.wav`)
    resolve('success')
  })

  createAudioFile.then((success) => {
    if (props.msg.member.voiceChannel) {
      props.msg.member.voiceChannel.join()
      .then(connection => {
        let dispatcher = connection.playFile('./audio.wav')
        // I should be checking for the already joined connection instead
        // dispatcher.on('end', function (d) {
        //   console.log('Dispatcher ended: ', d)
        //   dispatcher.end()
        //   // connection.disconnect()
        // })
        dispatcher.on('failed', (err) => {
          console.log('Dispatcher failed: ', err)
        })
      })
      .catch(e => { console.log('Error joining: ', e) })
    } else {
       props.msg.reply('I can not play audio in a text channel...')
    }
  }
  )
}

let sayMethod = {
  name: '!say', locked: false, help: 'say <text>', cb: say
}

methodManager.add(sayMethod)
