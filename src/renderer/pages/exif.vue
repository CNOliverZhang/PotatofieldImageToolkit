<template>
  <el-tabs type="card" tab-position="left" id="exif">
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-image"></i> 导入图片</span>
      <div class="tab-content">
        <div id="image-container">
          <div id="image-wrapper" v-if="image != ''">
            <img id="image" :src="image" />
          </div>
          <el-upload
            id="upload"
            drag
            action=""
            class="interactable"
            :auto-upload="false"
            :on-change="handleFile"
            :show-file-list="false">
            <i class="fas fa-image"></i>
            <div class="el-upload__text">将图片拖到此处，或<em>点击选择图片</em></div>
          </el-upload>
        </div>
        <div id="info" class="interactable" v-if="info != null">
          <div class="row">
            <div class="text">
              作者：{{ info.artist ? info.artist : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              相机制造商：{{ info.make ? info.make : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              相机型号：{{ info.model ? info.model : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              拍摄时间：{{ info.time ? info.time : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              曝光补偿：{{ info.exposureBias ? info.exposureBias : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              曝光模式：{{ info.exposureMode ? info.exposureMode : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              曝光程序：{{ info.exposureProgram ? info.exposureProgram : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              快门速度：{{ info.shutterSpeed ? info.shutterSpeed : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              光圈值：{{ info.apertureValue ? info.apertureValue : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              感光度：{{ info.iso ? info.iso : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              镜头焦距：{{ info.focalLength ? info.focalLength : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              等效 35mm 画幅焦距：{{ info.equivalenceFocalLength ? info.equivalenceFocalLength : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              文件横向尺寸：{{ info.width ? info.width : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              文件纵向尺寸：{{ info.height ? info.height : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              图像宽度：{{ info.rotatedWidth ? info.rotatedWidth : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              图像高度：{{ info.rotatedHeight ? info.rotatedHeight : '无信息' }}
            </div>
          </div>
          <div class="row">
            <div class="text">
              软件：{{ info.software ? info.software : '无信息' }}
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane disabled>
      <span slot="label" id="sidebar">
        <div id="tool-info">
          <i id="tool-logo" class="fas fa-camera"></i>
          <div class="text">EXIF 读取工具</div>
        </div>
        <div id="control-button-holder">
          <div class="control-button interactable" @click="hide">
            <i class="fas fa-angle-double-down"></i>
            <div>隐藏</div>
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

export default {
  name: 'exif',
  data () {
    return {
      image: '',
      info: null
    }
  },
  methods: {
    hide() {
      ipcRenderer.send('minimize')
    },
    close() {
      ipcRenderer.send('close')
      this.$destroy()
    },
    handleFile(file) {
      this.$dialog({
        title: '正在读取',
        text: '即将完成，请稍候。',
        showConfirm: false
      }).then((dialog) => {
        let ext = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length).toLowerCase()
        let filename = file.name.substring(0, file.name.lastIndexOf("."))
        if (['jpg', 'jpeg'].indexOf(ext) != -1) {
          this.image = file.raw.path
          let image = document.createElement('img')
          image.src = this.image
          image.onerror = () => {
            dialog.change({
              type: 'error',
              title: '出现错误',
              text: '读取图片失败，请检查图像文件是否正常。',
              showConfirm: true
            })
            this.image = ''
            this.info = null
          }
          image.onload = () => {
            EXIF.getData(image, () => {
              let tags = EXIF.getAllTags(image)
              if (Object.keys(tags).length == 0) {
                dialog.change({
                  type: 'error',
                  title: '未读取到信息',
                  text: '由照相机拍摄的 JPEG 文件才具有 EXIF 信息。',
                  showConfirm: true
                })
                this.image = ''
                this.info = null
              } else {
                let orientation = tags.Orientation
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
                let exposureMode = tags.ExposureMode
                if (exposureMode == 0) {
                  exposureMode = '自动曝光'
                } else if (exposureMode == 1) {
                  exposureMode = '手动曝光'
                } else if (exposureMode == 2) {
                  exposureMode = '自动包围曝光'
                } else {
                  exposureMode = null
                }
                let exposureProgram = tags.ExposureProgram
                if (exposureProgram == 'Manual') {
                  exposureProgram = '手动曝光'
                } else if (exposureProgram == 'Normal program') {
                  exposureProgram = '程序自动曝光'
                } else if (exposureProgram == 'Aperture priority') {
                  exposureProgram = '光圈优先'
                } else if (exposureProgram == 'Shutter priority') {
                  exposureProgram = '快门优先'
                } else {
                  exposureProgram = null
                }
                let info = {
                  artist: tags.Artist,
                  make: tags.Make,
                  model: tags.Model,
                  time: tags.DateTime ? (tags.DateTime.replace(/ /, ' 日 ').replace(/:/, ' 年 ').replace(/:/, ' 月 ')) : null,
                  exposureBias: tags.ExposureBias ? (tags.ExposureBias + ' 档') : null,
                  exposureMode: exposureMode,
                  exposureProgram: exposureProgram,
                  shutterSpeed: tags.ExposureTime ? (tags.ExposureTime.numerator + ' / ' + tags.ExposureTime.denominator + ' 秒') : null,
                  apertureValue: tags.FNumber ? ('F / ' + tags.FNumber.numerator / tags.FNumber.denominator) : null,
                  focalLength: tags.FocalLength ? (tags.FocalLength.numerator / tags.FocalLength.denominator + ' mm') : null,
                  equivalenceFocalLength: tags.FocalLengthIn35mmFilm ? (tags.FocalLengthIn35mmFilm + ' mm') : null,
                  iso: tags.ISOSpeedRatings ? ('ISO ' + tags.ISOSpeedRatings) : null,
                  software: tags.Software,
                  width: tags.PixelXDimension ? (tags.PixelXDimension + ' 像素') : null,
                  height: tags.PixelYDimension ? (tags.PixelYDimension + ' 像素') : null,
                  rotatedWidth: width + ' 像素',
                  rotatedHeight: height + ' 像素'
                }
                this.info = info
                dialog.close()
                let canvas = document.createElement('canvas')
                canvas.height = height
                canvas.width = width
                let context = canvas.getContext("2d")
                context.rotate(rotation * Math.PI / 180)
                context.drawImage(image, x, y)
                context.rotate(-rotation * Math.PI / 180)
                canvas.style['max-width'] = '100%'
                canvas.style['max-height'] = '100%'
                canvas.style.display = 'block'
                let img = document.getElementById('image')
                img.parentNode.replaceChild(canvas, img)
                canvas.id = 'image'
              }
            })
          }
        } else {
          dialog.change({
            type: 'error',
            title: '格式不正确',
            text: '仅支持读取 JPEG 文件的 EXIF 信息！',
            showConfirm: true
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
#exif {
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
  }
  
  .el-tab-pane {
    width: 100%;
    height: 100%;
  }
  
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
    
  #image-container {
    flex-grow: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: 0.5s;
    
    #image-wrapper {
      width: 100%;
      height: calc(50% - 5px);
      margin-bottom: 10px;
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
    }
    
    #upload {
      width: 100%;
      flex-grow: 1;
      display: flex;
      justify-content: space-between;
      transition: 0.5s;
      
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
  }
  
  #info {
    width: calc(50% - 5px);
    height: 100%;
    flex-shrink: 0;
    margin-left: 10px;
    background-color: var(--black-gray);
    padding: 10px;
    box-sizing: border-box;
    border-radius: 6px;
    overflow-x: hidden;
    overflow-y: scroll;
    
    .text {
      color: var(--white);
    }
    
    &::-webkit-scrollbar {
      width: 10px;
    }
        
    &::-webkit-scrollbar-track {
      border-radius: 5px;
      background-color: var(--white-gray);
      
      &:hover {
        background-color: var(--light-gray);
      }
    }
    
    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      background-color: var(--gray);
      transition: 0.2s;
      
      &:hover {
        background-color: var(--dark-gray);
      }
    }
  }
}
</style>
