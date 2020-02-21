<template>
  <div id="cropper-editor">
    <div id="crop">
      <div id="image-container" class="interactable">
        <img :src="this.$store.state.cropper.fileList[imageIndex].fullpath" id="image">
      </div>
      <div id="file-list">
        <div class="row">
          <div class="subtitle">待处理的文件</div>
        </div>
        <div id="list" class="interactable">
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
    </div>
    <div id="controller">
      <div class="side">
        <div class="row">
          <div class="subtitle">裁剪设置</div>
        </div>
        <div class="control-row">
          <div class="text">裁剪模式</div>
          <el-select v-model="mode" @change="changeMode" size="mini" class="control interactable">
            <el-option label="自由裁剪" value="free"/>
            <el-option label="自定义比例" value="custom"/>
            <el-option label="预定义比例" value="preset"/>
          </el-select>
        </div>
        <div class="control-row" v-if="mode == 'free'">
          <div class="text">裁剪区域尺寸</div>
          <el-input
            :value="Math.round(this.width) + ' * ' + Math.round(this.height)"
            size="mini"
            disabled
            class="control interactable">
          </el-input>
        </div>
        <div class="control-row" v-else>
          <div class="text">裁剪比例</div>
          <el-input
            v-if="mode == 'custom'"
            size="mini"
            v-model="ratio"
            placeholder="格式为“3:2”"
            class="control interactable">
            <el-button @click="setRatio" slot="append">确认</el-button>
          </el-input>
          <el-select
            v-if="mode == 'preset'"
            v-model="ratio"
            @change="setRatio"
            placeholder="请选择"
            size="mini"
            class="control interactable">
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
          <el-slider
            v-model="rotate"
            class="control interactable"
            :min="0"
            :max="360"
            :step="0.1"
            :show-input="true"
            input-size="mini"></el-slider>
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
        <div class="control-row">
          <div class="text">文件名后缀及格式</div>
          <el-input size="mini" v-model="append" class="control interactable" placeholder="请输入文件名后缀">
            <el-select v-model="mimeType" size="mini" slot="append">
              <el-option label=".jpg" value="jpeg"/>
              <el-option label=".png" value="png"/>
            </el-select>
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
      <el-button type="primary" size="mini" @click="init(imageIndex)" class="bar-button interactable">重置</el-button>
      <el-button type="primary" size="mini" @click="start" class="bar-button interactable">开始处理</el-button>
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
      imageIndex: 0,
      cropper: null,
      mode: 'free',
      ratio: '',
      rotate: 0,
      width: 0,
      height: 0,
      quality: 100,
      distDirectory: '',
      append: '_cropped',
      mimeType: 'jpeg'
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
      this.$store.dispatch('cropper/fileListEmpty')
      ipcRenderer.send('close')
      this.$destroy()
    },
    handleDelete(index) {
      if (this.$store.state.cropper.fileList.length > 1) {
        this.$store.dispatch('cropper/fileListDelete', index).then(() => {
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
    init(index) {
      this.rotate = 0
      this.$dialog({
        title: '正在载入图像',
        text: '即将完成，请稍后。',
        showConfirm: false
      }).then((dialog) => {
        if (index >= this.$store.state.cropper.fileList.length) {
          this.imageIndex = this.$store.state.cropper.fileList.length - 1
        } else {
          this.imageIndex = index
        }
        let img = document.createElement('img')
        img.src = this.$store.state.cropper.fileList[this.imageIndex].fullpath
        img.onerror = () => {
          if (this.$store.state.cropper.fileList.length == 1) {
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
              viewMode: 2,
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
          let ext = this.mimeType == 'png' ? '.png' : '.jpg'
          let filename = this.$store.state.cropper.fileList[this.imageIndex].filename + this.append + ext
          let distFullpath = path.join(this.distDirectory, filename)
          let canvas = this.cropper.getCroppedCanvas({
            imageSmoothingQuality: 'high'
          })
          let url = canvas.toDataURL('image/' + this.mimeType, this.quality / 100).replace(/^data:image\/\w+;base64,/, "")
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
                    this.$store.dispatch('cropper/fileListDelete', this.imageIndex).then(() => {
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
  
  .el-input-group__append {
    width: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .el-select .el-input {
      width: 80px;
    }
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
  
  #crop {
    width: 100%;
    height: 0;
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    
    #image-container {
      flex-grow: 1;
      height: 100%;
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
    }
  }
}
</style>
