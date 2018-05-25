/*
let meth = {
  name: '!say',
  locked: false,
  auth: 'admin',
  help: 'say <text>',
  cb: say
}
*/

class Loader {
  constructor() {
    this.methods = []
  }

  add (method) {
    this.methods.push(method)
  }

  execute (name, props) {
    this.methods.map(meth => {
      if (name === meth.name) {
        meth.cb(props)
      }
    })
  }

  checkAuth(type) {

  }

  isMethod (name) {
    let results = this.methods.filter((meth) => {
      return meth.name === name
    })
    return results.length < 1 ? false : true
  }
}
const methodManager = new Loader()
module.exports = methodManager