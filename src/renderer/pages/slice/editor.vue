<template>
  <div id="slice-editor">
    <div id="crop">
      <div id="image-container">
        <img :src="this.$store.state.slice.fileList[imageIndex].fullpath" id="image">
        <div id="grids">
          <div
            v-for="number in Array.from({ length: row * column })"
            :key="number"
            class="grid"
            :style="{
              'width': 'calc(100% / ' + column + ')',
              'height': 'calc(100% / ' + row + ')'
            }"></div>
        </div>
      </div>
      <div id="file-list">
        <div class="row">
          <div class="subtitle">待处理的文件</div>
        </div>
        <div id="list" class="interactable">
          <div
            v-for="(file, index) in this.$store.state.slice.fileList"
            :key="file.fullpath"
            class="file"
            @click="init(index)">
            <div class="filename">{{ file.filename + '.' + file.ext }}</div>
            <div @click.stop="handleDelete(index)">
              <i class="fas fa-trash-alt delete"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="controller">
      <div class="side">
        <div class="row">
          <div class="subtitle">裁剪设置</div>
        </div>
        <div class="control-row">
          <div class="text">列数和行数</div>
          <div class="row control">
            <el-select v-model="row" @change="preview" size="mini" class="grid-count interactable">
              <el-option
                v-for="(object, index) in Array.from({ length: 9 })"
                :key="index"
                :label="(index + 1) + ' 行'" :value="index + 1"/>
            </el-select>
            <el-select v-model="column" @change="preview" size="mini" class="grid-count interactable">
              <el-option
                v-for="(object, index) in Array.from({ length: 9 })"
                :key="index"
                :label="(index + 1) + ' 列'" :value="index + 1"/>
            </el-select>
          </div>
        </div>
        <div class="control-row">
          <div class="text">分割模式</div>
          <el-switch
            v-model="keepSquare"
            active-text="保持每格为正方形"
            inactive-text="不保持每格为正方形"
            @change="preview"
            class="control interactable"></el-switch>
        </div>
      </div>
      <div class="side">
        <div class="row">
          <div class="subtitle">保存设置</div>
        </div>
        <div class="control-row">
          <div class="text">图像质量</div>
          <el-slider
            v-model="quality"
            class="control interactable"
            :min="1"
            :max="100"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="control-row">
          <div class="text">存储位置</div>
          <el-input disabled size="mini" v-model="distDirectory" class="control interactable">
            <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
          </el-input>
        </div>
      </div>
    </div>
    <div class="row">
      <el-dropdown
        size="mini"
        split-button
        type="primary"
        trigger="click"
        class="bar-button interactable"
        @click="minimize"
        @command="(command) => {command()}">
        最小化
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :command="close">退出编辑器</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button type="primary" size="mini" @click="start" class="bar-button interactable">处理本张</el-button>
      <el-button type="primary" size="mini" @click="startAll" class="bar-button interactable">批量处理</el-button>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import EXIF from 'exif-js'
import CreateDirectory from '../../utils/CreateDirectory'

const path = require('path')
const fs = require('fs')

