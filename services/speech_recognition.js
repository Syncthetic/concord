const config = require('../config')
const WitSpeech = require('node-witai-speech');
const decode = require('../services/decodeOpus');

const fs = require('fs');
const path = require('path');
const opus = require('node-opus');
const methodManager = require('../loader')

module.exports = class SpeechRecognition {
  constructor(client) {
    this.dispatcher = null;
    this.voiceChannel = null;
    this.textChannel = null;
    this.listenConnection = null;
    this.listenReceiver = null;
    this.listenStreams = new Map();
    this.listening = false;
    this.message = null;
    this.client = client
    this.clear = true
  }

  listen (message) {
    this.message = message
    let member = message.member
    this.client.on('guildMemberSpeaking', this.handleSpeaking.bind(this))
    if (!member) return;
    if (!member.voiceChannel) return message.reply('You need to join a voice channel first.')
    if (this.listening) return message.reply('Already listening on a channel.')
    this.listening = true
    this.voiceChannel = member.voiceChannel
    
    this.client.voiceChannel = member.voiceChannel

    message.channel.send('Listening in to **' + member.voiceChannel.name + '**!')
    let recordingsPath = path.join('.', 'recordings')
    this.makeDir(recordingsPath)

    let listenStreams = this.listenStreams

    this.voiceChannel.join().then( (connection) => {
      this.listenConnection = connection
      let receiver = connection.createReceiver()
      receiver.on('opus', function (user, data) {
        let hexString = data.toString('hex')
        let stream = listenStreams.get(user.id)
        if (!stream) {
          if (hexString === 'f8fffe') {
            return;
          }
          let outputPath = path.join(recordingsPath, `${user.id}-${Date.now()}.opus_string`)
          stream = fs.createWriteStream(outputPath)
          listenStreams.set(user.id, stream)
        }
        stream.write(`,${hexString}`)
      })
      this.listenReceiver = receiver
    }).catch(
      console.error
    )
  }

  handleSpeech (member, speech) {
    console.log('Speech:', speech)

    let voice_data = speech.toLowerCase().split(' ')
    let command = voice_data[0]

    if (command === 'method') {
      let call = voice_data[1]
      if (call === 'say') {
        let parts = voice_data.slice(1, voice_data.length)
        console.log(parts)
        methodManager.execute('!say', {client: this.client, msg: this.message, parts })
      }

      if (call === 'play') {
        let parts = voice_data.slice(1, voice_data.length)
        methodManager.execute('!song', {msg: this.message, parts})
      }
    }

    if (command === 'hey') {
      this.message.reply('Well, hey to you... ;)')
    }

    if (command === 'random') {
      let options = voice_data.slice(1, voice_data.length).join(' ')
      methodManager.execute('!say', {client: this.client, msg: this.message, parts: voice_data, options })
    }
  }

  handleSpeaking (member, speaking) {
    if(!speaking) {
      // console.log('Should clear recordings')
      if ( this.clear === false ) {
        let clearRecordings = () => {
          const fs = require('fs');
          const path = require('path');
          const directory = './recordings';
          fs.readdir(directory, (err, files) => {
            if (err) throw err;
            for (const file of files) {
              fs.unlink(path.join(directory, file), err => {
                if (err) console.log('Error: ', err)
              })
            }
          })
        }
        clearRecordings()
        this.clear = true
      }
    }

    if (!this.speaking && member.voiceChannel) {
      this.clear = false
      let stream = this.listenStreams.get(member.id)
      if (stream) {
        this.listenStreams.delete(member.id)
        stream.end(err => {
          if (err) console.error(err)
        })

        let basename = path.basename(stream.path, '.opus_string')
        let text = 'default'
        decode.convertOpusStringToRawPCM(
          stream.path,
          basename,
          (function () {
            this.processRawToWav (
              path.join('./recordings', basename + '.raw_pcm'),
              path.join('./recordings', basename + '.wav'),
              (function (data) {
                if (data != null) {
                  this.handleSpeech(member, data._text)
                }
              }).bind(this)
            )
           }).bind(this)
        )
      }
    }
  }

  processRawToWav(filepath, outputpath, cb) {
    let witai_key = config.WIT_AI.key
    const ffmpeg = require('fluent-ffmpeg')
    // console.log('processing raw data to wav data')
    fs.closeSync(fs.openSync(outputpath, 'w'));
    let command = ffmpeg(filepath)
      .addInputOptions([ '-f s32le', '-ar 48k', '-ac 1' ])
      .on('end', function() {
        // Stream the file to be sent to the wit.ai
        let stream = fs.createReadStream(outputpath);
        let parseSpeech =  new Promise((ressolve, reject) => {
        // call the wit.ai api with the created stream
        // console.log('Trying with: ' + witai_key)
        WitSpeech.extractSpeechIntent(
          witai_key, stream,
          'audio/wav',
          (err, res) => {
            if (err) return reject(err);
            ressolve(res);
          })
        })

        // witai call complete
        parseSpeech.then((data) => {
          console.log("you said: " + data._text);
          cb(data)
        }).catch((err) => {
          console.log(err);
        })
      })
      .on('error', function(err) {
          console.log('An error occured in ffmpeg(filepath): ' + err.message);
      })
      .addOutput(outputpath)
      .run();
  }

  makeDir(dir) {
    try {
      fs.mkdirSync(dir)
    } catch (err) {
      console.log('Directory could not be created: ', err)
    }
  }

}

/* These functions should be implemented soon */

// pause () {
//   if (dispatcher) {
//     dispatcher.pause();
//   }
// }

// resume () {
//   if (dispatcher) {
//     dispatcher.resume();
//   }
// }

// function setVolume (msg) {
//   var args = msg.toLowerCase().split(' ').slice(1).join(" ");
//   var vol = parseInt(args);
//   if (!isNaN(vol)
//     && vol <= 100
//     && vol >= 0) {
//     dispatcher.setVolume(vol / 100.0);
//   }
// }

// stop () {
//   if (listenReceiver) {
//     listening = false;
//     listenReceiver.destroy();
//     listenReceiver = null;
//     props.msg.channel.send("Stopped listening!");
//   }
// }

// function commandLeave() {
//   listening = false;
//   if (dispatcher) {
//     dispatcher.end();
//   }
//   dispatcher = null;
//   commandStop();
//   if (listenReceiver) {
//     listenReceiver.destroy();
//     listenReceiver = null;
//   }
//   if (listenConnection) {
//     listenConnection.disconnect();
//     listenConnection = null;
//   }
//   if (voiceChannel) {
//     voiceChannel.leave();
//     voiceChannel = null;
//   }
// }