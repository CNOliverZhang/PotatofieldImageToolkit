<template>
  <div id="palette">
    <div class="page-header">
      <div class="page-title">色彩提取工具</div>
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
        <div class="tab-content">
          <div id="image-container">
            <div id="image-wrapper" v-if="image != ''">
              <img id="image" :src="image" />
            </div>
            <el-upload
              id="upload"
              drag
              action=""
              :auto-upload="false"
              :on-change="handleFile"
              :show-file-list="false">
              <i class="fas fa-image"></i>
              <div class="el-upload__text">将图片拖到此处，或<em>点击选择图片</em></div>
            </el-upload>
          </div>
          <div id="colors-wrapper" v-if="colors != null">
            <div id="colors">
              <div class="controller">
                <div class="row">
                  <div class="subtitle">图片的主色调</div>
                </div>
                <div class="row">
                  <div class="color-preview" :style="{
                    'background-color': colors.mainColor.hex
                  }"></div>
                  <div class="color-codes">
                    <div class="row">
                      <div class="color-code">RGB：({{ colors.mainColor.rgb.r }}, {{ colors.mainColor.rgb.g }}, {{ colors.mainColor.rgb.b }})</div>
                      <div
                        class="color-code-copy"
                        @click="copyColorCode('(' + colors.mainColor.rgb.r + ', ' + colors.mainColor.rgb.g + ', ' + colors.mainColor.rgb.b + ')')">复制 RGB 代码</div>
                    </div>
                    <div class="row">
                      <div class="color-code">HEX：{{ colors.mainColor.hex }}</div>
                      <div class="color-code-copy" @click="copyColorCode(colors.mainColor.hex)">复制十六进制代码</div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="subtitle">从图片提取的色盘</div>
                </div>
                <div id="palette-colors" class="row">
                  <div v-for="(color, index) in colors.palette" :key="index">
                    <div
                      class="color-preview"
                      :style="{
                        'background-color': color.hex,
                        'border-color': index == chosenColor ? 'var(--main-color)' : '',
                        'border-width': index == chosenColor ? '3px' : ''
                      }"
                      @click="chooseColor(index)"></div>
                  </div>
                </div>
                <div class="row">
                  <div class="color-preview" :style="{
                    'background-color': colors.palette[chosenColor].hex
                  }"></div>
                  <div class="color-codes">
                    <div class="row">
                      <div class="color-code">RGB：({{ colors.palette[chosenColor].rgb.r }}, {{ colors.palette[chosenColor].rgb.g }}, {{ colors.palette[chosenColor].rgb.b }})</div>
                      <div class="color-code-copy"
                        @click="copyColorCode('(' + colors.palette[chosenColor].rgb.r + ', ' + colors.palette[chosenColor].rgb.g + ', ' + colors.palette[chosenColor].rgb.b + ')')">复制 RGB 代码</div>
                    </div>
                    <div class="row">
                      <div class="color-code">HEX：{{ colors.palette[chosenColor].hex }}</div>
                      <div class="color-code-copy" @click="copyColorCode(colors.palette[chosenColor].hex)">复制十六进制代码</div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="subtitle">导出色盘为图片</div>
                </div>
              </div>
              <div id="palette-image">
                <div
                  v-for="(color, index) in colors.palette"
                  :key="index"
                  class="color"
                  :style="{
                    'background-color': color.hex
                  }"></div>
              </div>
              <div class="controller">
                <div class="control-row">
                  <div class="text">导出选项</div>
                  <el-switch
                    v-model="withOriginalImage"
                    active-color="var(--main-color)"
                    inactive-color="var(--main-color)"
                    active-text="与原图拼接"
                    inactive-text="单独导出"
                    class="half-width-control"></el-switch>
                </div>
                <div class="control-row">
                  <div class="text">存储位置</div>
                  <el-input disabled size="mini" v-model="distDirectory" class="half-width-control">
                    <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
                  </el-input>
                </div>
                <div class="control-row">
                  <div class="text">文件名</div>
                  <el-input size="mini" v-model="filename" class="half-width-control" placeholder="请输入文件名">
                    <el-select v-model="mimeType" size="mini" slot="append">
                      <el-option label=".jpg" value="jpeg"/>
                      <el-option label=".webp" value="webp"/>
                      <el-option label=".png" value="png"/>
                    </el-select>
                  </el-input>
                </div>
                <div class="row">
                  <el-button type="primary" size="mini" @click="save" class="bar-button">导出</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ipcRenderer, clipboard } from 'electron'
import ColorThief from 'colorthief/dist/color-thief.mjs'
import EXIF from 'exif-js'
import html2canvas from 'html2canvas'

const path = require('path')
const fs = require('fs')