export default {
  name: 'sliceEditor',
  data() {
    return {
      errorList: [],
      imageIndex: 0,
      column: 3,
      row: 3,
      keepSquare: true,
      quality: 100,
      distDirectory: ''
    }
  },
  watch: {
    rotate: function(value) {
      this.cropper.rotateTo(value)
    }
  },
  methods: {
    minimize() {
      ipcRenderer.send('minimize')
    },
    close() {
      this.$store.dispatch('slice/fileListEmpty')
      ipcRenderer.send('close')
      this.$destroy()
    },
    handleDelete(index) {
      if (this.$store.state.slice.fileList.length > 1) {
        this.$store.dispatch('slice/fileListDelete', index).then(() => {
          if (this.imageIndex > index) {
            this.imageIndex -= 1
          } else if (this.imageIndex == index) {
            this.init(this.imageIndex)
          }
        })
      } else {
        this.close()
      }
    },
    preview() {
      let image = document.getElementById('image')
      let style = window.getComputedStyle(image)
      let width = style.getPropertyValue('width').slice(0, -2)
      let height = style.getPropertyValue('height').slice(0, -2)
      let grids = document.getElementById('grids')
      if (this.keepSquare) {
        if ((width / height) > (this.column / this.row)) {
          grids.style.height = height + 'px'
          grids.style.width = height * (this.column / this.row) + 'px'
        } else {
          grids.style.width = width + 'px'
          grids.style.height = width * (this.row / this.column) + 'px'
        }
      } else {
        grids.style.width = width + 'px'
        grids.style.height = height + 'px'
      }
    },
    init(index) {
      this.$dialog({
        title: '正在载入图像',
        text: '即将完成，请稍后。',
        showConfirm: false
      }).then((dialog) => {
        if (index >= this.$store.state.slice.fileList.length) {
          this.imageIndex = this.$store.state.slice.fileList.length - 1
        } else {
          this.imageIndex = index
        }
        let img = document.createElement('img')
        img.src = this.$store.state.slice.fileList[this.imageIndex].fullpath
        img.onerror = () => {
          if (this.$store.state.slice.fileList.length == 1) {
            dialog.change({
              type: 'error',
              title: '出现错误',
              text: '图像文件读取错误，生成预览失败。即将退出编辑器。',
              showConfirm: true,
              confirmFunction: () => {
                this.close()
              }
            })
          } else {
            this.$store.dispatch('slice/fileListDelete', index)
            dialog.change({
              type: 'error',
              title: '出现错误',
              text: '图像文件读取错误，生成预览失败。已从待处理列表中移除该文件。',
              showConfirm: true,
              confirmFunction: () => {
                this.init(index)
              }
            })
          }
        }
        img.onload = () => {
          EXIF.getData(img, () => {
            let orientation = EXIF.getTag(img, 'Orientation')
            let canvas = document.createElement('canvas')
            let width, height, x, y, rotation
            if (orientation == 3) {
              width = img.width
              height = img.height
              x = -width
              y = -height
              rotation = 180
            } else if (orientation == 6) {
              width = img.height
              height = img.width
              x = 0
              y = -width
              rotation = 90
            } else if (orientation == 8) {
              width = img.height
              height = img.width
              x = -height
              y = 0
              rotation = 270
            } else {
              width = img.width
              height = img.height
              x = 0
              y = 0
              rotation = 0
            }
            canvas.height = height
            canvas.width = width
            let context = canvas.getContext("2d")
            context.rotate(rotation * Math.PI / 180)
            context.drawImage(img, x, y)
            context.rotate(-rotation * Math.PI / 180)
            canvas.style['max-width'] = '100%'
            canvas.style['max-height'] = '100%'
            canvas.style.display = 'block'
            let image = document.getElementById('image')
            image.parentNode.replaceChild(canvas, image)
            canvas.id = 'image'
            dialog.close()
            this.$nextTick(() => {
              this.preview()
            })
          })
        }
      })
    },
    selectSaveFolder() {
      this.distDirectory = ipcRenderer.sendSync('select-folder')
    },
    start() {
      if (this.distDirectory === '') {
        this.$dialog({
          type: 'warning',
          text: '请选择保存的目录！'
        })
      } else {
        this.$dialog({
          title: '正在处理',
          text: '即将完成，请稍候。',
          showConfirm: false
        }).then((dialog) => {
          let canvas
          if (this.keepSquare) {
            let originalCanvas = document.getElementById('image')
            canvas = document.createElement('canvas')
            if ((originalCanvas.width / originalCanvas.height) > (this.column / this.row)) {
              canvas.height = originalCanvas.height
              canvas.width = originalCanvas.height * (this.column / this.row)
            } else {
              canvas.width = originalCanvas.width
              canvas.height = originalCanvas.width * (this.row / this.column)
            }
            let context = canvas.getContext('2d')
            context.drawImage(originalCanvas, (canvas.width - originalCanvas.width) / 2, (canvas.height - originalCanvas.height) / 2)
          } else {
            canvas = document.getElementById('image')
          }
          for (let row = 0; row < this.row; row++) {
            for (let column = 0; column < this.column; column++) {
              let grid = document.createElement('canvas')
              grid.width = canvas.width / this.column
              grid.height = canvas.height / this.row
              let context = grid.getContext('2d')
              context.drawImage(canvas, -grid.width * column, -grid.height * row)
              let url = grid.toDataURL('image/jpeg', this.quality / 100).replace(/^data:image\/\w+;base64,/, "")
              let buffer = new Buffer.from(url, 'base64')
              let distDirectory = path.join(this.distDirectory, this.$store.state.slice.fileList[this.imageIndex].filename)
              CreateDirectory(distDirectory)
              let filename = this.$store.state.slice.fileList[this.imageIndex].filename + '_' + (row + 1) + (column + 1) + '.jpg'
              let distFullpath = path.join(distDirectory, filename)
              fs.writeFileSync(distFullpath, buffer)
            }
          }
          if (this.$store.state.slice.fileList.length > 1) {
            dialog.change({
              type: 'success',
              title: '成功',
              text: '处理完成，裁剪后的图片已保存到目标文件夹。',
              showConfirm: true,
              confirmFunction: () => {
                this.$store.dispatch('slice/fileListDelete', this.imageIndex).then(() => {
                  this.init(this.imageIndex)
                })
              }
            })
          } else {
            dialog.change({
              type: 'success',
              title: '成功',
              text: '处理完成，裁剪后的图片已保存到目标文件夹。列表中的图片已全部处理完成，即将退出编辑器。',
              showConfirm: true,
              confirmFunction: () => {
                this.close()
              }
            })
          }
        })
      }
    },
    startAll() {
      if (this.distDirectory === '') {
        this.$dialog({
          type: 'warning',
          text: '请选择保存的目录！'
        })
      } else {
        this.$dialog({
          title: '正在处理',
          text: '即将完成，请稍候。',
          showConfirm: false
        }).then((dialog) => {
          let handleSingle = (file, index) => {
            return new Promise((resolve, reject) => {
              dialog.change({
                text: '正在处理第 ' + String(index + 1) + ' 张，共 ' + String(this.$store.state.slice.fileList.length) + ' 张。'
              }).then(() => {
                let imageInfo = file
                let img = document.createElement('img')
                img.src = file.fullpath
                img.onerror = () => {
                  this.errorList.push(imageInfo.fullpath)
                  resolve()
                }
                img.onload = () => {
                  EXIF.getData(img, () => {
                    let orientation = EXIF.getTag(img, 'Orientation')
                    let canvas = document.createElement('canvas')
                    let width, height, x, y, rotation
                    if (orientation == 3) {
                      width = img.width
                      height = img.height
                      x = -width
                      y = -height
                      rotation = 180
                    } else if (orientation == 6) {
                      width = img.height
                      height = img.width
                      x = 0
                      y = -width
                      rotation = 90
                    } else if (orientation == 8) {
                      width = img.height
                      height = img.width
                      x = -height
                      y = 0
                      rotation = 270
                    } else {
                      width = img.width
                      height = img.height
                      x = 0
                      y = 0
                      rotation = 0
                    }
                    canvas.height = height
                    canvas.width = width
                    let context = canvas.getContext("2d")
                    context.rotate(rotation * Math.PI / 180)
                    context.drawImage(img, x, y)
                    context.rotate(-rotation * Math.PI / 180)
                    canvas.style['max-width'] = '100%'
                    canvas.style['max-height'] = '100%'
                    canvas.style.display = 'block'
                    let image = document.getElementById('image')
                    image.parentNode.replaceChild(canvas, image)
                    canvas.id = 'image'
                    this.$nextTick(() => {
                      this.preview()
                      let newCanvas
                      if (this.keepSquare) {
                        let canvas = document.getElementById('image')
                        newCanvas = document.createElement('canvas')
                        if ((canvas.width / canvas.height) > (this.column / this.row)) {
                          newCanvas.height = canvas.height
                          newCanvas.width = canvas.height * (this.column / this.row)
                        } else {
                          newCanvas.width = canvas.width
                          newCanvas.height = canvas.width * (this.row / this.column)
                        }
                        let context = newCanvas.getContext('2d')
                        context.drawImage(canvas, (newCanvas.width - canvas.width) / 2, (newCanvas.height - canvas.height) / 2)
                      } else {
                        newCanvas = document.getElementById('image')
                      }
                      for (let row = 0; row < this.row; row++) {
                        for (let column = 0; column < this.column; column++) {
                          let grid = document.createElement('canvas')
                          grid.width = newCanvas.width / this.column
                          grid.height = newCanvas.height / this.row
                          let context = grid.getContext('2d')
                          context.drawImage(newCanvas, -grid.width * column, -grid.height * row)
                          let url = grid.toDataURL('image/jpeg', this.quality / 100).replace(/^data:image\/\w+;base64,/, "")
                          let buffer = new Buffer.from(url, 'base64')
                          let distDirectory = path.join(this.distDirectory, this.$store.state.slice.fileList[index].filename)
                          CreateDirectory(distDirectory)
                          let filename = this.$store.state.slice.fileList[index].filename + '_' + (row + 1) + (column + 1) + '.jpg'
                          let distFullpath = path.join(distDirectory, filename)
                          fs.writeFile(distFullpath, buffer, (error) => {
                            if (error) {
                              this.errorList.push(imageInfo.fullpath)
                            }
                            resolve()
                          })
                        }
                      }
                    })
                  })
                }
              })
            })
          }
          let progress = Promise.resolve()
          this.$store.state.slice.fileList.forEach((file, index) => {
            progress = progress.then(() => {
              return handleSingle(file, index)
            })
          })
          progress = progress.then(() => {
            if (this.errorList.length == 0) {
              dialog.change({
                type: 'success',
                title: '成功',
                text: '全部图片处理完成，即将退出编辑器。',
                showConfirm: true,
                confirmFunction: () => {
                  this.close()
                }
              }).then(() => {
                let notification = new Notification('图片分割工具', {
                  body: '队列中的图片已处理完成。',
                  icon: path.join(__static, 'images/icon.ico')
                })
                notification.onclick = () => {
                  ipcRenderer.send('show')
                }
              })
            } else {
              dialog.change({
                type: 'warning',
                title: '完成',
                text: '队列中的图片已处理完成，但下列图片处理失败。即将退出编辑器。',
                content: this.$createElement('div', null, this.errorList.map((filename) => {
                  return this.$createElement('p', {
                    style: {
                      'line-height': '24px',
                      'font-size': '12px',
                      'width': '100%',
                      'overflow': 'hidden',
                      'text-overflow': 'ellipsis',
                      'white-space': 'nowrap',
                      'text-indent': '0'
                    }
                  }, filename)
                })),
                showConfirm: true,
                confirmFunction: () => {
                  this.close()
                }
              }).then(() => {
                let notification = new Notification('图片分割工具', {
                  body: '队列中的图片已处理完成。',
                  icon: path.join(__static, 'images/icon.ico')
                })
                notification.onclick = () => {
                  ipcRenderer.send('show')
                }
              })
            }
          })
        })
      }
    }
  },
  mounted() {
    this.init(0)
  }
}
</script>

