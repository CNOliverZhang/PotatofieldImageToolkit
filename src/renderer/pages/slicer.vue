<template>
  <div id="slicer">
    <div class="page-header">
      <div class="page-title">图片分割工具</div>
      <div class="control-button minimize" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div class="control-button close" @click="close">
        <object data="static/images/close.svg" type="image/svg+xml"></object>
      </div>
    </div>
    <el-tabs type="card" tab-position="top" id="content">
      <el-tab-pane>
        <span slot="label"><i class="fas fa-image"></i> 导入图片</span>
        <div id="file-input" class="tab-content">
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
              <el-button type="primary" size="mini" @click="edit" class="bar-button">进入分割编辑器</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import EXIF from 'exif-js'
import ReadDirectory from '../utils/ReadDirectory'

const path = require('path')

export default {
  name: 'slicer',
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
      let formats = new Set(['jpg', 'jpeg', 'webp', 'png'])
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
        image.src = `file://${url}`
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
      this.$store.dispatch('slicer/fileListAssign', this.fileList).then(() => {
        this.$router.replace('slicer/editor')
      })
    }
  },
  mounted() {
    ipcRenderer.send('unmaximize')
  }
}
</script>

<style lang="scss">
#slicer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

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
    
    #file-input {
      flex-direction: row;
    
      #upload-dragger {
        width: 100%;
        height: 100%;
        transition: 0.5s;
        
        &.half {
          width: calc(50% - 10px);
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
        width: calc(50% - 10px);
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
}
</style>
