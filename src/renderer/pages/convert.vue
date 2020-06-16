<template>
  <div id="convert">
    <div id="header">
      <div id="title">格式转换工具</div>
      <div id="minimize" class="control-button" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div id="close" class="control-button" @click="close">
        <object data="static/images/close.svg" type="image/svg+xml"></object>
      </div>
    </div>
    <el-tabs type="card" tab-position="top" id="content" @tab-click="clear">
      <el-tab-pane>
        <span slot="label"><i class="fas fa-image"></i> 导入图片</span>
        <div id="single" class="tab-content">
          <div id="upload">
            <el-upload
              id="upload-dragger"
              action=""
              drag
              multiple
              :auto-upload="false"
              :on-change="handleFile"
              :show-file-list="false"
              :class="this.fileList.length != 0 ? 'half' : ''">
              <i class="fas fa-image"></i>
              <div class="el-upload__text">将图片拖到此处，或<em>点击选择图片</em></div>
            </el-upload>
            <div v-if="this.fileList.length != 0" id="file-list">
              <div id="list">
                <div
                  v-for="(file, index) in this.fileList"
                  :key="file.fullpath"
                  class="file"
                  @click="preview(index)">
                  <div class="filename">{{ file.filename + '.' + file.ext }}</div>
                  <div @click.stop="handleDelete(index)">
                    <i class="fas fa-trash-alt delete"></i>
                  </div>
                </div>
              </div>
              <div class="row">
                <el-button type="primary" size="mini" @click="clearConfirm" class="bar-button">清空列表</el-button>
              </div>
            </div>
          </div>
          <div v-if="this.fileList.length != 0" class="controller">
            <div class="control-row">
              <div class="text">目标格式</div>
              <el-radio-group v-model="mimeType" class="control">
                <el-radio label="JPEG"></el-radio>
                <el-radio label="PNG"></el-radio>
                <el-radio label="WEBP"></el-radio>
              </el-radio-group>
            </div>
            <div class="control-row">
              <div class="text">图像质量</div>
              <el-slider
                v-model="quality"
                class="control"
                :min="1"
                :max="100"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">存储位置</div>
              <el-switch
                v-model="customDistDirectory"
                active-color="var(--main-color)"
                inactive-color="var(--main-color)"
                active-text="自定义路径"
                inactive-text="保存在原路径"
                class="control"></el-switch>
            </div>
            <div v-if="customDistDirectory" class="control-row">
              <div class="text">自定义存储位置</div>
              <el-input disabled size="mini" v-model="distDirectory" v-if="customDistDirectory" class="control">
                <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
              </el-input>
            </div>
            <div class="row">
              <el-button type="primary" size="mini" @click="start" class="bar-button">开始处理</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="fas fa-folder-open"></i> 选择文件夹</span>
        <div id="multiple" class="tab-content">
          <div class="wrapper" v-if="this.fileList.length == 0">
            <div class="row">
              <el-switch
                v-model="childDirectoryIncluded"
                active-text="包含子目录"
                inactive-text="不包含子目录"
               ></el-switch>
              <el-input disabled size="mini" v-model="srcDirectory" class="control">
                <el-button @click="selectSourceFolder" slot="prepend">选择</el-button>
              </el-input>
            </div>
            <el-button
              @click="handleFolder"
              type="primary"
              size="mini">扫描文件夹</el-button>
            <div id="file-list" class="row">
              <div id="empty">
                <i class="fas fa-folder-open"></i>
                <div>未导入图片</div>
              </div>
            </div>
          </div>
          <div class="wrapper" v-else>
            <div id="file-list">
              <div
                v-for="(file, index) in this.fileList.slice(fileListPage * 100 - 100, fileListPage * 100)"
                :key="file.fullpath"
                class="file"
                @click="preview(index + (fileListPage - 1) * 100)">
                <div class="filename">{{ file.filename + '.' + file.ext }}</div>
                <div class="path">{{ file.filepath }}</div>
                <div @click.stop="handleDelete(index + (fileListPage - 1) * 100)">
                  <i class="fas fa-trash-alt delete"></i>
                </div>
              </div>
            </div>
            <div class="row">
              <el-pagination
               
                small
                background
                layout="prev, pager, next"
                :pager-count="5"
                :page-size="100"
                :total="this.fileList.length"
                :current-page="fileListPage"
                :hide-on-single-page="true"
                @current-change="fileListPageChange">
              </el-pagination>
              <el-button type="primary" size="mini" @click="clearConfirm" class="bar-button">清空列表</el-button>
            </div>
            <div>
              <div class="control-row">
                <div class="text">目标格式</div>
                <el-radio-group v-model="mimeType" class="control">
                  <el-radio label="JPEG"></el-radio>
                  <el-radio label="PNG"></el-radio>
                  <el-radio label="WEBP"></el-radio>
                </el-radio-group>
              </div>
              <div class="control-row">
                <div class="text">图像质量</div>
                <el-slider
                  v-model="quality"
                  class="control"
                  :min="1"
                  :max="100"
                  :step="1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">存储位置</div>
                <el-switch
                  v-model="customDistDirectory"
                  active-color="var(--main-color)"
                  inactive-color="var(--main-color)"
                  active-text="自定义路径"
                  inactive-text="保存在原路径"
                  class="control"></el-switch>
              </div>
              <div v-if="customDistDirectory" class="control-row">
                <div class="text">自定义存储位置</div>
                <el-input disabled size="mini" v-model="distDirectory" v-if="customDistDirectory" class="control">
                  <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
                </el-input>
              </div>
              <div v-if="customDistDirectory && childDirectoryIncluded" class="control-row">
                <div class="text">目录结构</div>
                <el-switch
                  v-model="keepDirectoryStructure"
                  active-text="保持目录结构"
                  inactive-text="不保持目录结构"
                  class="control"></el-switch>
              </div>
              <div class="row">
                <el-button type="primary" size="mini" @click="start" class="bar-button">开始处理</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import CreateDirectory from '../utils/CreateDirectory'