<style lang="scss">
.el-popper {
  -webkit-app-region: no-drag;
}

#slice-editor {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  
  button {
    font-family: var(--main-font);
  }
  
  input {
    font-family: var(--main-font);
  }
  
  .control-row {
    width: 100%;
    height: 28px;
    flex-shrink: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    
    .control {
      width: 70%;
    }
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .row {
    width: 100%;
    flex-shrink: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .bar-button {
    width: 0;
    height: 28px;
    flex-grow: 1;
    box-sizing: border-box;
    border: none;
    margin-left: 5px;
    margin-right: 5px;
    
    &:first-child {
      margin-left: 0;
    }
    
    &:last-child {
      margin-right: 0;
    }
  }
  
  .el-input-group {
    display: flex;
  }
  
  .el-input-group__prepend {
    width: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .el-button-group {
    display: flex;
    
    button:not(.el-dropdown__caret-button) {
      width: 100%
    }
  }
  
  .el-button--primary:not(.el-dropdown__caret-button) {
    padding: 0;
    height: 28px;
  }
  
  .el-button--primary.el-dropdown__caret-button {
    padding-top: 0;
    padding-bottom: 0;
    height: 28px;
  }
  
  .el-switch {
    display: flex;
    justify-content: flex-end;
  }
  
  #crop {
    width: 100%;
    height: 0;
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    
    #image-container {
      flex-grow: 1;
      height: 100%;
      position: relative;
      margin-right: 20px;
      background-color: var(--black-gray);
      border-radius: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      
      #image {
        max-width: 100%;
        max-height: 100%;
        display: block;
      }
      
      #grids {
        position: absolute;
        display: flex;
        flex-wrap: wrap;
        
        .grid {
          border-width: 1px;
          border-style: solid;
          border-color: var(--white-gray);
          box-sizing: border-box;
          background-color: var(--transparent-black-cover)
        }
      }
    }
    
    #file-list {
      width: 25%;
      height: 100%;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      #list {
        width: 100%;
        height: 0;
        flex-grow: 1;
        background-color: var(--white-gray);
        box-sizing: border-box;
        border-radius: 6px;
        border-color: var(--light-gray);
        border-style: solid;
        border-width: 1px;
        overflow-y: auto;
        overflow-x: hidden;
        
        .file {
          height: 28px;
          width: 100%;
          line-height: 24px;
          font-size: 12px;
          padding-left: 5px;
          padding-right: 5px;
          box-sizing: border-box;
          background-color: var(--white);
          border-bottom-color: var(--light-gray);
          border-bottom-style: solid;
          border-bottom-width: 1px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: 0.2s;
          
          &:hover {
            background-color: var(--white-gray);
          }
          
          .filename {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            flex-grow: 1;
            padding-right: 10px;
          }
          
          .delete {
            color: var(--white-gray);
            cursor: pointer;
            transition: 0.2s;
            
            &:hover {
              color: var(--warning-red);
            }
          }
        }
        
        &::-webkit-scrollbar {
          width: 10px;
        }
            
        &::-webkit-scrollbar-track {
          border-radius: 5px;
          background-color: var(--transparent);
          
          &:hover {
            background-color: var(--white-gray);
          }
        }
        
        &::-webkit-scrollbar-thumb {
          border-radius: 5px;
          background-color: var(--light-gray);
          transition: 0.2s;
          
          &:hover {
            background-color: var(--gray);
          }
        }
      }
    }
  }
  
  #controller {
    width: 100%;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    
    .side {
      width: calc(50% - 10px);
      
      .grid-count {
        margin-left: 5px;
        margin-right: 5px;
        
        &:first-child {
          margin-left: 0;
        }
        
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