export default {
  name: 'palette',
  data () {
    return {
      image: '',
      colors: null,
      chosenColor: 0,
      withOriginalImage: false,
      distDirectory: '',
      filename: '',
      mimeType: 'jpeg'
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
    handleFile(file) {
      this.$dialog({
        title: '正在读取',
        text: '即将完成，请稍候。',
        showConfirm: false
      }).then((dialog) => {
        let ext = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length).toLowerCase()
        let filename = file.name.substring(0, file.name.lastIndexOf("."))
        let formats = new Set(['jpg', 'jpeg', 'webp', 'png'])
        if (formats.has(ext)) {
          this.image = file.raw.path
          let image = document.createElement('img')
          image.src = `file://${this.image}`
          image.onerror = () => {
            dialog.change({
              type: 'error',
              title: '出现错误',
              text: '读取图片失败，请检查图像文件是否正常。',
              showConfirm: true
            })
            this.image = ''
            this.colors = null
            this.chosenColor = 0
          }
          image.onload = () => {
            let colorThief = new ColorThief()
            let mainColor = colorThief.getColor(image)
            mainColor = {
              rgb: {
                r: mainColor[0],
                g: mainColor[1],
                b: mainColor[2]
              },
              hex: '#' + mainColor.map((channel) => {
                channel = channel.toString(16)
                if (channel.length == 1) {
                  return '0' + channel
                } else {
                  return channel
                }
              }).join('').toUpperCase()
            }
            let palette = colorThief.getPalette(image).map((color) => {
              color = {
                rgb: {
                  r: color[0],
                  g: color[1],
                  b: color[2]
                },
                hex: '#' + color.map((channel) => {
                  channel = channel.toString(16)
                  if (channel.length == 1) {
                    return '0' + channel
                  } else {
                    return channel
                  }
                }).join('').toUpperCase()
              }
              return color
            })
            EXIF.getData(image, () => {
              let orientation = EXIF.getTag(image, 'Orientation')
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
              this.colors = {
                mainColor: mainColor,
                palette: palette
              }
              this.chosenColor = 0
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
            })
          }
        } else {
          dialog.change({
            type: 'error',
            title: '不支持该文件格式',
            text: '您选择的文件格式不受支持，无法读取。请选择常见格式的图片文件。',
            showConfirm: true
          })
        }
      })
    },
    chooseColor(index) {
      this.chosenColor = index
    },
    copyColorCode(code) {
      clipboard.writeText(code)
      this.$dialog({
        type: 'success',
        title: '成功',
        text: '已成功将颜色代码复制到剪贴板。'
      })
    },
    selectSaveFolder() {
      this.distDirectory = ipcRenderer.sendSync('select-folder')
    },
    save() {
      if (this.distDirectory === '') {
        this.$dialog({
          type: 'warning',
          text: '请选择保存的目录！'
        })
      } else if (this.filename === '') {
        this.$dialog({
          type: 'warning',
          text: '请输入文件名！'
        })
      } else {
        this.$dialog({
          title: '正在处理',
          text: '即将完成，请稍候。',
          showConfirm: false
        }).then((dialog) => {
          let ext = this.mimeType == 'jpeg' ? '.jpg' : ('.' + this.mimeType)
          let fullname = this.filename + ext
          let distFullpath = path.join(this.distDirectory, fullname)
          let palette = document.getElementById('palette-image')
          let width = window.getComputedStyle(palette).getPropertyValue('width').slice(0, -2)
          let height = window.getComputedStyle(palette).getPropertyValue('height').slice(0, -2)
          if (this.withOriginalImage) {
            let originalImage = document.getElementById('image')
            let scale = originalImage.width / width
            let canvas = document.createElement('canvas')
            canvas.width = width * scale
            canvas.height = height * scale
            html2canvas(palette, {
              canvas: canvas,
              scale: scale,
              backgroundColor: null,
              allowTaint: true,
              imageTimeout: 0
            }).then(canvas => {
              let baseCanvas = document.createElement('canvas')
              baseCanvas.width = originalImage.width
              baseCanvas.height = originalImage.height + canvas.height
              let context = baseCanvas.getContext('2d')
              context.drawImage(originalImage, 0, 0)
              context.drawImage(canvas, 0, originalImage.height)
              let url = baseCanvas.toDataURL('image/jpeg', 1).replace(/^data:image\/\w+;base64,/, "")
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
                  dialog.change({
                    type: 'success',
                    title: '成功',
                    text: '处理完成，导出的图片已保存到目标文件夹。',
                    showConfirm: true
                  })
                }
              })
            })
          } else {
            let scale = 1500 / width
            let canvas = document.createElement('canvas')
            canvas.width = width * scale
            canvas.height = height * scale
            html2canvas(palette, {
              canvas: canvas,
              scale: scale,
              backgroundColor: null,
              allowTaint: true,
              imageTimeout: 0
            }).then(canvas => {
              let url = canvas.toDataURL('image/jpeg', 1).replace(/^data:image\/\w+;base64,/, "")
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
                  dialog.change({
                    type: 'success',
                    title: '成功',
                    text: '处理完成，导出的图片已保存到目标文件夹。',
                    showConfirm: true
                  })
                }
              })
            })
          }
        })
      }
    }
  }
}
</script>

<style lang="scss">
#palette {
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
    
    .el-input-group {
      display: flex;
    
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
    }
    
    .el-switch {
      display: flex;
      justify-content: flex-end;
    }
      
    #image-container {
      width: 0;
      height: 100%;
      flex-grow: 1;
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
          box-shadow: 0 0 10px var(--black);
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
    
    #colors-wrapper {
      width: 0;
      height: 100%;
      flex-grow: 1;
      margin-left: 20px;

      #colors {
        width: 100;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        
        .color-preview {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          border-style: solid;
          border-width: 1px;
          border-color: var(--light-gray);
          box-sizing: border-box;
        }
        
        .color-codes {
          flex-grow: 1;
          margin-left: 15px;
          font-size: 14px;
          
          .row {
            margin-bottom: 0;
            margin-top: 0;
          }
          
          .color-code-copy {
            cursor: pointer;
            transition: 0.2s;
            
            &:hover {
              color: var(--main-color);
            }
          }
        }
        
        .controller {
          margin-bottom: 10px;
          margin-top: 10px;
          
          &:first-child {
            margin-top: 0;
          }
          
          &:last-child {
            margin-bottom: 0;
          }
        }
        
        #palette-colors {
          .color-preview {
            width: 36px;
            height: 36px;
            cursor: pointer;
          }
        }
        
        #palette-image {
          width: 100%;
          height: 0;
          flex-grow: 1;
          display: flex;
          
          .color {
            width: 100%;
            height: 100%;
            flex-grow: 1;
            flex-shrink: 1;
          }
        }
      }
    }
  }
}
</style>
