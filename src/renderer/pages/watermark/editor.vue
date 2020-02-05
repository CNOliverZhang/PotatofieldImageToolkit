<template>
  <div id="watermark-editor">
    <div id="preview">
      <div id="sample-container">
        <div id="sample"></div>
        <div
          id="watermark-container"
          :style="{
            'width': sampleWidth + 'px',
            'height': sampleHeight + 'px'
          }">
          <div
            id="watermark"
            :style="{
              'left': (position == 'left-top' || position == 'left-bottom' || position == 'left' || position == 'center' || position == 'top' || position == 'bottom') ? x + 'px' : null,
              'right': (position == 'right-top' || position == 'right-bottom' || position == 'right') ? x + 'px' : null,
              'top': (position == 'left-top' || position == 'right-top' || position == 'top' || position == 'center' || position == 'left' || position == 'right') ? y + 'px' : null,
              'bottom': (position == 'left-bottom' || position == 'right-bottom' || position == 'bottom') ? y + 'px' : null,
              'color': color,
              'font-family': font,
              'font-size': fontSize + 'px',
              'transform': 'rotate(' + rotation + 'deg)',
              'writing-mode': writingMode,
              'text-align': textAlign,
              'line-height': lineHeight + 'em'
            }">
              <div
                v-for="(line, index) in text.split('\n')" :key="index">
                <span
                  v-for="(char, index) in line"
                  :key="index"
                  :style="{
                    'margin-left': letterSpacing / 10 + 'em',
                    'margin-right': letterSpacing / 10 + 'em'
                  }">{{ char }}</span>
              </div>
            </div>
        </div>
      </div>
      <div id="lists">
        <div id="file-list">
          <div class="row">
            <div class="subtitle">待处理的文件</div>
          </div>
          <div id="list" class="interactable">
            <div
              v-for="(file, index) in this.$store.state.watermark.fileList.slice(fileListPage * 100 - 100, fileListPage * 100)"
              :key="file.fullpath"
              class="file"
              @click="preview(index + (fileListPage - 1) * 100)">
              <div class="filename">{{ file.filename + '.' + file.ext }}</div>
              <div @click.stop="handleDelete(index + (fileListPage - 1) * 100)">
                <i class="fas fa-trash-alt delete"></i>
              </div>
            </div>
          </div>
          <div v-if="this.$store.state.watermark.fileList.length > 100" class="row interactable">
            <el-pagination
              class="interactable"
              small
              background
              layout="pager"
              :pager-count="5"
              :page-size="100"
              :total="this.$store.state.watermark.fileList.length"
              :current-page="fileListPage"
              :hide-on-single-page="true"
              @current-change="pageChange">
            </el-pagination>
          </div>
        </div>
        <div id="template-list">
          <div class="row">
            <div class="subtitle">已保存的模板</div>
          </div>
          <div v-if="this.$store.state.watermark.templates.length != 0" id="list" class="interactable">
            <div
              v-for="(template, index) in this.$store.state.watermark.templates"
              :key="template.title"
              class="template">
              <div class="cover">
                <div class="action interactable" @click="applyTemplate(index)">
                  <span class="fa fa-check-circle"></span>
                  <div>应用</div>
                </div>
                <div class="action interactable" @click="deleteTemplate(index)">
                  <span class="fa fa-trash-alt"></span>
                  <div>删除</div>
                </div>
              </div>
              <div class="text">{{ template.title }}</div>
              <v-clamp :max-lines="2" class="subtext">内容：{{ template.text }}</v-clamp>
            </div>
          </div>
          <div v-else id="empty-container">
            <div id="empty">
              <i class="far fa-folder-open"></i>
              <div>尚无已保存的模板</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="control" class="interactable">
      <div>
        <el-input
          :rows="2"
          v-model="text"
          type="textarea"
          resize="none"
          placeholder="请输入水印内容"></el-input>
        <div class="row">
          <div class="subtitle">水印样式设置</div>
        </div>
        <div class="control-row">
          <div class="text">水印文字方向</div>
          <el-select v-model="writingMode" placeholder="请选择" size="mini">
            <el-option label="水平" value="horizontal-tb"/>
            <el-option label="垂直从右至左" value="vertical-rl"/>
            <el-option label="垂直从左至右" value="vertical-lr"/>
          </el-select>
        </div>
        <div class="control-row">
          <div class="text">多行水印对齐方式</div>
          <el-select v-model="textAlign" placeholder="请选择" size="mini">
            <el-option label="居中对齐" value="center"/>
            <el-option label="行首对齐" value="left"/>
            <el-option label="行尾对其" value="right"/>
          </el-select>
        </div>
        <div class="control-row">
          <div class="text">多行水印行距</div>
          <el-slider
            v-model="lineHeight"
            class="control"
            :min="1"
            :max="10"
            :step="0.1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="control-row">
          <div class="text">水印文字间距</div>
          <el-slider
            v-model="letterSpacing"
            class="control"
            :min="0"
            :max="100"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="control-row">
          <div class="text">水印位置基准</div>
          <el-select v-model="position" @change="changePosition" placeholder="请选择" size="mini">
            <el-option label="中央" value="center"/>
            <el-option label="左上角" value="left-top"/>
            <el-option label="右上角" value="right-top"/>
            <el-option label="左下角" value="left-bottom"/>
            <el-option label="右下角" value="right-bottom"/>
            <el-option label="上方" value="top"/>
            <el-option label="下方" value="bottom"/>
            <el-option label="左侧" value="left"/>
            <el-option label="右侧" value="right"/>
          </el-select>
        </div>
        <div
          v-if="position == 'left-top' || position == 'left-bottom' || position == 'left' || position == 'right-top' || position == 'right-bottom' || position == 'right'"
          class="control-row">
          <div v-if="position == 'left-top' || position == 'left-bottom' || position == 'left'" class="text">水印与左边缘的距离</div>
          <div v-if="position == 'right-top' || position == 'right-bottom' || position == 'right'" class="text">水印与右边缘的距离</div>
          <el-slider
            v-model="offsetX"
            class="control"
            :min="0"
            :max="100"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div
          v-if="position == 'left-top' || position == 'left-bottom' || position == 'top' || position == 'right-top' || position == 'right-bottom' || position == 'bottom'"
          class="control-row">
          <div v-if="position == 'left-top' || position == 'right-top' || position == 'top'" class="text">水印与上边缘的距离</div>
          <div v-if="position == 'left-bottom' || position == 'right-bottom' || position == 'bottom'" class="text">水印与下边缘的距离</div>
          <el-slider
            v-model="offsetY"
            class="control"
            :min="0"
            :max="100"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="control-row">
          <div class="text">水印旋转角度</div>
          <el-slider
            v-model="rotation"
            class="control"
            :min="-180"
            :max="180"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="control-row">
          <div class="text">水印字体</div>
          <el-select v-model="font" placeholder="请选择" size="mini">
            <el-option-group label="中英文字体">
              <el-option label="思源黑体(细)" value="NotoSansSCThin" style="font-family: NotoSansSCThin;"/>
              <el-option label="思源黑体(粗)" value="NotoSansSCBlack" style="font-family: NotoSansSCBlack;"/>
              <el-option label="思源宋体(细)" value="NotoSerifSCThin" style="font-family: NotoSerifSCThin;"/>
              <el-option label="思源宋体(粗)" value="NotoSerifSCBlack" style="font-family: NotoSerifSCBlack;"/>
              <el-option label="站酷庆科黄油体" value="ZCoolHuangyou" style="font-family: ZCoolHuangyou;"/>
              <el-option label="站酷小薇LOGO体" value="ZCoolXiaowei" style="font-family: ZCoolXiaowei;"/>
              <el-option label="站酷快乐体" value="ZCoolKuaile" style="font-family: ZCoolKuaile;"/>
              <el-option label="站酷文艺体" value="ZCoolWenyi" style="font-family: ZCoolWenyi;"/>
              <el-option label="站酷酷黑体" value="ZCoolKuhei" style="font-family: ZCoolKuhei;"/>
              <el-option label="站酷高端黑体" value="ZCoolGaoduanhei" style="font-family: ZCoolGaoduanhei;"/>
            </el-option-group>
            <el-option-group label="纯英文字体">
              <el-option label="ZCOOL Addict Italic" value="ZCoolAddict" style="font-family: ZCoolAddict;"></el-option>
            </el-option-group>
          </el-select>
        </div>
        <div class="control-row">
          <div class="text">水印字体大小</div>
          <el-slider
            v-model="relativeFontSize"
            class="control"
            :min="1"
            :max="100"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="control-row">
          <div class="text">水印颜色</div>
          <el-color-picker v-model="color" size="mini" :show-alpha="true"></el-color-picker>
        </div>
        <div class="row">
          <div class="subtitle">保存设置</div>
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
        <div v-if="srcDirectory != '' && customDistDirectory" class="control-row">
          <div class="text">目录结构</div>
          <el-switch
            v-model="keepDirectoryStructure"
            active-text="保持目录结构"
            inactive-text="不保持目录结构"
            class="control"></el-switch>
        </div>
        <div class="control-row">
          <div class="text">保存的图片格式</div>
          <el-radio-group v-model="mimeType" class="control">
            <el-radio label="JPEG"></el-radio>
            <el-radio label="PNG"></el-radio>
            <el-radio label="保持原格式"></el-radio>
          </el-radio-group>
        </div>
        <div class="control-row">
          <div class="text">文件名后缀</div>
          <el-input size="mini" v-model="append" maxlength="12" class="control"></el-input>
        </div>
      </div>
      <div id="control-buttons">
        <el-button type="primary" size="mini" @click="close" class="control-button">退出编辑器</el-button>
        <el-button type="primary" size="mini" @click="saveAsTemplate" class="control-button">保存为模板</el-button>
        <el-button type="primary" size="mini" @click="start" class="control-button">处理这张图片</el-button>
        <el-button type="primary" size="mini" @click="startAll" class="control-button">处理全部图片</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import CreateDirectory from '../../utils/CreateDirectory'
