<template>
  <div id="cropper-editor">
    <div id="header">
      <div id="title">图片裁剪工具 - 编辑器</div>
      <div id="minimize" class="control-button" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div id="maximize" class="control-button" @click="maximize">
        <object data="static/images/maximize.svg" type="image/svg+xml"></object>
      </div>
      <div id="close" class="control-button" @click="close">
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
        <div id="crop-wrapper">
          <div id="image-container">
            <img :src="this.$store.state.cropper.fileList[fileIndex].fullpath" id="image">
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
                  <div class="subtitle">裁剪设置</div>
                </div>
                <div class="control-row">
                  <div class="text">裁剪区域限位</div>
                </div>
                <div class="control-row">
                  <el-switch
                    v-model="allowOutOfImage"
                    active-text="允许超出图片"
                    inactive-text="不允许超出图片"
                    @change="init(fileIndex)"
                    class="control"></el-switch>
                </div>
                <div class="control-row">
                  <div class="text">裁剪模式</div>
                </div>
                <div class="control-row">
                  <el-select v-model="mode" @change="changeMode" size="mini" class="control">
                    <el-option label="自由裁剪" value="free"/>
                    <el-option label="自定义比例" value="custom"/>
                    <el-option label="预定义比例" value="preset"/>
                  </el-select>
                </div>
                <div class="control-row" v-if="mode == 'free'">
                  <div class="text">裁剪区域尺寸</div>
                </div>
                <div class="control-row" v-if="mode == 'free'">
                  <el-input
                    :value="Math.round(this.width) + ' * ' + Math.round(this.height)"
                    size="mini"
                    disabled
                    class="control">
                  </el-input>
                </div>
                <div class="control-row" v-if="mode == 'custom' || mode == 'preset'">
                  <div class="text">裁剪比例</div>
                </div>
                <div class="control-row" v-if="mode == 'custom'">
                  <el-input
                    size="mini"
                    v-model="ratio"
                    placeholder="格式为“3:2”"
                    class="control">
                    <el-button @click="setRatio" slot="append">确认</el-button>
                  </el-input>
                </div>
                <div class="control-row" v-if="mode == 'preset'">
                  <el-select
                    v-model="ratio"
                    @change="setRatio"
                    placeholder="请选择"
                    size="mini"
                    class="control">
                    <el-option label="正方形（1:1）" value="1:1"/>
                    <el-option label="常见相机横屏（3:2）" value="3:2"/>
                    <el-option label="常见相机竖屏（2:3）" value="2:3"/>
                    <el-option label="常见手机相机横屏（4:3）" value="4:3"/>
                    <el-option label="常见手机相机竖屏（3:4）" value="3:4"/>
                    <el-option label="普通电脑显示器横屏（16:9）" value="16:9"/>
                    <el-option label="普通电脑显示器竖屏（9:16）" value="9:16"/>
                    <el-option label="全面屏手机横屏（18:9）" value="18:9"/>
                    <el-option label="全面屏手机竖屏（9:18）" value="9:18"/>
                    <el-option label="宽屏电脑显示器横屏（21:9）" value="21:9"/>
                    <el-option label="宽屏电脑显示器竖屏（9:21）" value="9:21"/>
                    <el-option label="电影屏幕（2.39:1）" value="2.39:1"/>
                  </el-select>
                </div>
                <div class="control-row">
                  <div class="text">旋转</div>
                </div>
                <div class="control-row">
                  <el-slider
                    v-model="rotate"
                    class="control"
                    :min="0"
                    :max="360"
                    :step="0.1"
                    :show-input="true"
                    input-size="mini"></el-slider>
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
                    class="control"
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
                  <el-input disabled size="mini" v-model="distDirectory" class="control">
                    <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
                  </el-input>
                </div>
                <div class="control-row">
                  <div class="text">保存的图片格式</div>
                </div>
                <div class="control-row">
                  <el-radio-group v-model="mimeType" size="mini" class="control">
                    <el-radio-button label="JPEG"></el-radio-button>
                    <el-radio-button label="WEBP"></el-radio-button>
                    <el-radio-button label="PNG"></el-radio-button>
                    <el-radio-button label="保持原格式"></el-radio-button>
                  </el-radio-group>
                </div>
                <div class="control-row">
                  <div class="text">文件名后缀</div>
                </div>
                <div class="control-row">
                  <el-input size="mini" v-model="append" maxlength="30" class="control"></el-input>
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
                  v-for="(file, index) in this.$store.state.cropper.fileList"
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
          <el-button type="primary" size="mini" @click="reset" class="bar-button">重置</el-button>
          <el-button type="primary" size="mini" @click="start" class="bar-button">开始处理</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import EXIF from 'exif-js'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.min.css'

const path = require('path')
const fs = require('fs')

