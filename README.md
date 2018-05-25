# Concord
Concord is an AI Discord bot for CVE polling, playing music, and more.

---

## Technologies
- The core of the application is built using [Discord.js](https://discord.js.org)

- The AI features are utilized from the
[Wit.ai](https://wit.ai/) API

- Voice recognition was accomplish using [Opus](https://github.com/Rantanen/node-opus)

## Packages used
- fluent-ffmpeg
- underscore --save
- node-witai-speech --save
- ffmpeg-binaries
- opusscript
- ytdl-core
- youtube-search

## System Requirements
- [Node.js](https://nodejs.org/en/)
- [espeak](http://espeak.sourceforge.net/) (optional, allows teh bot to speak)
  - Can be installed on linux systems with `apt-get install espeak -y`
- [ffmpeg](https://www.ffmpeg.org/download.html)
  - The above link can be used to download for Mac and Windows, for Linux systems, you can use `apt-get install ffmpeg -y`

## Getting started
- Clone the repository with git clone, and run `npm install`
  - It's very likely that it will be necessary to run `npm rebuild` to get `ffmpeg` aligned with your distributed package, so run the rebuild command if you get `ffmpeg` related errors.
- Set all your keys cand configuration options in a file called `config.js`
  - An example config file can be copied and modifed `cp config.example.js config.js` and modify it as needed.
- If you recveive errors related to any of the `npm` packages listed above, try installing them with `npm install <package name>`, if this doesn't work, try running `npm update`

## Creating new commands
The bot utilizes a custom class `Loader` found inside the `loader.js` file. This class will keep track of all bot commands. Before adding a command to the `Loader` class, we need to instantiate a new `command object`, this command object will hold specific properties about the command, such as `auth`, `locked`, etc.

We'll start by adding a simple hello command. By default all commands should be set inside the `/functions` folder, with a somewhat recognizable file name, in this case, we'll call it `hello.js`.

    // Require our Loader class as methodManager
    const methodManager = require('../loader')

    // define our function ( this will be the cb property below)
    function hello () {
      console.log('Hello, world!');
    }

    let helloMethod = {
      name: '!hello', locked: false, help: '!hello', cb: hello
    }
    methodManager.add(helloMethod)

    // Additionally, the function could be an anonymous function
    // The following code is equivalent to the above
    methodManager.add({
      name: '!hello',
      locked: false,
      help: 'hello',
      cb: () => { console.log('Hello, world!'); }
    })

While the above example gives you an idea of how the `Loader` works, it's not very useful until you understand how to access the bot properties, such as the current channel. To do this, pass a `props` parameter to your functions, which will be an `object` housing all of the `client` properties that command will need.

Inside `app.js`, you'll notice a line of code checking for command validity, and exucuting accordingly, passing in the `props` object. I'll extract the relavent information below.

    let parts = msg.content.split(' ')
    let cmd = parts[0]

    // everything after the command call
    let options = parts.slice(1, parts.length).join(' ')

    if (methodManager.isMethod(cmd)) {

      // HERE IS WHERE THE props ARE DEFINED AND PASSED
      let props = {client, msg, parts, options}
      methodManager.execute(cmd, props)
    }
Typically, those props passed will be enough to do anything you need, but you can modify this as desired or required.

Let's finally finish with an example of replying to a user with the text they sent, wrapped in a command called `repeat`

    // FILE: /functions/repeat.js
    const methodManager = require('../loader')

    function repeat (props) {
      // get what the user said through the props.parts property
      let content = props.parts.slice(1, props.parts.length).join(' ')

      // send our reply to the message, pulled from the msg property
      props.msg.reply(content)
    }
    let repeatMethod = {
      name: '!repeat',
      locked: false,
      help: '!repeat <string>',
      cb: repeat
    }
    methodManager.add(repeatMethod)

# Voice commands

Currently, I do not have any kind of lazy loading for voice commands, but I plan to in the future. As of now, voice commands are hard coded inside the `/services/speech_recognition.js` file inside the `handleSpeech` function.

# Todo's
  - Lazy-load voice commands with some class
  - Modify the `CVE` and `SpeechRecognition` classes to not take `client` as a contrutor argument (it's sloppy and hacked together)
  - Improve AI throught the [wit.ai console](https://wit.ai/home)
  - Improve directory structure and overall design structure
  - I would like to remove `espeak` and hopefully use some alternative, like an API, as some server's may not be able to output audio as needed, making `espeak` problematic.