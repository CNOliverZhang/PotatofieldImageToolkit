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
    resolve({
      default: file.path
    })
  }
}

export default function UploadAdapterPlugin(editor) {
  editor.plugins.get( 'FileRepository' ).createUploadAdapter = (loader) => {
    return new UploadAdapter(loader)
  }
}