import ResizeObserver from 'resize-observer-polyfill'
import html2canvas from 'html2canvas'
import EXIF from 'exif-js'

const path = require('path')
const fs = require('fs')

export default {
  name: 'watermarkEditor',
  data () {
    return  {
      customDistDirectory: false,
      distDirectory: '',
      srcDirectory: this.$route.query.srcDirectory,
      keepDirectoryStructure: false,
      mimeType: 'JPEG',
      append: '_watermarked',
      fileListPage: 1,
      imageIndex: -1,
      text: '',
      writingMode: 'horizontal-tb',
      textAlign: 'center',
      lineHeight: 1,
      letterSpacing: 0,
      position: 'center',
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      color: '#FFFFFF',
      font: "NotoSansSCThin",
      relativeFontSize: 5,
      sizeBaseX: 0,
      sizeBaseY: 0,
      sampleWidth: 0,
      sampleHeight: 0,
      watermarkWidth: 0,
      watermarkHeight: 0,
      templateTitle: '',
      errorList: []
    }
  },
  computed: {
    fontSize() {
      return this.relativeFontSize * this.sizeBaseX
    },
    x() {
      let watermark = document.getElementById('watermark')
      if (this.position == 'top' || this.position == 'bottom' || this.position == 'center') {
        return ((this.sampleWidth - this.watermarkWidth) / 2)
      } else {
        let ratio = 1 - this.watermarkWidth / this.sampleWidth
        return this.offsetX * this.sizeBaseX * (ratio)
      }
    },
    y() {
      let watermark = document.getElementById('watermark')
      if (this.position == 'left' || this.position == 'right' || this.position == 'center') {
        return ((this.sampleHeight - this.watermarkHeight) / 2)
      } else {
        let ratio = 1 - this.watermarkHeight / this.sampleHeight
        return this.offsetY * this.sizeBaseY * (ratio)
      }
    }
  },
  methods: {
    close() {
      this.$store.dispatch('watermark/fileListEmpty')
      ipcRenderer.send('close')
      this.$destroy()
    },
    pageChange(page) {
      this.fileListPage = page
    },
    handleDelete(index) {
      if (this.$store.state.watermark.fileList.length > 1) {
        if (this.$store.state.watermark.fileList.length % 100 == 1) {
          if (this.fileListPage == Math.ceil(this.$store.state.watermark.fileList.length / 100)) {
            if (this.fileListPage != 1) {
              this.fileListPage -= 1
            }
          }
        }
        if (this.imageIndex > index) {
          this.imageIndex -= 1
        } else if (this.imageIndex == index) {
          setTimeout(() => {
            this.preview(this.imageIndex)
          }, 100)
        }
        this.$store.dispatch('watermark/fileListDelete', index)
      } else {
        this.close()
      }
    },
    preview(index) {
      if (this.imageIndex != index) {
        let dialog = this.$dialog({
          title: '正在载入图像',
          text: '即将完成，请稍候。',
          showConfirm: false
        })
        if (index >= this.$store.state.watermark.fileList.length) {
          this.imageIndex = this.$store.state.watermark.fileList.length - 1
        } else {
          this.imageIndex = index
        }
        let image = document.createElement('img')
        image.src = this.$store.state.watermark.fileList[this.imageIndex].fullpath
        image.onerror = () => {
          if (this.$store.state.watermark.fileList.length == 1) {
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
            this.$store.dispatch('watermark/fileListDelete', index)
            dialog.change({
              type: 'error',
              title: '出现错误',
              text: '图像文件读取错误，生成预览失败。已从待处理列表中移除该文件。',
              showConfirm: true,
              confirmFunction: () => {
                this.preview(index)
              }
            })
          }
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
            context.drawImage(image, x, y)
            context.rotate(-rotation * Math.PI / 180)
            canvas.style['max-width'] = '100%'
            canvas.style['max-height'] = '100%'
            canvas.style.display = 'block'
            let sample = document.getElementById('sample')
            sample.parentNode.replaceChild(canvas, sample)
            canvas.id = 'sample'
            let style = window.getComputedStyle(canvas)
            let viewWidth = style.getPropertyValue('width').slice(0, -2)
            let viewHeight = style.getPropertyValue('height').slice(0, -2)
            this.sampleWidth = viewWidth
            this.sampleHeight = viewHeight
            this.sizeBaseX = viewWidth / 100
            this.sizeBaseY = viewHeight / 100
            dialog.close()
          })
        }
      }
    },
    changePosition() {
      this.offsetX = 0
      this.offsetY = 0
    },
    selectSaveFolder() {
      this.distDirectory = ipcRenderer.sendSync('select-folder')
    },
    applyTemplate(index) {
      this.text = this.$store.state.watermark.templates[index].text
      this.writingMode = this.$store.state.watermark.templates[index].writingMode
      this.textAlign = this.$store.state.watermark.templates[index].textAlign
      this.lineHeight = this.$store.state.watermark.templates[index].lineHeight
      this.letterSpacing = this.$store.state.watermark.templates[index].letterSpacing
      this.position = this.$store.state.watermark.templates[index].position
      this.offsetX = this.$store.state.watermark.templates[index].offsetX
      this.offsetY = this.$store.state.watermark.templates[index].offsetY
      this.rotation = this.$store.state.watermark.templates[index].rotation
      this.color = this.$store.state.watermark.templates[index].color
      this.font = this.$store.state.watermark.templates[index].font
      this.relativeFontSize = this.$store.state.watermark.templates[index].relativeFontSize
    },
    deleteTemplate(index) {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '确定要删除这个模板吗？',
        showCancel: true,
        confirmFunction: (index) => {
          this.$store.dispatch('watermark/templateDelete', index)
        }
      })
    },
    saveAsTemplate() {
      if (this.text.length == 0) {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字！'
        })
      } else {
        let template =  {
          title: this.templateTitle,
          text: this.text,
          writingMode: this.writingMode,
          textAlign: this.textAlign,
          lineHeight: this.lineHeight,
          letterSpacing: this.letterSpacing,
          position: this.position,
          offsetX: this.offsetX,
          offsetY: this.offsetY,
          rotation: this.rotation,
          color: this.color,
          font: this.font,
          relativeFontSize: this.relativeFontSize,
        }
        let checkName = (title) => {
          if (title == '') {
            this.$dialog({
              type: 'error',
              title: '错误',
              text: '请输入模板标题，否则无法保存该模板。',
              showCancel: true,
              confirmFunction: () => {
                this.$dialog({
                  title: '请输入水印模板标题',
                  content: this.$createElement('div', {
                    'class': 'el-input el-input--mini'
                  }, [
                    this.$createElement('input', {
                      'dom-props': {
                        value: this.templateTitle,
                      },
                      'on': {
                        input: (event) => {
                          this.templateTitle = event.target.value
                        }
                      },
                      'class': 'el-input__inner',
                      'style': {
                        'font-family': 'var(--main-font)'
                      }
                    })
                  ]),
                  showCancel: true,
                  confirmFunction: () => {
                    checkName(this.templateTitle)
                    this.templateTitle = ''
                  },
                  cancelFunction: () => {
                    this.templateTitle = ''
                  }
                })
              }
            })
          } else {
            for (let i = 0; i < this.$store.state.watermark.templates.length; i++) {
              if (title == this.$store.state.watermark.templates[i].title) {
                this.$dialog({
                  type: 'warning',
                  title: '需要重命名',
                  text: '已存在同名模板，您需要更改当前模板的标题才能将其保存。',
                  showCancel: true,
                  confirmFunction: () => {
                    this.$dialog({
                      title: '请输入水印模板标题',
                      content: this.$createElement('div', {
                        'class': 'el-input el-input--mini'
                      }, [
                        this.$createElement('input', {
                          'dom-props': {
                            value: this.templateTitle,
                          },
                          'on': {
                            input: (event) => {
                              this.templateTitle = event.target.value
                            }
                          },
                          'class': 'el-input__inner',
                          'style': {
                            'font-family': 'var(--main-font)'
                          }
                        })
                      ]),
                      showCancel: true,
                      confirmFunction: () => {
                        checkName(this.templateTitle)
                        this.templateTitle = ''
                      },
                      cancelFunction: () => {
                        this.templateTitle = ''
                      }
                    })
                  }
                })
                return
              }
            }
            template.title = title
            this.$store.dispatch('watermark/templatePush', template)
            this.$dialog({
              type: 'success',
              title: '成功',
              text: '水印模板保存成功。'
            })
          }
        }
        this.$dialog({
          title: '请输入水印模板标题',
          content: this.$createElement('div', {
            'class': 'el-input el-input--mini'
          }, [
            this.$createElement('input', {
              'dom-props': {
                value: this.templateTitle,
              },
              'on': {
                input: (event) => {
                  this.templateTitle = event.target.value
                }
              },
              'class': 'el-input__inner',
              'style': {
                'font-family': 'var(--main-color)'
              }
            })
          ]),
          showCancel: true,
          confirmFunction: () => {
            checkName(this.templateTitle)
            this.templateTitle = ''
          },
          cancelFunction: () => {
            this.templateTitle = ''
          }
        })
      }
    },
    start() {
      if (this.text.length == 0) {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字！'
        })
      } else if (this.customDistDirectory && this.distDirectory == '') {
        this.$dialog({
          type: 'warning',
          text: '请您选择保存的目录！'
        })
      } else {
        let dialog = this.$dialog({
          title: '正在处理',
          text: '即将完成，请稍候。',
          showConfirm: false
        })
        let imageInfo = this.$store.state.watermark.fileList[this.imageIndex]
        let distExt
        if (this.mimeType == '保持原格式') {
          distExt = imageInfo.ext
        } else if (this.mimeType == 'JPEG') {
          distExt = 'jpg'
        } else {
          distExt = 'png'
        }
        let mimeType
        if (distExt == 'png') {
          mimeType = 'png'
        } else {
          mimeType = 'jpeg'
        }
        let distFilename = imageInfo.filename + this.append + '.' + distExt
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
        let baseCanvas = document.getElementById('sample')
        let scale = baseCanvas.width / this.sampleWidth
        html2canvas(document.getElementById('watermark-container'), {
          scale: scale,
          backgroundColor: null
        }).then(canvas => {
          let context = baseCanvas.getContext('2d')
          context.drawImage(canvas, 0, 0)
          let url = baseCanvas.toDataURL('image/' + mimeType).replace(/^data:image\/\w+;base64,/, "")
          let buffer = new Buffer.from(url, 'base64')
          CreateDirectory(distPath)
          fs.writeFile(distFullpath, buffer, (error) => {
            if (error) {
              dialog.change({
                type: 'error',
                title: '出现错误',
                text: '写入文件失败，请检查目标文件夹权限。',
                showConfirm: true
              })
            } else {
              if (this.$store.state.watermark.fileList.length > 1) {
                dialog.change({
                  type: 'success',
                  title: '成功',
                  text: '处理完成，添加水印后的图片已保存到目标文件夹。',
                  showConfirm: true,
                  confirmFunction: () => {
                    if (this.fileListPage != 1) {
                      if (this.fileListPage == Math.ceil(this.$store.state.watermark.fileList.length / 100)) {
                        if (this.$store.state.watermark.fileList.length % 100 == 1) {
                          this.fileListPage -= 1
                        }
                      }
                    }
                    setTimeout(() => {
                      this.preview(this.imageIndex)
                    }, 100)
                    this.$store.dispatch('watermark/fileListDelete', this.imageIndex)
                  }
                })
              } else {
                dialog.change({
                  type: 'success',
                  title: '成功',
                  text: '处理完成，添加水印后的图片已保存到目标文件夹。列表中的图片已全部处理完成，即将退出编辑器。',
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
    },
    startAll() {
      if (this.text.length == 0) {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字！'
        })
      } else if (this.customDistDirectory && this.distDirectory == '') {
        this.$dialog({
          type: 'warning',
          text: '请您选择保存的目录！'
        })
      } else {
        let dialog = this.$dialog({
          title: '正在处理',
          text: '即将完成，请稍候。',
          showConfirm: false
        })
        let handle = (index) => {
          let imageInfo = this.$store.state.watermark.fileList[index]
          let distExt
          if (this.mimeType == '保持原格式') {
            distExt = imageInfo.ext
          } else if (this.mimeType == 'JPEG') {
            distExt = 'jpg'
          } else {
            distExt = 'png'
          }
          let mimeType
          if (distExt == 'png') {
            mimeType = 'png'
          } else {
            mimeType = 'jpeg'
          }
          let distFilename = imageInfo.filename + this.append + '.' + distExt
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
          image.src = this.$store.state.watermark.fileList[index].fullpath
          image.onerror = () => {
            this.errorList.push(imageInfo.fullpath)
            if (index < this.$store.state.watermark.fileList.length - 1) {
              dialog.change({
                text: '正在处理第 ' + String(index + 1) + ' 张，共 ' + String(this.$store.state.watermark.fileList.length) + ' 张。'
              })
              return handle(index + 1)
            } else {
              if (this.errorList.length == 0) {
                dialog.change({
                  type: 'success',
                  title: '成功',
                  text: '全部图片处理完成。',
                  showConfirm: true,
                  confirmFunction: () => {
                    this.close()
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
                    this.close()
                  }
                })
              }
            }
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
              context.drawImage(image, x, y)
              context.rotate(-rotation * Math.PI / 180)
              canvas.style['max-width'] = '100%'
              canvas.style['max-height'] = '100%'
              canvas.style.display = 'block'
              let sample = document.getElementById('sample')
              sample.parentNode.replaceChild(canvas, sample)
              canvas.id = 'sample'
              let style = window.getComputedStyle(canvas)
              let viewWidth = style.getPropertyValue('width').slice(0, -2)
              let viewHeight = style.getPropertyValue('height').slice(0, -2)
              this.sampleWidth = viewWidth
              this.sampleHeight = viewHeight
              this.sizeBaseX = viewWidth / 100
              this.sizeBaseY = viewHeight / 100
              let scale = width / viewWidth
              setTimeout(() => {
                html2canvas(document.getElementById('watermark-container'), {
                  scale: scale,
                  backgroundColor: null,
                }).then((coverCanvas) => {
                  context.drawImage(coverCanvas, 0, 0)
                  let url = canvas.toDataURL('image/' + mimeType).replace(/^data:image\/\w+;base64,/, "")
                  let buffer = new Buffer.from(url, 'base64')
                  CreateDirectory(distPath)
                  fs.writeFile(distFullpath, buffer, (error) => {
                    if (error) {
                      this.errorList.push(imageInfo.fullpath)
                    }
                    if (index < this.$store.state.watermark.fileList.length - 1) {
                      dialog.change({
                        text: '正在处理第 ' + String(index + 1) + ' 张，共 ' + String(this.$store.state.watermark.fileList.length) + ' 张。'
                      })
                      return handle(index + 1)
                    } else {
                      if (this.errorList.length == 0) {
                        dialog.change({
                          type: 'success',
                          title: '成功',
                          text: '全部图片处理完成。',
                          showConfirm: true,
                          confirmFunction: () => {
                            this.close()
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
                            this.close()
                          }
                        })
                      }
                    }
                  })
                })
              }, 100)
            })
          }
        }
        handle(0)
      }
    }
  },
  mounted() {
    this.preview(0)
    const WatermarkSizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        this.watermarkWidth = entry.contentRect.width
        this.watermarkHeight = entry.contentRect.height
      })
    })
    WatermarkSizeObserver.observe(document.getElementById('watermark'))
  }
}
</script>

