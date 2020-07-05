<template>
  <div id="watermark-template">
    <div class="page-header">
      <div class="page-title">图片加水印工具 - 模板编辑器</div>
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
        <div id="sample-wrapper">
          <div id="sample-container">
            <div
              id="sample"
              :style="{
                'background-image': background,
                'width': sampleWidth + 'px',
                'height': sampleHeight + 'px'
              }"></div>
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
              <img
                v-if="image != ''"
                id="watermark-image"
                @load="initImageSize"
                :src="image"
                :style="{
                  'width': imageSize * sizeBaseX + 'px',
                  'left': (imagePosition == 'left-top' || imagePosition == 'left-bottom' || imagePosition == 'left' || imagePosition == 'center' || imagePosition == 'top' || imagePosition == 'bottom') ? imageX + 'px' : null,
                  'right': (imagePosition == 'right-top' || imagePosition == 'right-bottom' || imagePosition == 'right') ? imageX + 'px' : null,
                  'top': (imagePosition == 'left-top' || imagePosition == 'right-top' || imagePosition == 'top' || imagePosition == 'center' || imagePosition == 'left' || imagePosition == 'right') ? imageY + 'px' : null,
                  'bottom': (imagePosition == 'left-bottom' || imagePosition == 'right-bottom' || imagePosition == 'bottom') ? imageY + 'px' : null,
                  'opacity': imageOpacity,
                  'transform': 'rotate(' + imageRotation + 'deg)'
                }"/>
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
                  <div class="subtitle">图像参照设置</div>
                </div>
                <div class="control-row">
                  <div class="text">参照长宽比</div>
                </div>
                <div class="control-row">
                  <el-slider
                    id="reference"
                    v-model="ratio"
                    :min="0.5"
                    :max="2"
                    :step="0.01"
                    input-size="mini"></el-slider>
                </div>
                <div class="control-row">
                  <div class="text">参照背景颜色</div>
                </div>
                <div class="control-row">
                  <el-select v-model="background" placeholder="请选择" size="mini" class="full-width-control">
                    <el-option label="深色" value="linear-gradient(135deg, var(--dark-gray), var(--black-gray))"/>
                    <el-option label="浅色" value="linear-gradient(135deg, var(--gray), var(--white-gray))"/>
                  </el-select>
                </div>
                <div class="row">
                  <div class="subtitle">水印设置</div>
                </div>
                <el-collapse value="content" accordion>
                  <el-collapse-item title="水印文本内容" name="content">
                    <el-input
                      :rows="5"
                      v-model="text"
                      type="textarea"
                      resize="none"
                      placeholder="请输入水印文本内容"></el-input>
                  </el-collapse-item>
                  <el-collapse-item title="水印文本样式" name="style">
                    <div class="control-row">
                      <div class="text">文本字体</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="font" placeholder="请选择" size="mini" class="full-width-control">
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
                      <div class="text">文本字体大小</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="relativeFontSize"
                        class="full-width-control"
                        :min="1"
                        :max="100"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">文本字体颜色</div>
                      <el-color-picker v-model="color" size="mini" :show-alpha="true"></el-color-picker>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="水印文本背景" name="background">
                    <div class="control-row">
                      <div class="text">文本背景尺寸</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="backgroundSize"
                        class="full-width-control"
                        :min="0"
                        :max="300"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">文本背景颜色</div>
                      <el-color-picker v-model="backgroundColor" size="mini" :show-alpha="true"></el-color-picker>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="水印文本阴影" name="shadow">
                    <div class="control-row">
                      <div class="text">文本阴影水平位置</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="textShadowX"
                        class="full-width-control"
                        :min="-1"
                        :max="1"
                        :step="0.01"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">文本阴影垂直位置</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="textShadowY"
                        class="full-width-control"
                        :min="-1"
                        :max="1"
                        :step="0.01"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">文本阴影模糊</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="textShadowBlur"
                        class="full-width-control"
                        :min="0"
                        :max="1"
                        :step="0.01"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">文本阴影颜色</div>
                      <el-color-picker v-model="textShadowColor" size="mini" :show-alpha="true"></el-color-picker>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="水印文本位置" name="position">
                    <div class="control-row">
                      <div class="text">文本位置基准</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="position" @change="changePosition" placeholder="请选择" size="mini" class="full-width-control">
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
                      <div v-if="position == 'left-top' || position == 'left-bottom' || position == 'left'" class="text">文本与左边缘的距离</div>
                      <div v-if="position == 'right-top' || position == 'right-bottom' || position == 'right'" class="text">文本与右边缘的距离</div>
                      <el-slider
                        v-model="offsetX"
                        class="full-width-control"
                        :min="0"
                        :max="100"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div
                      v-if="position == 'left-top' || position == 'left-bottom' || position == 'top' || position == 'right-top' || position == 'right-bottom' || position == 'bottom'"
                      class="control-row">
                      <div v-if="position == 'left-top' || position == 'right-top' || position == 'top'" class="text">文本与上边缘的距离</div>
                      <div v-if="position == 'left-bottom' || position == 'right-bottom' || position == 'bottom'" class="text">文本与下边缘的距离</div>
                      <el-slider
                        v-model="offsetY"
                        class="full-width-control"
                        :min="0"
                        :max="100"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">文本旋转角度</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="rotation"
                        class="full-width-control"
                        :min="-180"
                        :max="180"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="水印文本排版" name="typesetting">
                    <div class="control-row">
                      <div class="text">文本排版方向</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="writingMode" placeholder="请选择" size="mini" class="full-width-control">
                        <el-option label="水平" value="horizontal-tb"/>
                        <el-option label="垂直从右至左" value="vertical-rl"/>
                        <el-option label="垂直从左至右" value="vertical-lr"/>
                      </el-select>
                    </div>
                    <div class="control-row">
                      <div class="text">多行文本对齐方式</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="textAlign" placeholder="请选择" size="mini" class="full-width-control">
                        <el-option label="居中对齐" value="center"/>
                        <el-option label="行首对齐" value="left"/>
                        <el-option label="行尾对其" value="right"/>
                      </el-select>
                    </div>
                    <div class="control-row">
                      <div class="text">多行文本行距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="lineHeight"
                        class="full-width-control"
                        :min="1"
                        :max="10"
                        :step="0.1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">文本字间距</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="letterSpacing"
                        class="full-width-control"
                        :min="0"
                        :max="100"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="水印图片选择" name="image">
                    <div id="image-container">
                      <div id="upload-container" :class="image != '' ? 'half' : ''">
                        <el-upload
                          id="upload-dragger"
                          action=""
                          drag
                          :auto-upload="false"
                          :on-change="selectImage"
                          :show-file-list="false">
                          <div v-if="image == ''" key="hasImage">
                            <i class="fas fa-stamp"></i>
                            <div class="el-upload__text">拖拽或点击选择图片</div>
                          </div>
                          <div v-else key="noImage">
                            <div class="el-upload__text">拖拽或点击</div>
                            <div class="el-upload__text">选择图片</div>
                          </div>
                        </el-upload>
                        <div v-if="image != ''" class="row">
                          <el-button type="primary" size="mini" @click="clearImage" class="bar-button">清除图片</el-button>
                        </div>
                      </div>
                      <div v-if="image != ''" id="image-preview-container">
                        <img :src="image" id="image-preview">
                      </div>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="水印图片样式" name="image-style">
                    <div class="control-row">
                      <div class="text">图片尺寸</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="imageSize"
                        class="full-width-control"
                        :min="1"
                        :max="100"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">图片不透明度</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="imageOpacity"
                        class="full-width-control"
                        :min="0"
                        :max="1"
                        :step="0.01"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="水印图片位置" name="image-position">
                    <div class="control-row">
                      <div class="text">图片位置基准</div>
                    </div>
                    <div class="control-row">
                      <el-select v-model="imagePosition" @change="changeImagePosition" placeholder="请选择" size="mini" class="full-width-control">
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
                      v-if="imagePosition == 'left-top' || imagePosition == 'left-bottom' || imagePosition == 'left' || imagePosition == 'right-top' || imagePosition == 'right-bottom' || imagePosition == 'right'"
                      class="control-row">
                      <div v-if="imagePosition == 'left-top' || imagePosition == 'left-bottom' || imagePosition == 'left'" class="text">图片与左边缘的距离</div>
                      <div v-if="imagePosition == 'right-top' || imagePosition == 'right-bottom' || imagePosition == 'right'" class="text">图片与右边缘的距离</div>
                      <el-slider
                        v-model="imageOffsetX"
                        class="full-width-control"
                        :min="0"
                        :max="100"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div
                      v-if="imagePosition == 'left-top' || imagePosition == 'left-bottom' || imagePosition == 'top' || imagePosition == 'right-top' || imagePosition == 'right-bottom' || imagePosition == 'bottom'"
                      class="control-row">
                      <div v-if="imagePosition == 'left-top' || imagePosition == 'right-top' || imagePosition == 'top'" class="text">图片与上边缘的距离</div>
                      <div v-if="imagePosition == 'left-bottom' || imagePosition == 'right-bottom' || imagePosition == 'bottom'" class="text">图片与下边缘的距离</div>
                      <el-slider
                        v-model="imageOffsetY"
                        class="full-width-control"
                        :min="0"
                        :max="100"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                    <div class="control-row">
                      <div class="text">图片旋转角度</div>
                    </div>
                    <div class="control-row">
                      <el-slider
                        v-model="imageRotation"
                        class="full-width-control"
                        :min="-180"
                        :max="180"
                        :step="1"
                        :show-input="true"
                        input-size="mini"></el-slider>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
              <div id="name">
                <div class="row">
                  <div class="subtitle">模板名称设置</div>
                </div>
                <div class="row">
                  <el-input v-model="templateTitle" placeholder="请输入模板标题" size="mini"></el-input>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        <div id="actions">
          <el-button v-if="index != -1" type="primary" size="mini" @click="save" class="bar-button">保存</el-button>
          <el-button type="primary" size="mini" @click="saveAsNew" class="bar-button">{{ index == -1 ? '保存' : '另存'}}</el-button>
          <el-button v-if="index != -1" type="primary" size="mini" @click="deleteTemplate" class="bar-button">删除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import ReadDirectory from '../../utils/ReadDirectory'
