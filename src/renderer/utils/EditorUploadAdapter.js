import EXIF from 'exif-js'

class UploadAdapter {
  constructor(loader) {
    this.loader = loader
  }
  
  upload() {
    return this.loader.file.then(file => new Promise((resolve, reject) => {
      this.returnFilePath(resolve, reject, file)
    }))
  }
  
  abort() {
    if (this.xhr) {
      this.xhr.abort()
    }
  }
  
  returnFilePath(resolve, reject, file) {
    try {
      EXIF.getData(file, () => {
        let orientation = EXIF.getTag(file, 'Orientation')
        let reader = new FileReader()
        reader.onloadend = function(event) {
          let image = new Image()
          image.onload = function() {
            let width, height, x, y, rotation
            if (orientation == 3) {
              width = image.width
              height = image.height
              x = -width
              y = -height
              rotation = 180
            } else if (orientation == 6) {
              width = image.height
              height = image.width
              x = 0
              y = -width
              rotation = 90
            } else if (orientation == 8) {
              width = image.height
              height = image.width
              x = -height
              y = 0
              rotation = 270
            } else {
              width = image.width
              height = image.height
              x = 0
              y = 0
              rotation = 0
            }
            let canvas = document.createElement('canvas')
            let scale = Math.min(1, 1500 / width)
            canvas.width = width * scale
            canvas.height = height * scale
            let context = canvas.getContext("2d")
            context.rotate(rotation * Math.PI / 180)
            context.drawImage(image, x * scale, y * scale, image.width * scale, image.height * scale)
            context.rotate(-rotation * Math.PI / 180)
            let data = canvas.toDataURL()
            resolve({
              default: data
            })
          }
          image.src = event.target.result
        }
        reader.readAsDataURL(file)
      })
    } catch (e) {
      reject({
        default: e
      })
    }
  }
}

export default function UploadAdapterPlugin(editor) {
  editor.plugins.get( 'FileRepository' ).createUploadAdapter = (loader) => {
    return new UploadAdapter(loader)
  }
}