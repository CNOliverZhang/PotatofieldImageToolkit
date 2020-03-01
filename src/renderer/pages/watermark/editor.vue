<template>
  <div id="watermark-editor">
    <div id="left">
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
              'padding': backgroundSize / 100 + 'em',
              'background-color': backgroundColor,
              'text-shadow': textShadow
            }">
            <div
              v-for="(line, index) in text.split('\n')"
              :key="index"
              :style="{
                'margin-top': index == 0 ? 0 : String(lineHeight - 1) + 'em'
              }">
              <span
                v-for="(char, index) in line"
                :key="index"
                :style="{
                  'margin-left': index == 0 ? 0 : letterSpacing / 10 + 'em'
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
              <i class="fas fa-folder-open"></i>
              <div>尚无已保存的模板</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="right" class="interactable">
      <div>
        <div class="row">
          <div class="subtitle">水印设置</div>
        </div>
        <el-collapse value="content" accordion>
          <el-collapse-item title="水印内容" name="content">
            <el-input
              :rows="5"
              v-model="text"
              type="textarea"
              resize="none"
              placeholder="请输入水印内容"></el-input>
          </el-collapse-item>
          <el-collapse-item title="水印文字样式" name="style">
            <div class="control-row">
              <div class="text">水印字体</div>
              <el-select v-model="font" placeholder="请选择" size="mini" class="control">
                <el-option
                  v-for="(font, index) in this.$store.state.fonts.fontList"
                  :key="index"
                  :label="font.verbose + '（' + font.style + '）'"
                  :value="font.fontFamily"
                  :style="{
                    'font-family': font.fontFamily
                  }"/>
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
              <div class="text">水印字体颜色</div>
              <el-color-picker v-model="color" size="mini" :show-alpha="true"></el-color-picker>
            </div>
          </el-collapse-item>
          <el-collapse-item title="水印背景" name="background">
            <div class="control-row">
              <div class="text">水印背景尺寸</div>
              <el-slider
                v-model="backgroundSize"
                class="control"
                :min="0"
                :max="300"
                :step="1"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">水印背景颜色</div>
              <el-color-picker v-model="backgroundColor" size="mini" :show-alpha="true"></el-color-picker>
            </div>
          </el-collapse-item>
          <el-collapse-item title="水印阴影" name="shadow">
            <div class="control-row">
              <div class="text">水印阴影水平位置</div>
              <el-slider
                v-model="textShadowX"
                class="control"
                :min="-1"
                :max="1"
                :step="0.01"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">水印阴影垂直位置</div>
              <el-slider
                v-model="textShadowY"
                class="control"
                :min="-1"
                :max="1"
                :step="0.01"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">水印阴影模糊</div>
              <el-slider
                v-model="textShadowBlur"
                class="control"
                :min="0"
                :max="1"
                :step="0.01"
                :show-input="true"
                input-size="mini"></el-slider>
            </div>
            <div class="control-row">
              <div class="text">水印阴影颜色</div>
              <el-color-picker v-model="textShadowColor" size="mini" :show-alpha="true"></el-color-picker>
            </div>
          </el-collapse-item>
          <el-collapse-item title="水印文字位置" name="position">
            <div class="control-row">
              <div class="text">水印位置基准</div>
              <el-select v-model="position" @change="changePosition" placeholder="请选择" size="mini" class="control">
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
          </el-collapse-item>
          <el-collapse-item title="水印文字排版" name="typesetting">
            <div class="control-row">
              <div class="text">水印文字方向</div>
              <el-select v-model="writingMode" placeholder="请选择" size="mini" class="control">
                <el-option label="水平" value="horizontal-tb"/>
                <el-option label="垂直从右至左" value="vertical-rl"/>
                <el-option label="垂直从左至右" value="vertical-lr"/>
              </el-select>
            </div>
            <div class="control-row">
              <div class="text">多行水印对齐方式</div>
              <el-select v-model="textAlign" placeholder="请选择" size="mini" class="control">
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
          </el-collapse-item>
        </el-collapse>
      </div>
      <div>
        <div class="row">
          <div class="subtitle">保存设置</div>
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
          <el-button type="primary" size="mini" @click="saveAsTemplate" class="bar-button">保存模板</el-button>
          <el-button type="primary" size="mini" @click="start" class="bar-button">处理本张</el-button>
          <el-button type="primary" size="mini" @click="startAll" class="bar-button">批量处理</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import CreateDirectory from '../../utils/CreateDirectory'