import CreateDirectory from '../../utils/CreateDirectory'

const path = require('path')
const fs = require('fs')

export default {
  name: 'watermarkTemplate',
  data () {
    return  {
      index: this.$route.query.index,
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
      image: '',
      originalImage: '',
      imageSize: 30,
      imagePosition: 'center',
      imageOffsetX: 0,
      imageOffsetY: 0,
      imageRotation: 0,
      imageOpacity: 1,
      sizeBaseX: 0,
      sizeBaseY: 0,
      sampleWidth: 0,
      sampleHeight: 0,
      watermarkWidth: 0,
      watermarkHeight: 0,
      imageWidth: 0,
      imageHeight: 0,
      ratio: 1,
      background: 'linear-gradient(135deg, var(--dark-gray), var(--black-gray))',
      templateTitle: ''
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
    imageX() {
      if (this.imagePosition == 'top' || this.imagePosition == 'bottom' || this.imagePosition == 'center') {
        return ((this.sampleWidth - this.imageWidth) / 2)
      } else {
        let ratio = 1 - this.imageWidth / this.sampleWidth
        return this.imageOffsetX * this.sizeBaseX * (ratio)
      }
    },
    imageY() {
      if (this.imagePosition == 'left' || this.imagePosition == 'right' || this.imagePosition == 'center') {
        return ((this.sampleHeight - this.imageHeight) / 2)
      } else {
        let ratio = 1 - this.imageHeight / this.sampleHeight
        return this.imageOffsetY * this.sizeBaseY * (ratio)
      }
    },
    textShadow() {
      return this.textShadowX + 'em ' + this.textShadowY + 'em ' + this.textShadowBlur + 'em ' + this.textShadowColor
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
    imageSize() {
      this.$nextTick(() => {
        this.initImageSize()
      })
    },
    ratio(value) {
      let sampleContainer = document.getElementById('sample-container')
      let style = window.getComputedStyle(sampleContainer)
      let width = style.getPropertyValue('width').slice(0, -2)
      let height = style.getPropertyValue('height').slice(0, -2)
      if ((width / height) > value) {
        this.sampleWidth = height * value
        this.sampleHeight = height
      } else {
        this.sampleWidth = width
        this.sampleHeight = width / value
      }
      this.sizeBaseX = this.sampleWidth / 100
      this.sizeBaseY = this.sampleHeight / 100
      this.$nextTick(() => {
        if (this.text != '') {
          this.initWatermarkSize()
        }
        if (this.image != '') {
          this.initImageSize()
        }
      })
    }
  },
  methods: {
    minimize() {
      ipcRenderer.send('minimize')
    },
    maximize() {
      ipcRenderer.send('change-maximize-status')
      this.initSampleSize()
    },
    back() {
      this.$router.replace('/watermark')
    },
    close() {
      ipcRenderer.send('close')
      this.$destroy()
    },
    initWatermarkSize() {
      let watermarkStyle = window.getComputedStyle(document.getElementById('watermark'))
      let watermarkWidth = watermarkStyle.getPropertyValue('width').slice(0, -2)
      let watermarkHeight = watermarkStyle.getPropertyValue('height').slice(0, -2)
      this.watermarkWidth = watermarkWidth
      this.watermarkHeight = watermarkHeight
    },
    initImageSize() {
      let imageStyle = window.getComputedStyle(document.getElementById('watermark-image'))
      let imageWidth = imageStyle.getPropertyValue('width').slice(0, -2)
      let imageHeight = imageStyle.getPropertyValue('height').slice(0, -2)
      this.imageWidth = imageWidth
      this.imageHeight = imageHeight
    },
    initSampleSize() {
      this.$nextTick(() => {
        setTimeout(() => {
          let sampleContainer = document.getElementById('sample-container')
          let style = window.getComputedStyle(sampleContainer)
          let width = style.getPropertyValue('width').slice(0, -2)
          let height = style.getPropertyValue('height').slice(0, -2)
          let shortEdge = Math.min(width, height)
          this.sampleWidth = shortEdge
          this.sampleHeight = shortEdge
          this.sizeBaseX = shortEdge / 100
          this.sizeBaseY = shortEdge / 100
          this.$nextTick(() => {
            if (this.text != '') {
              this.initWatermarkSize()
            }
            if (this.image) {
              this.initImageSize()
            }
          })
        }, 200)
      })
    },
    changePosition() {
      this.offsetX = 0
      this.offsetY = 0
    },
    changeImagePosition() {
      this.imageOffsetX = 0
      this.imageOffsetY = 0
    },
    selectImage(file) {
      let formats = new Set(['jpg', 'jpeg', 'webp', 'png'])
      let ext = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length).toLowerCase()
      if (file.size > 1024 * 1024 * 10) {
        this.$dialog({
          type: 'error',
          title: '图片文件过大',
          text: '您选择的图片过大，无法作为水印添加。请选择文件大小在 10MB 以下的图片。'
        })
      } else if (!formats.has(ext)) {
        this.$dialog({
          type: 'error',
          title: '不支持该文件格式',
          text: '您选择的文件格式不受支持，无法作为水印添加。请选择常见格式的图片文件。'
        })
      } else {
        this.image = file.raw.path
      }
    },
    clearImage() {
      this.image = ''
    },
    save() {
      if (this.text.length == 0 && this.image == '') {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字或选择水印图片！'
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
          image: this.image,
          imageSize: this.imageSize,
          imagePosition: this.imagePosition,
          imageOffsetX: this.imageOffsetX,
          imageOffsetY: this.imageOffsetY,
          imageRotation: this.imageRotation,
          imageOpacity: this.imageOpacity
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
              if (title == this.$store.state.watermark.templates[i].title && this.index != i) {
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
            if (this.originalImage != this.image) {
              if (this.originalImage != '') {
                try {
                  fs.unlinkSync(this.originalImage)
                } catch (error) {}
                this.originalImage = ''
              }
              if (this.image != '') {
                let ext = this.image.substring(this.image.lastIndexOf(".") + 1, this.image.length).toLowerCase()
                let filename = Math.random((new Date())).toString(36).slice(2).toUpperCase() + '.' + ext
                let imagepath = path.join(ipcRenderer.sendSync('app-data-path'), 'watermarkImages')
                let fullpath = path.join(imagepath, filename)
                if (!fs.existsSync(imagepath)) {
                  CreateDirectory(imagepath)
                }
                fs.writeFileSync(fullpath, fs.readFileSync(this.image))
                template.image = fullpath
                this.originalImage = fullpath
                this.image = fullpath
              }
            }
            this.$store.dispatch('watermark/templateReplace', {
              index: this.index,
              template: template
            })
            this.$dialog({
              type: 'success',
              title: '成功',
              text: '保存成功。是否返回？',
              showCancel: true,
              confirmFunction: () => {
                this.back()
              }
            })
          }
        }
        checkName(this.templateTitle)
      }
    },
    saveAsNew() {
      if (this.text.length == 0 && this.image == '') {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字或选择水印图片！'
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
          image: this.image,
          imageSize: this.imageSize,
          imagePosition: this.imagePosition,
          imageOffsetX: this.imageOffsetX,
          imageOffsetY: this.imageOffsetY,
          imageRotation: this.imageRotation,
          imageOpacity: this.imageOpacity
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
                        'font-family': 'var(--main-cont)'
                      }
                    })
                  ]),
                  showCancel: true,
                  confirmFunction: () => {
                    checkName(this.templateTitle)
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
                      }
                    })
                  }
                })
                return
              }
            }
            template.title = title
            if (this.image != '') {
              let ext = this.image.substring(this.image.lastIndexOf(".") + 1, this.image.length).toLowerCase()
              let filename = Math.random((new Date())).toString(36).slice(2).toUpperCase() + '.' + ext
              let imagepath = path.join(ipcRenderer.sendSync('app-data-path'), 'watermarkImages')
              let fullpath = path.join(imagepath, filename)
              if (!fs.existsSync(imagepath)) {
                CreateDirectory(imagepath)
              }
              fs.writeFileSync(fullpath, fs.readFileSync(this.image))
              template.image = fullpath
              this.originalImage = fullpath
              this.image = fullpath
            }
            this.$store.dispatch('watermark/templatePush', template)
            this.$dialog({
              type: 'success',
              title: '成功',
              text: '保存成功。是否返回？',
              showCancel: true,
              confirmFunction: () => {
                this.back()
              },
              cancelFunction: () => {
                this.index = this.$store.state.watermark.templates.length - 1
              }
            })
          }
        }
        checkName(this.templateTitle)
      }
    },
    deleteTemplate() {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '确定要删除这个模板吗？',
        showCancel: true,
        confirmFunction: () => {
          if (this.originalImage) {
            try {
              fs.unlinkSync(this.originalImage)
            } catch (error) {}
          }
          this.$store.dispatch('watermark/templateDelete', this.index)
          this.back()
        }
      })
    }
  },
  mounted() {
    if (this.$route.query.index != -1) {
      let template = this.$store.state.watermark.templates[this.$route.query.index]
      this.templateTitle = template.title !== undefined ? template.title : this.templateTitle
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
      this.image = template.image !== undefined ? template.image : this.image
      this.originalImage = this.image
      this.imageSize = template.imageSize !== undefined ? template.imageSize : this.imageSize
      this.imagePosition = template.imagePosition !== undefined ? template.imagePosition : this.imagePosition
      this.imageOffsetX = template.imageOffsetX !== undefined ? template.imageOffsetX : this.imageOffsetX
      this.imageOffsetY = template.imageOffsetY !== undefined ? template.imageOffsetY : this.imageOffsetY
      this.imageRotation = template.imageRotation !== undefined ? template.imageRotation : this.imageRotation
      this.imageOpacity = template.imageOpacity !== undefined ? template.imageOpacity : this.imageOpacity
      this.$dialog({
        text: '您正在编辑一个已保存的模板。如果您希望修改后覆盖原模板请点击“保存”，如果您希望将修改后的模板存储为副本请点击“另存”。'
      })
    }
    this.initSampleSize()
  }
}
</script>