<style lang="scss">  
.el-color-picker__panel {
  -webkit-app-region: no-drag;
  
  button {
    font-family: var(--main-font);
  }
}

#watermark-editor {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
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
    height: 21px;
    flex-shrink: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    
    .el-switch {
      display: flex;
      justify-content: flex-end;
    }
    
    .el-radio-group {
      display: flex;
      justify-content: flex-end;
    }
    
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
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  #preview {
    width: calc(50% - 10px);
    height: 100%;
    display: flex;
    flex-direction: column;
    
    #sample-container {
      width: 100%;
      height: 300px;
      flex-shrink: 0;
      background-color: var(--black-gray);
      border-radius: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      position: relative;
        
      #sample {
        max-width: 100%;
        max-height: 100%;
      }
      
      #watermark-container {
        position: absolute;
        overflow: hidden;
        white-space: nowrap;
        
        #watermark {
          position: absolute;
          width: fit-content;
          height: fit-content;
          line-height: 1em;
        }
      }
    }
    
    #lists {
      width: 100%;
      height: 0;
      flex-grow: 1;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      
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
        
        .el-pagination {
          flex-grow: 1;
          text-align: center;
          padding: 0;
          
          li {
            min-width: 24px;
            height: 28px;
            line-height: 28px;
            
            &:first-child {
              margin-left: 0;
            }
            
            &:last-child {
              margin-right: 0;
            }
          }
        }
      }
      
      #template-list {
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
          
          .template {
            position: relative;
            height: 80px;
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            background-color: var(--white);
            border-bottom-color: var(--light-gray);
            border-bottom-style: solid;
            border-bottom-width: 1px;
            
            .text {
              width: 100%;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            
            .cover {
              position: absolute;
              width: 100%;
              height: 100%;
              top: 0;
              left: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: var(--white);
              opacity: 0;
              transition: 0.2s;
              
              .action {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                font-size: 12px;
                width: 32px;
                margin-left: 10px;
                margin-right: 10px;
                transition: 0.2s;
                
                svg {
                  font-size: 20px;
                  margin: 5px;
                }
                
                &:hover {
                  color: var(--main-color);
                }
                
                &:active {
                  filter: brightness(0.9);
                }
              }
              
              &:hover {
                opacity: 1;
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
        
        #empty-container {
          width: 100%;
          flex-grow: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: var(--white-gray);
          box-sizing: border-box;
          border-radius: 6px;
          border-color: var(--light-gray);
          border-style: solid;
          border-width: 1px;
          
          #empty {
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
        }
      }
    }
  }
  
  #control {
    width: calc(50% - 10px);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .el-textarea__inner {
      font-family: var(--main-font)
    }
      
    textarea {
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
    
    #control-buttons {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      
      .control-button {
        width: 100%;
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
