<template>
  <div id="slicer-editor">
    <div class="page-header">
      <div class="page-title">图片分割工具 - 编辑器</div>
      <div class="control-button minimize" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div class="control-button maximize" @click="maximize">
        <object data="static/images/maximize.svg" type="image/svg+xml"></object>
      </div>
      <div class="control-button close" @click="close">
        <object data="static/images/close.svg" type="image/svg+xml"></object>
      </div>
    </div>
    <div id="content">
      <div id="left">
        <div id="back-button-container">
          <div id="back-button" @click="back">
            <span slot="label"><i class="fas fa-chevron-left"></i> 返回</span>
          </div>
        </div>
        <div id="image-wrapper">
          <div id="image-container">
            <img :src="this.$store.state.slicer.fileList[fileIndex].fullpath" id="image">
            <div id="grids">
              <div
                v-for="number in Array.from({ length: row * column })"
                :key="number"
                class="grid"
                :style="{
                  'width': 'calc(100% / ' + column + ')',
                  'height': 'calc(100% / ' + row + ')',
                  'border-color': coverColor == 'dark' ? 'var(--black-gray)' : 'var(--white-gray)',
                  'background-color': coverColor == 'dark' ? 'var(--transparent-black-cover)' : 'var(--transparent-white-cover)'
                }"></div>
            </div>
          </div>
        </div>
      </div>
      <div id="right">
        <el-tabs type="card" tab-position="top" id="tabs">
          <el-tab-pane>
            <span slot="label">设置</span>
            <div id="config">
              <div>
                <div class="row">
                  <div class="subtitle">分割设置</div>
                </div>
                <div class="control-row">
                  <div class="text">列数和行数</div>
                </div>
                <div class="control-row">
                  <el-select v-model="row" @change="preview" size="mini" class="grid-count">
                    <el-option
                      v-for="(object, index) in Array.from({ length: 9 })"
                      :key="index"
                      :label="(index + 1) + ' 行'" :value="index + 1"/>
                  </el-select>
                  <el-select v-model="column" @change="preview" size="mini" class="grid-count">
                    <el-option
                      v-for="(object, index) in Array.from({ length: 9 })"
                      :key="index"
                      :label="(index + 1) + ' 列'" :value="index + 1"/>
                  </el-select>
                </div>
                <div class="control-row">
                  <div class="text">分割模式</div>
                </div>
                <div class="control-row">
                  <el-switch
                    v-model="keepSquare"
                    active-text="保持每格方形"
                    inactive-text="保持无裁切"
                    @change="preview"
                    class="full-width-control"></el-switch>
                </div>
                <div class="control-row">
                  <div class="text">预览区域颜色</div>
                </div>
                <div class="control-row">
                  <el-select v-model="coverColor" placeholder="请选择" size="mini" class="full-width-control">
                    <el-option label="深色" value="dark"/>
                    <el-option label="浅色" value="light"/>
                  </el-select>
                </div>
              </div>
              <div id="save">
                <div class="row">
                  <div class="subtitle">保存设置</div>
                </div>
                <div class="control-row">
                  <div class="text">图像质量</div>
                </div>
                <div class="control-row">
                  <el-slider
                    v-model="quality"
                    class="full-width-control"
                    :min="1"
                    :max="100"
                    :step="1"
                    :show-input="true"
                    input-size="mini"></el-slider>
                </div>
                <div class="control-row">
                  <div class="text">存储位置</div>
                </div>
                <div class="control-row">
                  <el-input disabled size="mini" v-model="distDirectory" class="full-width-control">
                    <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
                  </el-input>
                </div>
                <div class="control-row">
                  <div class="text">保存的图片格式</div>
                </div>
                <div class="control-row">
                  <el-radio-group v-model="mimeType" size="mini" class="full-width-control">
                    <el-radio-button label="JPEG"></el-radio-button>
                    <el-radio-button label="WEBP"></el-radio-button>
                    <el-radio-button label="PNG"></el-radio-button>
                    <el-radio-button label="保持原格式"></el-radio-button>
                  </el-radio-group>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane>
            <span slot="label">文件列表</span>
            <div id="file-list">
              <div class="row">
                <div class="subtitle">待处理的文件</div>
              </div>
              <div id="list">
                <div
                  v-for="(file, index) in this.$store.state.slicer.fileList"
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
          </el-tab-pane>
        </el-tabs>
        <div id="actions">
          <el-button type="primary" size="mini" @click="start" class="bar-button">处理本张</el-button>
          <el-button type="primary" size="mini" @click="startAll" class="bar-button">批量处理</el-button>
        </div>
      </div>
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
  name: 'slicerEditor',
  data() {
    return {
      errorList: [],
      fileIndex: 0,
      column: 3,
      row: 3,
      keepSquare: true,
      coverColor: 'dark',
      quality: 90,
      distDirectory: '',
      mimeType: '保持原格式'
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
    maximize() {
      ipcRenderer.send('change-maximize-status')
      setTimeout(() => {
        this.$nextTick(() => {
          this.preview()
        })
      }, 200)
    },
    back() {
      this.$store.dispatch('slicer/fileListEmpty').then(() => {
        this.$router.replace('/slicer')
      })
    },
    close() {
      this.$store.dispatch('slicer/fileListEmpty').then(() => {
        ipcRenderer.send('close')
        this.$destroy()
      })
    },
    handleDelete(index) {
      if (this.$store.state.slicer.fileList.length > 1) {
        this.$store.dispatch('slicer/fileListDelete', index).then(() => {
          if (this.fileIndex > index) {
            this.fileIndex -= 1
          } else if (this.fileIndex == index) {
            this.init(this.fileIndex)
          }
        })
      } else {
        this.back()
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
        if (index >= this.$store.state.slicer.fileList.length) {
          this.fileIndex = this.$store.state.slicer.fileList.length - 1
        } else {
          this.fileIndex = index
        }
        let img = document.createElement('img')
        img.src = this.$store.state.slicer.fileList[this.fileIndex].fullpath
        img.onerror = () => {
          if (this.$store.state.slicer.fileList.length == 1) {
            dialog.change({
              type: 'error',
              title: '出现错误',
              text: '图像文件读取错误，生成预览失败。即将返回。',
              showConfirm: true,
              confirmFunction: () => {
                this.back()
              }
            })
          } else {
            this.$store.dispatch('slicer/fileListDelete', index)
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
          let distExt
          if (this.mimeType == '保持原格式') {
            distExt = this.$store.state.slicer.fileList[this.fileIndex].ext
          } else if (this.mimeType == 'JPEG') {
            distExt = 'jpg'
          } else if (this.mimeType == 'WEBP') {
            distExt = 'webp'
          } else {
            distExt = 'png'
          }
          let mimeType
          if (distExt == 'jpg') {
            mimeType = 'jpeg'
          } else {
            mimeType = distExt
          }
          for (let row = 0; row < this.row; row++) {
            for (let column = 0; column < this.column; column++) {
              let grid = document.createElement('canvas')
              grid.width = canvas.width / this.column
              grid.height = canvas.height / this.row
              let context = grid.getContext('2d')
              context.drawImage(canvas, -grid.width * column, -grid.height * row)
              let url = grid.toDataURL('image/' + mimeType, this.quality / 100).replace(/^data:image\/\w+;base64,/, "")
              let buffer = new Buffer.from(url, 'base64')
              let distDirectory = path.join(this.distDirectory, this.$store.state.slicer.fileList[this.fileIndex].filename)
              CreateDirectory(distDirectory)
              let filename = this.$store.state.slicer.fileList[this.fileIndex].filename
              filename = filename + '_' + (row + 1) + '_' + (column + 1) + '.' + distExt
              let distFullpath = path.join(distDirectory, filename)
              fs.writeFileSync(distFullpath, buffer)
            }
          }
          if (this.$store.state.slicer.fileList.length > 1) {
            dialog.change({
              type: 'success',
              title: '成功',
              text: '处理完成，裁剪后的图片已保存到目标文件夹。',
              showConfirm: true,
              confirmFunction: () => {
                this.$store.dispatch('slicer/fileListDelete', this.fileIndex).then(() => {
                  this.init(this.fileIndex)
                })
              }
            })
          } else {
            dialog.change({
              type: 'success',
              title: '成功',
              text: '处理完成，裁剪后的图片已保存到目标文件夹，列表中的图片已全部处理完成。',
              showConfirm: true,
              confirmFunction: () => {
                this.back()
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
                text: '正在处理第 ' + String(index + 1) + ' 张，共 ' + String(this.$store.state.slicer.fileList.length) + ' 张。'
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
                      let distExt
                      if (this.mimeType == '保持原格式') {
                        distExt = imageInfo.ext
                      } else if (this.mimeType == 'JPEG') {
                        distExt = 'jpg'
                      } else if (this.mimeType == 'WEBP') {
                        distExt = 'webp'
                      } else {
                        distExt = 'png'
                      }
                      let mimeType
                      if (distExt == 'jpg') {
                        mimeType = 'jpeg'
                      } else {
                        mimeType = distExt
                      }
                      for (let row = 0; row < this.row; row++) {
                        for (let column = 0; column < this.column; column++) {
                          let grid = document.createElement('canvas')
                          grid.width = newCanvas.width / this.column
                          grid.height = newCanvas.height / this.row
                          let context = grid.getContext('2d')
                          context.drawImage(newCanvas, -grid.width * column, -grid.height * row)
                          let url = grid.toDataURL('image/' + mimeType, this.quality / 100).replace(/^data:image\/\w+;base64,/, "")
                          let buffer = new Buffer.from(url, 'base64')
                          let distDirectory = path.join(this.distDirectory, this.$store.state.slicer.fileList[index].filename)
                          CreateDirectory(distDirectory)
                          let filename = this.$store.state.slicer.fileList[index].filename
                          filename = filename + '_' + (row + 1) + '_' +(column + 1) + '.' + distExt
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
          this.$store.state.slicer.fileList.forEach((file, index) => {
            progress = progress.then(() => {
              return handleSingle(file, index)
            })
          })
          progress = progress.then(() => {
            if (this.errorList.length == 0) {
              dialog.change({
                type: 'success',
                title: '成功',
                text: '全部图片处理完成。',
                showConfirm: true,
                confirmFunction: () => {
                  this.back()
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
                text: '队列中的图片已处理完成，但下列图片处理失败。',
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
                  this.back()
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
#slicer-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  #content {
    height: 0;
    width: 100%;
    flex-grow: 1;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .el-input-group {
    display: flex;
  
    .el-input-group__prepend {
      width: fit-content;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .el-radio-button__inner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 28px;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 8px;
    padding-right: 8px;
  }
  
  #left {
    width: 0;
    height: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    #back-button-container {
      width: 100%;
      height: 50px;
      line-height: 50px;
      text-align: center;
      background-color: var(--main-color);

      #back-button {
        width: 100px;
        height: 50px;
        position: relative;
        line-height: 50px;
        text-align: center;
        font-size: 14px;
        color: var(--white);
        cursor: pointer;

        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          transition: 0.2s;
        }

        &:hover::after {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }
    }

    #image-wrapper {
      width: 100%;
      height: 0;
      flex-grow: 1;
      padding-left: 20px;
      padding-top: 20px;
      padding-bottom: 20px;
      box-sizing: border-box;

      #image-container {
        flex-grow: 1;
        height: 100%;
        position: relative;
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
          box-shadow: 0 0 10px var(--black);
        }
        
        #grids {
          position: absolute;
          display: flex;
          flex-wrap: wrap;
          
          .grid {
            border-width: 1px;
            border-style: solid;
            box-sizing: border-box;
          }
        }
      }
    }
  }

  #right {
    width: 300px;
    height: 100%;
    display: flex;
    flex-direction: column;

    #tabs {
      height: 0;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow-y: auto;

      #config {
        width: 100%;
        height: 100%;
        margin-top: -10px;
        margin-bottom: -10px;
        padding-top: 10px;
        padding-bottom: 10px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        #save {
          margin-top: 10px;
        }

        .grid-count {
          width: calc(50% - 5px);
        }

        .el-slider__runway {
          margin-left: 8px;

          .el-slider__button {
            width: 8px;
            height: 8px;
          }
        }

        &::-webkit-scrollbar {
          display: none;
        }
      }

      #file-list {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        #list {
          width: 100%;
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
              color: var(--light-gray);
              cursor: pointer;
              transition: 0.2s;
              margin-right: 5px;
              margin-left: 5px;
              
              &:hover {
                color: var(--warning-red);
              }
              
              &:first-index {
                margin-left: 0;
              }
              
              &:last-index {
                margin-right: 0;
              }
            }
            
            .move {
              color: var(--light-gray);
              cursor: pointer;
              transition: 0.2s;
              margin-right: 5px;
              margin-left: 5px;
              
              &:hover {
                color: var(--main-color);
              }
              
              &:first-index {
                margin-left: 0;
              }
              
              &:last-index {
                margin-right: 0;
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

      .el-tabs__header {
        margin: 0;
        
        .el-tabs__nav-scroll {
          background-color: var(--main-color);
          
          .el-tabs__nav {
            border: 0;
            
            .el-tabs__item {
              width: 100px;
              height: 50px;
              line-height: 50px;
              text-align: center;
              border: 0;
              transition: 0.2s;
              
              &.is-active {
                background-color: var(--white);
                color: var(--main-color);
                cursor: default;
              }
              
              &:not(.is-active) {
                color: var(--white);
                position: relative;
              }
              
              &:not(.is-active)::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                transition: 0.2s;
              }

              &:not(.is-active):hover::after {
                background-color: rgba(0, 0, 0, 0.1);
              }
            }
          }
        }
      }
      
      .el-tabs__content {
        flex-grow: 1;
        
        .el-tab-pane {
          width: 100%;
          height: 100%;
          padding: 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 0;
            width: 100%;
            height: 10px;
            background-image: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
            z-index: 2000;
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 10px;
            left: 0;
            width: 100%;
            height: 10px;
            background-image: linear-gradient(0deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
            z-index: 2000;
          }
        }
      }

      &::-webkit-scrollbar {
        display: none;
      }
    }

    #actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      padding-left: 20px;
      padding-right: 20px;
      box-sizing: border-box;
    }
  }
}
</style>