<style lang="scss">
#watermark-template {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  #content {
    height: 0;
    flex-grow: 1;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  #left {
    flex-grow: 1;
    height: 100%;
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

    #sample-wrapper {
      width: 100%;
      height: 0;
      flex-grow: 1;
      padding-left: 20px;
      padding-top: 20px;
      padding-bottom: 20px;
      box-sizing: border-box;
    
      #sample-container {
        width: 100%;
        height: 100%;
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
          box-shadow: 0 0 10px var(--black);
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

          #watermark-image {
            position: absolute;
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

        #reference {
          width: 100%;

          .el-slider__runway {
            margin-left: 8px;
            margin-right: 8px;
            width: unset;

            .el-slider__button {
              width: 8px;
              height: 8px;
            }
          }
        }

        #name {
          margin-top: 10px;
        }

        #image-container {
          display: flex;
          justify-content: space-between;
          width: 100%;
          height: 120px;

          #upload-container {
            width: 100%;
            height: 100%;
            transition: 0.5s;
            display: flex;
            flex-direction: column;
            
            &.half {
              width: calc(50% - 5px);
            }

            #upload-dragger {
              width: 100%;
              height: 0;
              flex-grow: 1;
              
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
                  color: var(--dark-gray);
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

          #image-preview-container {
            width: calc(50% - 5px);
            height: 100%;
            background-color: var(--black-gray);
            border-radius: 6px;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;

            #image-preview {
              max-width: 100%;
              max-height: 100%;
            }
          }
        }

        .el-collapse-item__header {
          height: 30px;
          font-size: 14px;
        }
        
        .el-collapse-item__content {
          padding-top: 10px;
          padding-bottom: 10px;

          .el-slider__runway {
            margin-left: 8px;

            .el-slider__button {
              width: 8px;
              height: 8px;
            }
          }
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

        &::-webkit-scrollbar {
          display: none;
        }
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
