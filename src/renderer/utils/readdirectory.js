const path = require('path')
const fs = require('fs')

function ReadDirectory(sourceLocation, childFolderIncluded) {
  let fileList = []
  let errorList = []
  if (childFolderIncluded) {
    let dirList = [sourceLocation]
    while (dirList.length > 0) {
      let directory = dirList.pop()
      let files = fs.readdirSync(directory)
      for (let i = 0; i < files.length; i++) {
        let filename = files[i]
        let filepath = path.join(directory, filename)
        try {
          let stats = fs.statSync(filepath)
          if (stats.isFile()) {
            let ext = filename.substring(filename.lastIndexOf(".") + 1, filename.length).toLowerCase()
            let name = filename.substring(0, filename.lastIndexOf("."))
            let path = directory
            if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) != -1) {
              fileList.push({
                fullpath: filepath,
                path: path,
                name: name,
                ext: ext
              })
            }
          } else {
            dirList.push(filepath)
          }
        } catch(e) {
          errorList.push(filepath)
        }
      }
    }
  } else {
    let files = fs.readdirSync(sourceLocation)
    for (let i = 0; i < files.length; i++) {
      let filename = files[i]
      let filepath = path.join(sourceLocation, filename)
      try {
        let stats = fs.statSync(filepath)
        if (stats.isFile()) {
          let ext = filename.substring(filename.lastIndexOf(".") + 1, filename.length).toLowerCase()
          let name = filename.substring(0, filename.lastIndexOf("."))
          let path = sourceLocation
          if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) != -1) {
            fileList.push({
              fullpath: filepath,
              path: path,
              name: name,
              ext: ext
            })
          }
        }
      } catch(e) {
        errorList.push(filepath)
      }
    }
  }
  return {
    fileList: fileList,
    errorList: errorList
  }
}

export {
  ReadDirectory
}