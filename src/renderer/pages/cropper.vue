<template>
  <el-tabs type="card" tab-position="left" id="cropper" @tab-click="clear">
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-image"></i> 导入图片</span>
      <div class="tab-content">
        <el-upload
          id="upload-dragger"
          action=""
          class="interactable"
          drag
          multiple
          :auto-upload="false"
          :on-change="handleFile"
          :show-file-list="false"
          :class="this.fileList.length != 0 ? 'half' : ''">
          <i class="fas fa-image"></i>
          <div class="el-upload__text">将图片拖到此处，或<em>点击选择图片</em></div>
        </el-upload>
        <div v-if="this.fileList.length != 0" id="file-list" class="interactable">
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
            <el-button type="primary" size="mini" @click="clearConfirm" class="bar-button interactable">清空列表</el-button>
            <el-button type="primary" size="mini" @click="edit" class="bar-button interactable">进入裁剪编辑器</el-button>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane disabled>
      <span slot="label" id="sidebar">
        <div id="tool-info">
          <i id="tool-logo" class="fas fa-crop-alt"></i>
          <div class="text">图片裁剪工具</div>
        </div>
        <div id="control-button-holder">
          <div class="control-button interactable" @click="minimize">
            <i class="fas fa-angle-double-down"></i>
            <div>最小化</div>
          </div>
          <div class="control-button interactable" @click="close">
            <span class="fas fa-sign-out-alt"></span>
            <div>退出</div>
          </div>
        </div>
      </span>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { ipcRenderer } from 'electron'
import EXIF from 'exif-js'
import ReadDirectory from '../utils/ReadDirectory'

const path = require('path')

export default {
  name: 'cropper',
  data () {
    return {
      fileList: [],
      fileSet: new Set(),
      childDirectoryIncluded: false,
      srcDirectory: ''
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
      this.childDirectoryIncluded = false
      this.srcDirectory = ''
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
      if (['jpg', 'jpeg', 'png'].indexOf(ext) != -1 && !this.fileSet.has(file.raw.path)) {
        this.fileList.push({
          fullpath: file.raw.path,
          filepath: filepath,
          filename: filename,
          ext: ext
        })
        this.fileSet.add(file.raw.path)
      }
    },
    handleDelete(index) {
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
    edit() {
      this.$dialog({
        text: '请在编辑器中继续操作。',
        showConfirm: false
      }).then((dialog) => {
        this.$store.dispatch('cropper/fileListAssign', this.fileList).then(() => {
          ipcRenderer.send('open', {
            title: '裁剪编辑器',
            path: '#/cropper/editor',
            modal: true,
            height: 800,
            width: 1000
          })
          ipcRenderer.once('modal-window-closed', () => {
            this.clear()
            dialog.close()
          })
        })
      })
    }
  }
}
</script>

<style lang="scss">
#cropper {
  width: 100%;
  height: 100%;
  
  button {
    font-family: var(--main-font);
  }
  
  .el-tabs__header {
    margin-right: 0;
    
    .el-tabs__nav-scroll {
      background-color: var(--dark-gray);
      
      .el-tabs__nav {
        border: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        
        .el-tabs__item {
          width: 150px;
          height: 50px;
          line-height: 50px;
          color: var(--light-gray);
          text-align: center;
          border: 0;
          transition: 0.2s;
          
          #sidebar {
            width: 100%;
            
            @keyframes shine {
              0% {
                color: var(--light-gray)
              }
              25% {
                color: var(--light-gray)
              }
              50% {
                color: var(--main-color)
              }
              75% {
                color: var(--light-gray)
              }
              100% {
                color: var(--light-gray)
              }
            }
            
            #tool-info {
              display: flex;
              flex-direction: column;
              align-items: center;
              animation: shine 5s infinite;
              
              #tool-logo {
                font-size: 60px;
                margin: 20px;
              }
            }
            
            #control-button-holder {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 20px;
              box-sizing: border-box;
              
              .control-button {
                font-size: 12px;
                line-height: initial;
                cursor: pointer;
                transition: 0.2s;
                
                svg {
                  font-size: 20px;
                  margin: 5px;
                }
                
                &:hover {
                  color: var(--white);
                }
                
                &:active {
                  filter: brightness(0.9);
                }
              }
            }
          }
          
          &.is-active {
            background-color: var(--white);
            color: var(--main-color);
            cursor: default;
          }
          
          &.is-disabled {
            flex-grow: 1;
            padding: 0;
            display: flex;
            align-items: flex-end;
          }
          
          &:hover:not(.is-disabled):not(.is-active) {
            color: var(--white);
          }
          
          &:active:not(.is-disabled):not(.is-active) {
            filter: brightness(0.9);
          }
        }
      }
    }
  }
  
  .el-tabs__content {
    height: 100%;
    
    .el-tab-pane {
      width: 100%;
      height: 100%;
      
      .tab-content {
        width: 100%;
        height: 100%;
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
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
</style>