export default {
  name: 'cropperEditor',
  data() {
    return {
      fileIndex: 0,
      cropper: null,
      allowOutOfImage: false,
      mode: 'free',
      ratio: '',
      rotate: 0,
      width: 0,
      height: 0,
      quality: 90,
      distDirectory: '',
      append: '_cropped',
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
          this.cropper.reset()
        })
      }, 200)
    },
    back() {
      this.$store.dispatch('cropper/fileListEmpty').then(() => {
        this.$router.replace('/cropper')
      })
    },
    close() {
      this.$store.dispatch('cropper/fileListEmpty')
      ipcRenderer.send('close')
      this.$destroy()
    },
    handleDelete(index) {
      if (this.$store.state.cropper.fileList.length > 1) {
        this.$store.dispatch('cropper/fileListDelete', index).then(() => {
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
    init(index) {
      this.rotate = 0
      this.$dialog({
        title: '正在载入图像',
        text: '即将完成，请稍后。',
        showConfirm: false
      }).then((dialog) => {
        if (index >= this.$store.state.cropper.fileList.length) {
          this.fileIndex = this.$store.state.cropper.fileList.length - 1
        } else {
          this.fileIndex = index
        }
        let img = document.createElement('img')
        img.src = this.$store.state.cropper.fileList[this.fileIndex].fullpath
        img.onerror = () => {
          if (this.$store.state.cropper.fileList.length == 1) {
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
            this.$store.dispatch('cropper/fileListDelete', index)
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
            let rotation
            if (orientation == 3) {
              rotation = 180
            } else if (orientation == 6) {
              rotation = 90
            } else if (orientation == 8) {
              rotation = 270
            } else {
              rotation = 0
            }
            if (this.cropper != null) {
              this.cropper.destroy()
            }
            let vm = this
            let cropper = new Cropper(image, {
              viewMode: vm.allowOutOfImage ? 0 : 2,
              dragMode: 'move',
              autoCropArea: 0.5,
              toggleDragModeOnDblclick: false,
              crop(event) {
                vm.width = event.detail.width
                vm.height = event.detail.height
              },
              ready() {
                vm.cropper = this.cropper
                vm.rotate = rotation
                vm.setRatio()
                dialog.close()
              }
            })
          })
        }
      })
    },
    selectSaveFolder() {
      this.distDirectory = ipcRenderer.sendSync('select-folder')
    },
    changeMode() {
      this.ratio = ''
      this.setRatio()
    },
    setRatio() {
      let numbers = this.ratio.split(':')
      let ratio = numbers[0] / numbers[1]
      this.cropper.setAspectRatio(ratio)
    },
    reset() {
      this.cropper.reset()
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
          let distExt
          if (this.mimeType == '保持原格式') {
            distExt = this.$store.state.cropper.fileList[this.fileIndex].ext
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
          let ext = this.mimeType == 'JPEG' ? '.jpg' : ('.' + distExt)
          let filename = this.$store.state.cropper.fileList[this.fileIndex].filename + this.append + ext
          let distFullpath = path.join(this.distDirectory, filename)
          let canvas = this.cropper.getCroppedCanvas({
            imageSmoothingQuality: 'high'
          })
          let url = canvas.toDataURL('image/' + mimeType, this.quality / 100).replace(/^data:image\/\w+;base64,/, "")
          let buffer = new Buffer.from(url, 'base64')
          fs.writeFile(distFullpath, buffer, (error) => {
            if (error) {
              dialog.change({
                type: 'error',
                title: '出现错误',
                text: '写入文件失败，请检查目标文件夹权限。',
                showConfirm: true
              })
            } else {
              if (this.$store.state.cropper.fileList.length > 1) {
                dialog.change({
                  type: 'success',
                  title: '成功',
                  text: '处理完成，裁剪后的图片已保存到目标文件夹。',
                  showConfirm: true,
                  confirmFunction: () => {
                    this.$store.dispatch('cropper/fileListDelete', this.fileIndex).then(() => {
                      this.init(this.fileIndex)
                    })
                  }
                })
              } else {
                dialog.change({
                  type: 'success',
                  title: '成功',
                  text: '处理完成，裁剪后的图片已保存到目标文件夹。',
                  showConfirm: true,
                  confirmFunction: () => {
                    this.back()
                  }
                })
              }
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

#cropper-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  button {
    font-family: var(--main-font);
  }
  
  input {
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

    #maximize {
      background-color: var(--notice-yellow);
    }

    #close {
      background-color: var(--warning-red);
    }
  }

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
      width: 100%;
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

    #crop-wrapper {
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
        
        .cropper-container {
          position: relative;
          
          &:before {
            content: '拖拽此区域以移动图片';
            width: 100%;
            height: 100%;
            padding: 12px;
            box-sizing: border-box;
            overflow: hidden;
            font-size: 12px;
            line-height: 18px;
            color: var(--white);
            position: absolute;
            vertical-align: top;
            z-index: 1;
            pointer-events:none;
          }
          
          .cropper-crop-box {
            position: absolute;
            z-index: 2;
            
            &:before {
              content: '拖拽此区域以移动裁剪框';
              width: 100%;
              height: 100%;
              padding: 12px;
              box-sizing: border-box;
              overflow: hidden;
              font-size: 12px;
              line-height: 18px;
              color: var(--white);
              position: absolute;
              vertical-align: top;
              z-index: 3;
              pointer-events:none;
            }
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
