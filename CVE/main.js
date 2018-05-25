const config = require('../config')
const FILES = config.cve.FILES

module.exports = class CVE {
  constructor(client){
    this.https = require('https')
    this.apiBaseURL = 'https://cve.circl.lu/api/'
    this.client = client
    this.pending = []
  }

  messageChannel (data) {
    let chan = this.client.channels.get(config.cve.broadcast_channel_id)
    chan.send(data)
  }

  compare (current, previous) {
    return current === previous
  }

  latest () {
    let _log = this.log
    let _fromFile = this.fromFile
    let _messageChannel = this.messageChannel.bind(this)

    function success (data) {
      let fs = require('fs')
      if (fs.existsSync(FILES['latest'])) {
        _fromFile(FILES['latest'], (prevData) => {
          prevData = JSON.parse(prevData)
          let newest = data[0]
          let previous = prevData[0]
  
          if ( newest.id !== previous.id ) {
            _messageChannel(`NEW CVE FOUND:: ${newest.id}: ${newest.summary}`)
            _messageChannel(`https://cve.circl.lu/cve/${newest.id}`)
            _log(JSON.stringify(data), FILES['latest'])
          } else {
            console.log('No CVE updates to report')
          }
        })
      } else {
        _messageChannel('Building CVE data!')
        console.log('Creating ' + FILES['latest'])
        _log(JSON.stringify(data), FILES['latest'])
      }
    }

    this.apiFetch('last', (data) => { success(data) } )
  }

  search (msg, field, contains = ' ') {
    let _messageChannel = this.messageChannel.bind(this)
    let _pending = this.pending
    let _log = this.log

    // Play a song while cve is searching?...
    // msg.client.voiceConnections.map( (v_con) => {
    //   v_con.playFile('./crave.mp3')
    // })

    msg.reply('Searching for: ' + field)

    function success (data) {
      let returnData = []
      if (contains) {
        if (field.includes('/') == false) data = data.data 
        let found = false
        data.map(cve => {
          if(cve.summary.includes(contains)) {
            let send = `${field} => https://cve.circl.lu/cve/${cve.id}`
            returnData.push(send)
            if(!found) found = true
          }
        })

        if(returnData.length <= 2 ) {
          returnData.map( (cve) => { _messageChannel(cve)})
        } else if (returnData.length > 30 ) {

            let exec = require('child_process').exec;
            let say = `I found ${returnData.length} vulnerabilities in ${field}`
            exec(`espeak '${say}' -s 145 -v male2 --stdout > ./audio.wav`)
          
          
            if (msg.member.voiceChannel) {
              msg.member.voiceChannel.join()
              .then(connection => {
                let dispatcher = connection.playFile('./audio.wav')
                dispatcher.on('end', function () {
                  connection.disconnect()
                })
              })
              .catch(e => { console.log(e) })
            }

          msg.reply(`I found (${returnData.length}) results, probably too much to DM. Try narrowing down your search, or do a manual search at https://cve.circl.lu/`)

        } else {
          let exec = require('child_process').exec;
            let say = `${msg.author.username}, I sent ${returnData.length} vulnerabilities to your direct messages`
            exec(`espeak '${say}' -s 145 -v male2 --stdout > ./audio.wav`)
          
          
            if (msg.member.voiceChannel) {
              msg.member.voiceChannel.join()
              .then(connection => {
                let dispatcher = connection.playFile('./audio.wav')
                dispatcher.on('end', function () {
                  connection.disconnect()
                })
              })
              .catch(e => { console.log(e) })
            }

          msg.reply(`I found (${returnData.length}) results for ${field}, sending to DM, now`);
          returnData.map( (cve) => { msg.author.send(cve) })
        }


        if (!found) {
          _messageChannel('Nothing found for: ' + field + ' with: ' + contains + ` however, ${field} has ${data.length} results`)
        }
      }
      if (data.length == 0) {
        _messageChannel('Nothing found for: ' + field + ' with: ' + contains)
      }
      _pending.splice(_pending.indexOf(field), 1)
    }
    if(this.pending.includes(field) == false) {
      this.pending.push(field)
      this.apiFetch('search/' + field, (data) => { success(data) } )
    } else {
      _messageChannel(`${field} is being fetched and processed.`)
    }
  }

  fromFile (file, cb) {
    let fs = require('fs')
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) return console.log(err)
      if (cb) return cb(data)
      return data
    })
  }

  poll (func, time) {
    console.log('Starting poll')
    setInterval(func.bind(this), 10*1000* /*n minutes*/ time)
  }

  apiFetch (part, cb) {
    this.https.get(this.apiBaseURL + part, (resp) => {
      let data = '';

      resp.on('data', (buff) => {
        data += buff
      })

      resp.on('end', () => {
        if(cb) cb(this.getJSON(data))
      })

    })
    .on('error', (err) => {
      console.log('An error was encountered while polling:', err.message)
    })
  }

  getJSON (json) {
    try {
      let o = JSON.parse(json);
      if (o && typeof o === "object") return o;
    }
    catch (e) {
      console.log('Error parsing JSON: ', e)
    }
    return false;
  }

  log (content, file) {
    let fs = require('fs')
    fs.writeFile(file, content, function (err) {
      if (err) return console.log(err)
      console.log('CVE file updated.')
    })
  }

}