import ReadDirectory from '../utils/ReadDirectory'
import EXIF from 'exif-js'

const path = require('path')
const fs = require('fs')

export default {
  name: 'convert',
  data () {
    return {
      fileList: [],
      fileSet: new Set(),
      fileListPage: 1,
      errorList: [],
      quality: 90,
      mimeType: 'JPEG',
      srcDirectory: '',
      distDirectory: '',
      childDirectoryIncluded: false,
      customDistDirectory: false,
      keepDirectoryStructure: false
    }
  },
  methods: {
    minimize() {
      ipcRenderer.send('minimize')
    },
    close() {
      ipcRenderer.send('close')
      this.$destroy()
    },
    clear() {
      this.fileList = []
      this.fileSet = new Set()
      this.fileListPage = 1
      this.errorList = []
      this.quality = 90
      this.mimeType = 'JPEG'
      this.srcDirectory = ''
      this.distDirectory = ''
      this.childDirectoryIncluded = false
      this.customDistDirectory = false
      this.keepDirectoryStructure = false
    },
    clearConfirm() {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '将清除您已导入的图片，确定执行操作吗？',
        showCancel: true,
        confirmFunction: () => {
          this.clear()
        }
      })
    },
    handleFile(file) {
      let ext = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length).toLowerCase()
      let filename = file.name.substring(0, file.name.lastIndexOf("."))
      let filepath = path.dirname(file.raw.path)
      let formats = new Set(['jpg', 'jpeg', 'png', 'webp'])
      if (formats.has(ext) && !this.fileSet.has(file.raw.path)) {
        this.fileList.push({
          fullpath: file.raw.path,
          filepath: filepath,
          filename: filename,
          ext: ext
        })
        this.fileSet.add(file.raw.path)
      }
    },
    handleFolder() {
      if (this.srcDirectory == '') {
        this.$dialog({
          type: 'warning',
          text: '您还没有选择需要扫描的文件夹！'
        })
      } else {
        this.$dialog({
          title: '正在扫描文件夹',
          text: '扫描时间与您的文件数量及大小有关，请您耐心等待……',
          showConfirm: false
        }).then((dialog) => {
          let formats = new Set(['jpg', 'jpeg', 'png', 'webp'])
          let result = ReadDirectory(this.srcDirectory, this.childDirectoryIncluded, formats)
          this.fileList = result.fileList
          this.fileSet = new Set(result.fileList)
          this.errorList = result.errorList
          dialog.change({
            type: 'success',
            title: '完成',
            text: '已扫描完您选择的文件夹，共发现 ' + this.fileList.length + ' 个可处理的图片文件，接下来您可以继续执行下一步操作。',
            showConfirm: true
          })
          if (this.errorList.length != 0) {
            dialog.change({
              content: this.$createElement('div', null, [
                this.$createElement('div', null, [
                  this.$createElement('p', null, '扫描下列文件或文件夹的过程中出现错误，请您检查相关文件或文件夹的权限。这不影响您处理列表中显示的已导入文件。')
                ]),
                this.$createElement('div', null, this.errorList.map((file) => {
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
                  }, file)
                }))
              ]),
              confirmFunction: () => {
                this.errorList = []
              }
            })
          }
        })
      }
    },
    handleDelete(index) {
      if (this.fileListPage != 1) {
        if (this.fileListPage == Math.ceil(this.fileList.length / 100)) {
          if (this.fileList.length % 100 == 1) {
            this.fileListPage -= 1
          }
        }
      }
      this.fileSet.delete(this.fileList[index].fullpath)
      this.fileList.splice(index, 1)
    },
    preview(index) {
      this.$dialog({
        title: '图像预览',
        text: '正在生成预览',
        showConfirm: false
      }).then((dialog) => {
        let url = this.fileList[index].fullpath
        let image = document.createElement('img')
        image.src = url
        image.onerror = () => {
          dialog.change({
            type: 'error',
            title: '出现错误',
            text: '生成预览失败，请检查图像文件是否正常。',
            showConfirm: true
          })
        }
        image.onload = () => {
          EXIF.getData(image, () => {
            let orientation = EXIF.getTag(image, 'Orientation')
            if (orientation == 3 || orientation == 6 || orientation == 8) {
              let canvas = document.createElement('canvas')
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
              } else {
                width = image.height
                height = image.width
                x = -height
                y = 0
                rotation = 270
              }
              canvas.height = height
              canvas.width = width
              let context = canvas.getContext("2d")
              context.rotate(rotation * Math.PI / 180)
              context.drawImage(image, x, y)
              dialog.change({
                text: '',
                showConfirm: true,
                content: this.$createElement('img', {
                  'attrs': {
                    'id': 'preview-image'
                  }
                })
              }).then(() => {
                canvas.style.width = '100%'
                canvas.style.display = 'block'
                let previewImage = document.getElementById('preview-image')
                previewImage.parentNode.replaceChild(canvas, previewImage)
              })
            } else {
              dialog.change({
                text: '',
                showConfirm: true,
                content: this.$createElement('img', {
                  'attrs': {
                    'src': url
                  }
                })
              })
            }
          })
        }
      })
    },
    fileListPageChange(page) {
      this.fileListPage = page
    },
    selectSourceFolder() {
      this.srcDirectory = ipcRenderer.sendSync('select-folder')
    },
    selectSaveFolder() {
      this.distDirectory = ipcRenderer.sendSync('select-folder')
    },
    start() {
      let handle = () => {
        this.$dialog({
          title: '正在处理',
          text: '即将完成，请稍候。',
          showConfirm: false
        }).then((dialog) => {
          let handleSingle = (file, index) => {
            return new Promise((resolve, reject) => {
              dialog.change({
                text: '正在处理第 ' + String(index + 1) + ' 张，共 ' + String(this.fileList.length) + ' 张。'
              }).then(() => {
                let imageInfo = this.fileList[index]
                let distExt
                if (this.mimeType == 'JPEG') {
                  distExt = 'jpg'
                } else {
                  distExt = this.mimeType.toLowerCase()
                }
                let mimeType = this.mimeType.toLowerCase()
                let distFilename = imageInfo.filename + '.' + distExt
                let distPath
                if (this.customDistDirectory) {
                  if (this.keepDirectoryStructure) {
                    distPath = path.join(this.distDirectory, path.relative(this.srcDirectory, imageInfo.filepath))
                  } else {
                    distPath = this.distDirectory
                  }
                } else {
                  distPath = imageInfo.filepath
                }
                let distFullpath = path.join(distPath, distFilename)
                let image = document.createElement('img')
                image.src = imageInfo.fullpath
                image.onerror = () => {
                  this.errorList.push(imageInfo.fullpath)
                  resolve()
                }
                image.onload = () => {
                  EXIF.getData(image, () => {
                    let orientation = EXIF.getTag(image, 'Orientation')
                    let canvas = document.createElement('canvas')
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
                    canvas.height = height
                    canvas.width = width
                    let context = canvas.getContext("2d")
                    context.rotate(rotation * Math.PI / 180)
                    context.drawImage(image, x, y, image.width, image.height)
                    context.rotate(-rotation * Math.PI / 180)
                    let url = canvas.toDataURL('image/' + mimeType, this.quality / 100).replace(/^data:image\/\w+;base64,/, "")
                    let buffer = new Buffer.from(url, 'base64')
                    CreateDirectory(distPath)
                    fs.writeFile(distFullpath, buffer, (error) => {
                      if (error) {
                        this.errorList.push(imageInfo.fullpath)
                      }
                      resolve()
                    })
                  })
                }
              })
            })
          }
          let progress = Promise.resolve()
          this.fileList.forEach((file, index) => {
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
                  this.clear()
                }
              }).then(() => {
                let notification = new Notification('尺寸调整工具', {
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
                  this.clear()
                }
              }).then(() => {
                let notification = new Notification('尺寸调整工具', {
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
      if (this.customDistDirectory && this.distDirectory === '') {
        this.$dialog({
          type: 'warning',
          text: '请您选择保存的目录！'
        })
      } else {
        handle()
      }
    }
  }
}
</script>

<style lang="scss">
#convert {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  button {
    font-family: var(--main-font);
  }
  
  #header {
    padding-left: 20px;
    padding-right: 20px;
    box-sizing: border-box;
    flex-basis: 40px;
    background-color: var(--dark-gray);
    display: flex;
    align-items: center;
    z-index: 3000;
    -webkit-app-region: drag;

    #title {
      color: var(--white);
      font-size: 16px;
      flex-grow: 1;
    }

    .control-button {
      -webkit-app-region: no-drag;
      width: 20px;
      height: 20px;
      margin-left: 5px;
      margin-right: 5px;
      border-radius: 10px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;

      object {
        width: 50%;
        color: var(--white);
      }

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;
      }

      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        border-radius: 50%;
        transition: 0.2s;
      }

      &:hover::after {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }

    #minimize {
      background-color: var(--success-green);
    }

    #close {
      background-color: var(--warning-red);
    }
  }

  #content {
    height: 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    
    .el-tabs__header {
      margin: 0;
      
      .el-tabs__nav-scroll {
        background-color: var(--main-color);
        
        .el-tabs__nav {
          border: 0;
          
          .el-tabs__item {
            width: 150px;
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
        
        .tab-content {
          width: 100%;
          height: 100%;
          padding: 20px;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
        }
      }
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
        width: 60%;
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
      
      .control {
        width: 60%;
      }
      
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
      padding-left: 0;
      padding-right: 0;
      margin-left: 5px;
      margin-right: 5px;
      
      &:first-child {
        margin-left: 0;
      }
      
      &:last-child {
        margin-right: 0;
      }
    }
    
    .controller {
      margin-top: 10px;
    }
    
    .wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
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
    
    .el-input-group__append {
      width: fit-content;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .el-switch {
      display: flex;
      justify-content: flex-end;
    }
    
    .el-radio-group {
      display: flex;
      justify-content: flex-end;
    }
      
    #single {
      flex-direction: column;
      
      #upload {
        width: 100%;
        height: 0;
        flex-grow: 1;
        display: flex;
        justify-content: space-between;
        
        #upload-dragger {
          width: 100%;
          height: 100%;
          transition: 0.5s;
          
          &.half {
            width: calc(50% - 5px);
          }
          
          .el-upload {
            width: 100%;
            height: 100%;
            
            .el-upload-dragger {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              border-color: var(--light-gray);
              transition: 0.2s;
              
              svg {
                font-size: 40px;
                margin: 14px;
              }
              
              &:hover {
                color: var(--main-color);
                border-color: var(--main-color);
              
                .el-upload__text {
                  color: var(--main-color);
                }
              }
            }
          }
        }
        
        #file-list {
          width: calc(50% - 5px);
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
    }
    
    #multiple {
      
      .el-pagination {
        padding: 0;
        margin-right: 10px;
        
        li {
          min-width: 24px;
          height: 28px;
          line-height: 28px;
        }
        
        .btn-prev {
          width: 24px;
          height: 28px;
          line-height: 28px;
          margin-left: 0;
        }
        
        .btn-next {
          width: 24px;
          height: 28px;
          line-height: 28px;
          margin-right: 0;
        }
      }
      
      #file-list {
        width: 100%;
        height: 0;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        background-color: var(--white-gray);
        box-sizing: border-box;
        border-radius: 6px;
        border-color: var(--light-gray);
        border-style: solid;
        border-width: 1px;
        overflow-y: auto;
        overflow-x: hidden;
        
        #empty {
          width: 100%;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          
          svg {
            font-size: 40px;
            margin: 14px;
          }
        }
        
        .file {
          height: 28px;
          width: 100%;
          flex-shrink: 0;
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
            width: 50%;
            flex-shrink: 1;
            padding-right: 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            box-sizing: border-box;
          }
          
          .path {
            width: 50%;
            flex-shrink: 1;
            padding-right: 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            box-sizing: border-box;
          }
          
          .delete {
            color: var(--light-gray);
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
}
</style>
