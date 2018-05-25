const config = require('./config')
const Discord = require('discord.js');
const client = new Discord.Client();
const CVE = require('./CVE/main')
const SpeechRecognition = require('./services/speech_recognition')
const methodManager = require('./loader')

// change CVE and SpeechRecognition class
// they shouldn't need to have the discord client as a constructor value
// I admit this part was quickly hacked together
const cve = new CVE(client)
const speechRecognition = new SpeechRecognition(client)

// Modify loadFunction for noncache
// This will allow the functions to be modified while run
function loadFunctions () {
  console.log('Loading in functions')
  let fs = require('fs')
  let methods = fs.readdirSync('./functions/');
  for (let i in methods) {
    let file = methods[i].split('.')[0]
    require('./functions/' + file)
  }
}

// Initialize functions
loadFunctions()

// polls for new CVE's every 15 minutes
cve.poll(cve.latest, 15)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
})

client.on('message', msg => {

  // temp hard code command
  if (msg.content === 'activate') {
    speechRecognition.listen(msg)
  }

  if (msg.content === 'leave voices') {
    console.log('Should leave all voice channels')
    // console.log(client.voiceConnections)
    client.voiceConnections.map((chan) => {
      chan.disconnect()
    })
  }

  if(msg.content === 'terminate') {
    console.log('Terminating client...')
    client.destroy()
    process.exit()
  }

  let parts = msg.content.split(' ')
  let cmd = parts[0]
  let options = parts.slice(1, parts.length).join(' ')


  if (methodManager.isMethod(cmd)) {
    let props = {client, msg, parts, options, cve}
    methodManager.execute(cmd, props)
  }

})

client.login(config.discord.auth_key)