import html2canvas from 'html2canvas'
import EXIF from 'exif-js'

const path = require('path')
const fs = require('fs')

export default {
  name: 'watermarkEditor',
  data () {
    return  {
      quality: 100,
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
      color: 'rgba(255, 255, 255, 1)',
      font: this.$store.state.fonts.defaultFont,
      relativeFontSize: 5,
      backgroundSize: 0,
      backgroundColor: 'rgba(255, 255, 255, 0)',
      textShadowX: 0,
      textShadowY: 0,
      textShadowBlur: 0,
      textShadowColor: 'rgba(255, 255, 255, 0)',
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
      if (this.position == 'top' || this.position == 'bottom' || this.position == 'center') {
        return ((this.sampleWidth - this.watermarkWidth) / 2)
      } else {
        let ratio = 1 - this.watermarkWidth / this.sampleWidth
        return this.offsetX * this.sizeBaseX * (ratio)
      }
    },
    y() {
      if (this.position == 'left' || this.position == 'right' || this.position == 'center') {
        return ((this.sampleHeight - this.watermarkHeight) / 2)
      } else {
        let ratio = 1 - this.watermarkHeight / this.sampleHeight
        return this.offsetY * this.sizeBaseY * (ratio)
      }
    },
    textShadow() {
      return this.textShadowX * this.fontSize + 'px ' + this.textShadowY * this.fontSize + 'px ' + this.textShadowBlur * this.fontSize + 'px ' + this.textShadowColor
    }
  },
  watch: {
    text() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    writingMode() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    textAlign() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    lineHeight() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    letterSpacing() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    rotation() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    font() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    relativeFontSize() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    backgroundSize() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    backgroundColor() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    textShadowX() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    textShadowY() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    },
    textShadowBlur() {
      this.$nextTick(() => {
        this.initWatermarkSize()
      })
    }
  },
  methods: {
    minimize() {
      ipcRenderer.send('minimize')
    },
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
        this.$store.dispatch('watermark/fileListDelete', index).then(() => {
          if (this.imageIndex > index) {
            this.imageIndex -= 1
          } else if (this.imageIndex == index) {
            this.preview(this.imageIndex)
          }
        })
      } else {
        this.close()
      }
    },
    initWatermarkSize() {
      let watermarkStyle = window.getComputedStyle(document.getElementById('watermark'))
      let watermarkWidth = watermarkStyle.getPropertyValue('width').slice(0, -2)
      let watermarkHeight = watermarkStyle.getPropertyValue('height').slice(0, -2)
      this.watermarkWidth = watermarkWidth
      this.watermarkHeight = watermarkHeight
    },
    preview(index) {
      this.$dialog({
        title: '正在载入图像',
        text: '即将完成，请稍候。',
        showConfirm: false
      }).then((dialog) => {
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
            let sampleWidth = style.getPropertyValue('width').slice(0, -2)
            let sampleHeight = style.getPropertyValue('height').slice(0, -2)
            this.sampleWidth = sampleWidth
            this.sampleHeight = sampleHeight
            this.sizeBaseX = sampleWidth / 100
            this.sizeBaseY = sampleHeight / 100
            dialog.close()
            this.$nextTick(() => {
              this.initWatermarkSize()
            })
          })
        }
      })
    },
    changePosition() {
      this.offsetX = 0
      this.offsetY = 0
    },
    selectSaveFolder() {
      this.distDirectory = ipcRenderer.sendSync('select-folder')
    },
    applyTemplate(index) {
      let template = this.$store.state.watermark.templates[index]
      this.text = template.text !== undefined ? template.text : this.text
      this.writingMode = template.writingMode !== undefined ? template.writingMode : this.writingMode
      this.textAlign = template.textAlign !== undefined ? template.textAlign : this.textAlign
      this.lineHeight = template.lineHeight !== undefined ? template.lineHeight : this.lineHeight
      this.letterSpacing = template.letterSpacing !== undefined ? template.letterSpacing : this.letterSpacing
      this.position = template.position !== undefined ? template.position : this.position
      this.offsetX = template.offsetX !== undefined ? template.offsetX : this.offsetX
      this.offsetY = template.offsetY !== undefined ? template.offsetY : this.offsetY
      this.rotation = template.rotation !== undefined ? template.rotation : this.rotation
      this.color = template.color !== undefined ? template.color : this.color
      this.font = template.font !== undefined ? template.font : this.font
      this.relativeFontSize = template.relativeFontSize !== undefined ? template.relativeFontSize : this.relativeFontSize
      this.backgroundSize = template.backgroundSize !== undefined ? template.backgroundSize : this.backgroundSize
      this.backgroundColor = template.backgroundColor !== undefined ? template.backgroundColor : this.backgroundColor
      this.textShadowX = template.textShadowX !== undefined ? template.textShadowX : this.textShadowX
      this.textShadowY = template.textShadowY !== undefined ? template.textShadowY : this.textShadowY
      this.textShadowBlur = template.textShadowBlur !== undefined ? template.textShadowBlur : this.textShadowBlur
      this.textShadowColor = template.textShadowColor !== undefined ? template.textShadowColor : this.textShadowColor
      this.$dialog({
        type: 'success',
        title: '成功',
        text: '已成功应用模板。'
      }).then(() => {
        this.initWatermarkSize()
      })
    },
    deleteTemplate(index) {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '确定要删除这个模板吗？',
        showCancel: true,
        confirmFunction: () => {
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
          backgroundSize: this.backgroundSize,
          backgroundColor: this.backgroundColor,
          textShadowX: this.textShadowX,
          textShadowY: this.textShadowY,
          textShadowBlur: this.textShadowBlur,
          textShadowColor: this.textShadowColor,
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
      let handle = () => {
        this.$dialog({
          title: '正在处理',
          text: '即将完成，请稍候。',
          showConfirm: false
        }).then((dialog) => {
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
          let canvas = document.getElementById('sample')
          let scale = canvas.width / this.sampleWidth
          let watermark = document.getElementById('watermark')
          // 匹配模糊半径，等待 html2canvas 作者更新
          let shadow = watermark.style['text-shadow'].split(' ')
          shadow[shadow.length - 1] = shadow[shadow.length - 1].slice(0, -2) * scale + 'px'
          watermark.style['text-shadow'] = shadow.join(' ')
          // 完成匹配
          html2canvas(document.getElementById('watermark-container'), {
            canvas: canvas,
            scale: scale,
            backgroundColor: null
          }).then(canvas => {
            let url = canvas.toDataURL('image/' + mimeType, this.quality / 100).replace(/^data:image\/\w+;base64,/, "")
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
                      this.$store.dispatch('watermark/fileListDelete', this.imageIndex).then(() => {
                        this.preview(this.imageIndex)
                      })
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
        })
      }
      if (this.text.length == 0) {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字！'
        })
      } else if (this.customDistDirectory && this.distDirectory === '') {
        this.$dialog({
          type: 'warning',
          text: '请您选择保存的目录！'
        })
      } else if (!this.customDistDirectory && this.append === '') {
        this.$dialog({
          type: 'warning',
          title: '操作确认',
          text: '您选择将文件保存在原目录且未指定文件名后缀，这可能导致原图片被覆盖。您确定要开始处理吗？',
          showCancel: true,
          confirmFunction: () => {
            handle()
          }
        })
      } else {
        handle()
      }
    },
    startAll() {
      let handle = () => {
        this.$dialog({
          title: '正在处理',
          text: '即将完成，请稍候。',
          showConfirm: false
        }).then((dialog) => {
          let handleSingle = (file, index) => {
            return new Promise((resolve, reject) => {
              dialog.change({
                text: '正在处理第 ' + String(index + 1) + ' 张，共 ' + String(this.$store.state.watermark.fileList.length) + ' 张。'
              }).then(() => {
                let imageInfo = file
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
                image.src = file.fullpath
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
                    context.drawImage(image, x, y)
                    context.rotate(-rotation * Math.PI / 180)
                    canvas.style['max-width'] = '100%'
                    canvas.style['max-height'] = '100%'
                    canvas.style.display = 'block'
                    let sample = document.getElementById('sample')
                    sample.parentNode.replaceChild(canvas, sample)
                    canvas.id = 'sample'
                    let style = window.getComputedStyle(canvas)
                    let sampleWidth = style.getPropertyValue('width').slice(0, -2)
                    let sampleHeight = style.getPropertyValue('height').slice(0, -2)
                    this.sampleWidth = sampleWidth
                    this.sampleHeight = sampleHeight
                    this.sizeBaseX = sampleWidth / 100
                    this.sizeBaseY = sampleHeight / 100
                    let scale = width / sampleWidth
                    this.$nextTick(() => {
                      this.initWatermarkSize()
                      this.$nextTick(() => {
                        // 匹配模糊半径，等待 html2canvas 作者更新
                        let shadow = watermark.style['text-shadow'].split(' ')
                        shadow[shadow.length - 1] = shadow[shadow.length - 1].slice(0, -2) * scale + 'px'
                        watermark.style['text-shadow'] = shadow.join(' ')
                        // 完成匹配
                        html2canvas(document.getElementById('watermark-container'), {
                          canvas: canvas,
                          scale: scale,
                          backgroundColor: null,
                        }).then((canvas) => {
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
                      })
                    })
                  })
                }
              })
            })
          }
          let progress = Promise.resolve()
          this.$store.state.watermark.fileList.forEach((file, index) => {
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
                let notification = new Notification('图片加水印工具', {
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
                let notification = new Notification('图片加水印工具', {
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
      if (this.text.length == 0) {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字！'
        })
      } else if (this.customDistDirectory && this.distDirectory === '') {
        this.$dialog({
          type: 'warning',
          text: '请您选择保存的目录！'
        })
      } else if (!this.customDistDirectory && this.append === '') {
        this.$dialog({
          type: 'warning',
          title: '操作确认',
          text: '您选择将文件保存在原目录且未指定文件名后缀，这可能导致原图片被覆盖。您确定要开始处理吗？',
          showCancel: true,
          confirmFunction: () => {
            handle()
          }
        })
      } else {
        handle()
      }
    }
  },
  mounted() {
    this.preview(0)
  }
}
</script>

<style lang="scss">  
.el-color-dropdown {
  button {
    font-family: var(--main-font);
  }
}

.el-popper {
  -webkit-app-region: no-drag;
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
  
  .el-switch {
    display: flex;
    justify-content: flex-end;
  }
  
  .el-radio-group {
    display: flex;
    justify-content: flex-end;
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
  
  #left {
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
          box-sizing: border-box;
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
  
  #right {
    width: calc(50% - 10px);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .el-collapse-item__header {
      height: 30px;
      font-size: 14px;
    }
    
    .el-collapse-item__content {
      padding-top: 10px;
      padding-bottom: 10px;
    }
    
    .el-textarea__inner {
      font-family: var(--main-font);
      
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
