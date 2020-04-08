const path = require('path')
const fs = require('fs')

export default function ReadDirectory(srcDirectory, childDirectoryIncluded, formats = new Set(['jpg', 'jpeg', 'webp', 'png'])) {
  let fileList = []
  let errorList = []
  if (childDirectoryIncluded) {
    let dirList = [srcDirectory]
    while (dirList.length > 0) {
      let directory = dirList.pop()
      let files = fs.readdirSync(directory)
      for (let i = 0; i < files.length; i++) {
        let filename = files[i]
        let fullpath = path.join(directory, filename)
        try {
          let stats = fs.statSync(fullpath)
          if (stats.isFile()) {
            let ext = filename.substring(filename.lastIndexOf(".") + 1, filename.length).toLowerCase()
            filename = filename.substring(0, filename.lastIndexOf("."))
            let filepath = directory
            if (formats.has(ext)) {
              fileList.push({
                fullpath: fullpath,
                filepath: filepath,
                filename: filename,
                ext: ext
              })
            }
          } else {
            dirList.push(fullpath)
          }
        } catch(e) {
          errorList.push(fullpath)
        }
      }
    }
  } else {
    let files = fs.readdirSync(srcDirectory)
    for (let i = 0; i < files.length; i++) {
      let filename = files[i]
      let fullpath = path.join(srcDirectory, filename)
      try {
        let stats = fs.statSync(fullpath)
        if (stats.isFile()) {
          let ext = filename.substring(filename.lastIndexOf(".") + 1, filename.length).toLowerCase()
          filename = filename.substring(0, filename.lastIndexOf("."))
          let filepath = srcDirectory
          if (formats.has(ext)) {
            fileList.push({
              fullpath: fullpath,
              filepath: filepath,
              filename: filename,
              ext: ext
            })
          }
        }
      } catch(e) {
        errorList.push(fullpath)
      }
    }
  }
  return {
    fileList: fileList,
    errorList: errorList
  }
}