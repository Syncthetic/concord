const methodManager = require('../loader')

function cve_search (props) {
  let field = props.parts[1]
  if ( props.parts[2] ) {
    props.cve.search(props.msg, field, props.parts.slice(2, props.parts.length).join(' '))
  } else {
    props.cve.search(props.msg, field)
  }
}

let cveMethod = {
  name: '!cve', locked: false, help: 'cve <vendor>/<product> <text in summary>', cb: cve_search
}

methodManager.add(cveMethod)