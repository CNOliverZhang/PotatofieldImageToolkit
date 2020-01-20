const path = require('path')
const fs = require('fs')

function CreateDirectory(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (CreateDirectory(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}

export {
  CreateDirectory
}