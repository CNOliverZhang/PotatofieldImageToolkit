<template>
  <div id="watermark-editor">
    <div class="page-header">
      <div class="page-title">图片加水印工具 - 编辑器</div>
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
                    </div>
                    <div
                      v-if="position == 'left-top' || position == 'left-bottom' || position == 'left' || position == 'right-top' || position == 'right-bottom' || position == 'right'"
                      class="control-row">
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
                    </div>
                    <div
                      v-if="position == 'left-top' || position == 'left-bottom' || position == 'top' || position == 'right-top' || position == 'right-bottom' || position == 'bottom'"
                      class="control-row">
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
                    </div>
                    <div
                      v-if="imagePosition == 'left-top' || imagePosition == 'left-bottom' || imagePosition == 'left' || imagePosition == 'right-top' || imagePosition == 'right-bottom' || imagePosition == 'right'"
                      class="control-row">
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
                    </div>
                    <div
                      v-if="imagePosition == 'left-top' || imagePosition == 'left-bottom' || imagePosition == 'top' || imagePosition == 'right-top' || imagePosition == 'right-bottom' || imagePosition == 'bottom'"
                      class="control-row">
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
                    :min="1"
                    :max="100"
                    :step="1"
                    :show-input="true"
                    input-size="mini"
                    class="full-width-control"></el-slider>
                </div>
                <div class="control-row">
                  <div class="text">存储位置</div>
                </div>
                <div class="control-row">
                  <el-switch
                    v-model="customDistDirectory"
                    active-color="var(--main-color)"
                    inactive-color="var(--main-color)"
                    active-text="自定义路径"
                    inactive-text="保存在原路径"
                    class="full-width-control"></el-switch>
                </div>
                <div v-if="customDistDirectory" class="control-row">
                  <div class="text">自定义存储位置</div>
                </div>
                <div v-if="customDistDirectory" class="control-row">
                  <el-input disabled size="mini" v-model="distDirectory" v-if="customDistDirectory" class="full-width-control">
                    <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
                  </el-input>
                </div>
                <div v-if="srcDirectory != '' && customDistDirectory" class="control-row">
                  <div class="text">目录结构</div>
                </div>
                <div v-if="srcDirectory != '' && customDistDirectory" class="control-row">
                  <el-switch
                    v-model="keepDirectoryStructure"
                    active-text="保持目录结构"
                    inactive-text="不保持目录结构"
                    class="full-width-control"></el-switch>
                </div>
                <div class="control-row">
                  <div class="text">保存的图片格式</div>
                </div>
                <div class="control-row">
                  <el-radio-group v-model="mimeType" size="mini" class="full-width-control">
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
                  <el-input size="mini" v-model="append" maxlength="30" class="full-width-control"></el-input>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane>
            <span slot="label">文件列表</span>
            <div id="file-list">
              <div id="list">
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
              <div v-if="this.$store.state.watermark.fileList.length > 100" class="row">
                <el-pagination
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
          </el-tab-pane>
          <el-tab-pane>
            <span slot="label">模板列表</span>
            <div id="template-list">
              <div v-if="this.$store.state.watermark.templates.length != 0" id="list">
                <div
                  v-for="(template, index) in this.$store.state.watermark.templates"
                  :key="template.title"
                  class="template">
                  <div class="cover">
                    <div class="action" @click="applyTemplate(index)">
                      <span class="fa fa-check-circle"></span>
                      <div>应用</div>
                    </div>
                    <div class="action" @click="deleteTemplate(index)">
                      <span class="fa fa-trash-alt"></span>
                      <div>删除</div>
                    </div>
                  </div>
                  <div class="text">{{ template.title }}</div>
                  <div class="subtext clamp">内容：{{ template.text != '' ? template.text : '[图片]' }}</div>
                </div>
              </div>
              <div v-else id="empty-container">
                <div id="empty">
                  <i class="fas fa-folder-open"></i>
                  <div>尚无已保存的模板</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        <div id="actions">
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
      quality: 90,
      customDistDirectory: false,
      distDirectory: '',
      srcDirectory: this.$route.query.srcDirectory,
      keepDirectoryStructure: false,
      mimeType: '保持原格式',
      append: '_watermarked',
      fileListPage: 1,
      fileIndex: -1,
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
    }
  },
  methods: {
    minimize() {
      ipcRenderer.send('minimize')
    },
    maximize() {
      ipcRenderer.send('change-maximize-status')
    },
    back() {
      this.$store.dispatch('watermark/fileListEmpty').then(() => {
        this.$router.replace('/watermark')
      })
    },
    close() {
      this.$store.dispatch('watermark/fileListEmpty').then(() => {
        ipcRenderer.send('close')
        this.$destroy()
      })
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
          if (this.fileIndex > index) {
            this.fileIndex -= 1
          } else if (this.fileIndex == index) {
            this.preview(this.fileIndex)
          }
        })
      } else {
        this.back()
      }
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
    preview(index) {
      this.$dialog({
        title: '正在载入图像',
        text: '即将完成，请稍候。',
        showConfirm: false
      }).then((dialog) => {
        if (index >= this.$store.state.watermark.fileList.length) {
          this.fileIndex = this.$store.state.watermark.fileList.length - 1
        } else {
          this.fileIndex = index
        }
        let image = document.createElement('img')
        image.src = this.$store.state.watermark.fileList[this.fileIndex].fullpath
        image.onerror = () => {
          if (this.$store.state.watermark.fileList.length == 1) {
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
              if (this.text != '') {
                this.initWatermarkSize()
              }
              if (this.image != '') {
                this.initImageSize()
              }
            })
          })
        }
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
      this.image = template.image !== undefined ? template.image : this.image
      this.imageSize = template.imageSize !== undefined ? template.imageSize : this.imageSize
      this.imagePosition = template.imagePosition !== undefined ? template.imagePosition : this.imagePosition
      this.imageOffsetX = template.imageOffsetX !== undefined ? template.imageOffsetX : this.imageOffsetX
      this.imageOffsetY = template.imageOffsetY !== undefined ? template.imageOffsetY : this.imageOffsetY
      this.imageRotation = template.imageRotation !== undefined ? template.imageRotation : this.imageRotation
      this.imageOpacity = template.imageOpacity !== undefined ? template.imageOpacity : this.imageOpacity
      this.$dialog({
        type: 'success',
        title: '成功',
        text: '已成功应用模板。'
      }).then(() => {
        if (this.text != '') {
          this.initWatermarkSize()
        }
      })
    },
    deleteTemplate(index) {
      let template = this.$store.state.watermark.templates[index]
      if (this.image == template.image && this.image != '') {
        this.$dialog({
          type: 'error',
          title: '删除失败',
          text: '您不能删除正在使用的模板！'
        })
      } else {
        this.$dialog({
          type: 'warning',
          title: '操作确认',
          text: '确定要删除这个模板吗？',
          showCancel: true,
          confirmFunction: () => {
            if (template.image) {
              try {
                fs.unlinkSync(template.image)
              } catch (error) {}
            }
            this.$store.dispatch('watermark/templateDelete', index)
          }
        })
      }
    },
    saveAsTemplate() {
      if (this.text.length == 0 && this.image == '') {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文本！'
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
              this.image = fullpath
            }
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
          let imageInfo = this.$store.state.watermark.fileList[this.fileIndex]
          let distExt
          if (this.mimeType == '保持原格式') {
            distExt = imageInfo.ext
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
          // 将图片水印转 canvas
          if (this.image) {
            let image = document.getElementById('watermark-image')
            let width = image.naturalWidth
            let height = image.naturalHeight
            let canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            let context = canvas.getContext('2d')
            context.globalAlpha = this.imageOpacity
            context.drawImage(image, 0, 0, width, height)
            let bin = canvas.toDataURL('image/png')
            image.src = bin
            image.style['opacity'] = 1
          }
          html2canvas(document.getElementById('watermark-container'), {
            canvas: canvas,
            scale: scale,
            backgroundColor: null,
            useCORS: true
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
                      this.$store.dispatch('watermark/fileListDelete', this.fileIndex).then(() => {
                        this.preview(this.fileIndex)
                      })
                    }
                  })
                } else {
                  dialog.change({
                    type: 'success',
                    title: '成功',
                    text: '处理完成，添加水印后的图片已保存到目标文件夹。',
                    showConfirm: true,
                    confirmFunction: () => {
                      this.back()
                    }
                  })
                }
              }
            })
          })
        })
      }
      if (this.text.length == 0 && this.image == '') {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字或选择水印图片！'
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
          // 将图片水印转 canvas
          if (this.image) {
            let image = document.getElementById('watermark-image')
            let width = image.naturalWidth
            let height = image.naturalHeight
            let canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            let context = canvas.getContext('2d')
            context.globalAlpha = this.imageOpacity
            context.drawImage(image, 0, 0, width, height)
            let bin = canvas.toDataURL('image/png')
            image.src = bin
            image.style['opacity'] = 1
          }
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
                      if (this.text != '') {
                        this.initWatermarkSize()
                      }
                      if (this.image != '') {
                        this.initImageSize()
                      }
                      this.$nextTick(() => {
                        // 匹配模糊半径，等待 html2canvas 作者更新
                        let shadow = watermark.style['text-shadow'].split(' ')
                        shadow[shadow.length - 1] = shadow[shadow.length - 1].slice(0, -2) * scale + 'px'
                        watermark.style['text-shadow'] = shadow.join(' ')
                        html2canvas(document.getElementById('watermark-container'), {
                          canvas: canvas,
                          scale: scale,
                          backgroundColor: null,
                          useCORS: true
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
                text: '全部图片处理完成。',
                showConfirm: true,
                confirmFunction: () => {
                  this.back()
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
                  this.back()
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
      if (this.text.length == 0 && this.image == '') {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字或选择水印图片！'
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
#watermark-editor {
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
        box-sizing: border-box;
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

        #save {
          margin-top: 10px;
        }

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
        
        .el-pagination {
          flex-grow: 1;
          text-align: center;
          padding: 0;
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

      #template-list {
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

            .clamp {
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
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
