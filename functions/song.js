const methodManager = require('../loader')
const config = require('../config')

function searchYoutube (props) {
  let search = require('youtube-search');

  let opts = {
    maxResults: 1,
    key: config.youtube.search_key
  }
  let searchFor = props.parts.slice(1, props.parts.length).join(' ')
  search(searchFor, opts, function(err, results) {
    if(err) return console.log(err);

    if (props.msg.member.voiceChannel) {
      const ytdl = require('ytdl-core');
      const streamOptions = { seek: 0, volume: 1 };
  
      props.msg.member.voiceChannel.join()
      .then(connection => {
        props.msg.reply('Attemping to play: ' + results[0].description)
        const stream = ytdl(results[0].link, { filter : 'audioonly' })
        const dispatcher = connection.playStream(stream, streamOptions);
        dispatcher.on('end', function (d) {
          console.log('Dispatcher ended: ', d)
          dispatcher.end()
        })
        dispatcher.on('failed', (err) => {
          console.log('Dispatcher failed: ', err)
        })
      })
      .catch(e => { console.log('Error: ', e) })
    } else {
       props.msg.reply('I can not play audio in a text channel...')
    }
  })
}

let youtubeMethod = {
  name: '!song', locked: false, help: '!song <author title>', cb: searchYoutube
}

methodManager.add(youtubeMethod)

