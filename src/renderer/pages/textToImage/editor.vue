<template>
  <div id="text-to-image-editor">
    <div id="left">
      <div
        id="preview-container"
        class="interactable"
        :style="{
          'background-color': backgroundColor
        }">
        <div
          id="preview"
          v-html="content"
          :style="{
            'padding': padding + 'px',
            'background-color': backgroundColor
          }">
        </div>
      </div>
    </div>
    <div id="right" class="interactable">
      <div id="control">
        <div id="settings">
          <div class="row">
            <div class="subtitle">样式设置</div>
          </div>
          <el-collapse value="basic" accordion>
            <el-collapse-item title="基本样式" name="basic">
              <div class="control-row">
                <div class="text">外边距</div>
                <el-slider
                  v-model="padding"
                  class="control"
                  :min="0"
                  :max="30"
                  :step="1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">背景颜色</div>
                <el-color-picker v-model="backgroundColor" size="mini"></el-color-picker>
              </div>
            </el-collapse-item>
            <el-collapse-item title="标题样式" name="title">
              <div class="control-row">
                <div class="text">字体</div>
                <el-select v-model="titleFont" placeholder="请选择" size="mini" class="control">
                  <el-option
                    v-for="(font, index) in this.$store.state.fonts.fontList"
                    :key="index"
                    :label="font.verbose + '（' + font.weight + '）'"
                    :value="font.fontFamily"
                    :style="{
                      'font-family': font.fontFamily
                    }"/>
                </el-select>
              </div>
              <div class="control-row">
                <div class="text">字体大小</div>
                <el-slider
                  v-model="titleFontSize"
                  class="control"
                  :min="15"
                  :max="100"
                  :step="1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">字间距</div>
                <el-slider
                  v-model="titleLetterSpacing"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">行距</div>
                <el-slider
                  v-model="titleLineHeight"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">段间距</div>
                <el-slider
                  v-model="titleMargin"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">对齐方式</div>
                <el-select v-model="titleTextAlign" placeholder="请选择" size="mini" class="control">
                  <el-option label="左对齐" value="justify"/>
                  <el-option label="居中对齐" value="center"/>
                  <el-option label="右对齐" value="right"/>
                </el-select>
              </div>
              <div class="control-row">
                <div class="text">缩进设置</div>
                <el-switch
                  v-model="titleIndent"
                  active-text="缩进"
                  inactive-text="不缩进"
                  class="control"></el-switch>
              </div>
              <div class="control-row">
                <div class="text">字体颜色</div>
                <el-color-picker v-model="titleColor" size="mini" :show-alpha="true"></el-color-picker>
              </div>
            </el-collapse-item>
            <el-collapse-item title="二级标题样式" name="subtitle">
              <div class="control-row">
                <div class="text">字体</div>
                <el-select v-model="subtitleFont" placeholder="请选择" size="mini" class="control">
                  <el-option
                    v-for="(font, index) in this.$store.state.fonts.fontList"
                    :key="index"
                    :label="font.verbose + '（' + font.weight + '）'"
                    :value="font.fontFamily"
                    :style="{
                      'font-family': font.fontFamily
                    }"/>
                </el-select>
              </div>
              <div class="control-row">
                <div class="text">字体大小</div>
                <el-slider
                  v-model="subtitleFontSize"
                  class="control"
                  :min="10"
                  :max="80"
                  :step="1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">字间距</div>
                <el-slider
                  v-model="subtitleLetterSpacing"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">行距</div>
                <el-slider
                  v-model="subtitleLineHeight"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">段间距</div>
                <el-slider
                  v-model="subtitleMargin"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">对齐方式</div>
                <el-select v-model="subtitleTextAlign" placeholder="请选择" size="mini" class="control">
                  <el-option label="左对齐" value="justify"/>
                  <el-option label="居中对齐" value="center"/>
                  <el-option label="右对齐" value="right"/>
                </el-select>
              </div>
              <div class="control-row">
                <div class="text">缩进设置</div>
                <el-switch
                  v-model="subtitleIndent"
                  active-text="缩进"
                  inactive-text="不缩进"
                  class="control"></el-switch>
              </div>
              <div class="control-row">
                <div class="text">字体颜色</div>
                <el-color-picker v-model="subtitleColor" size="mini" :show-alpha="true"></el-color-picker>
              </div>
            </el-collapse-item>
            <el-collapse-item title="文本样式" name="text">
              <div class="control-row">
                <div class="text">字体</div>
                <el-select v-model="textFont" placeholder="请选择" size="mini" class="control">
                  <el-option
                    v-for="(font, index) in this.$store.state.fonts.fontList"
                    :key="index"
                    :label="font.verbose + '（' + font.weight + '）'"
                    :value="font.fontFamily"
                    :style="{
                      'font-family': font.fontFamily
                    }"/>
                </el-select>
              </div>
              <div class="control-row">
                <div class="text">字体大小</div>
                <el-slider
                  v-model="textFontSize"
                  class="control"
                  :min="5"
                  :max="60"
                  :step="1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">字间距</div>
                <el-slider
                  v-model="textLetterSpacing"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">行距</div>
                <el-slider
                  v-model="textLineHeight"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">段间距</div>
                <el-slider
                  v-model="textMargin"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">对齐方式</div>
                <el-select v-model="textAlign" placeholder="请选择" size="mini" class="control">
                  <el-option label="左对齐" value="justify"/>
                  <el-option label="居中对齐" value="center"/>
                  <el-option label="右对齐" value="right"/>
                </el-select>
              </div>
              <div class="control-row">
                <div class="text">段首缩进设置</div>
                <el-switch
                  v-model="textIndent"
                  active-text="缩进"
                  inactive-text="不缩进"
                  class="control"></el-switch>
              </div>
              <div class="control-row">
                <div class="text">字体颜色</div>
                <el-color-picker v-model="textColor" size="mini" :show-alpha="true"></el-color-picker>
              </div>
            </el-collapse-item>
            <el-collapse-item title="有序列表样式" name="orderedList">
              <div class="control-row">
                <div class="text">字体</div>
                <el-select v-model="orderedListFont" placeholder="请选择" size="mini" class="control">
                  <el-option
                    v-for="(font, index) in this.$store.state.fonts.fontList"
                    :key="index"
                    :label="font.verbose + '（' + font.weight + '）'"
                    :value="font.fontFamily"
                    :style="{
                      'font-family': font.fontFamily
                    }"/>
                </el-select>
              </div>
              <div class="control-row">
                <div class="text">字体大小</div>
                <el-slider
                  v-model="orderedListFontSize"
                  class="control"
                  :min="5"
                  :max="60"
                  :step="1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">字间距</div>
                <el-slider
                  v-model="orderedListLetterSpacing"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">行距</div>
                <el-slider
                  v-model="orderedListLineHeight"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">项目间距</div>
                <el-slider
                  v-model="orderedListItemMargin"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">段间距</div>
                <el-slider
                  v-model="orderedListMargin"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">缩进设置</div>
                <el-slider
                  v-model="orderedListIndent"
                  class="control"
                  :min="1"
                  :max="5"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">字体颜色</div>
                <el-color-picker v-model="orderedListColor" size="mini" :show-alpha="true"></el-color-picker>
              </div>
            </el-collapse-item>
            <el-collapse-item title="无序列表样式" name="unorderdList">
              <div class="control-row">
                <div class="text">字体</div>
                <el-select v-model="orderedListFont" placeholder="请选择" size="mini" class="control">
                  <el-option
                    v-for="(font, index) in this.$store.state.fonts.fontList"
                    :key="index"
                    :label="font.verbose + '（' + font.weight + '）'"
                    :value="font.fontFamily"
                    :style="{
                      'font-family': font.fontFamily
                    }"/>
                </el-select>
              </div>
              <div class="control-row">
                <div class="text">字体大小</div>
                <el-slider
                  v-model="unorderedListFontSize"
                  class="control"
                  :min="5"
                  :max="60"
                  :step="1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">字间距</div>
                <el-slider
                  v-model="unorderedListLetterSpacing"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">行距</div>
                <el-slider
                  v-model="unorderedListLineHeight"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">项目间距</div>
                <el-slider
                  v-model="unorderedListItemMargin"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">段间距</div>
                <el-slider
                  v-model="unorderedListMargin"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">缩进设置</div>
                <el-slider
                  v-model="unorderedListIndent"
                  class="control"
                  :min="1"
                  :max="5"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">字体颜色</div>
                <el-color-picker v-model="unorderedListColor" size="mini" :show-alpha="true"></el-color-picker>
              </div>
            </el-collapse-item>
            <el-collapse-item title="其他元素样式" name="other">
              <div class="control-row">
                <div class="text">图片圆角</div>
                <el-slider
                  v-model="imageBorderRadius"
                  class="control"
                  :min="0"
                  :max="30"
                  :step="1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">图片段间距</div>
                <el-slider
                  v-model="imageMargin"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">注释字体</div>
                <el-select v-model="imageLabelFont" placeholder="请选择" size="mini" class="control">
                  <el-option
                    v-for="(font, index) in this.$store.state.fonts.fontList"
                    :key="index"
                    :label="font.verbose + '（' + font.weight + '）'"
                    :value="font.fontFamily"
                    :style="{
                      'font-family': font.fontFamily
                    }"/>
                </el-select>
              </div>
              <div class="control-row">
                <div class="text">注释字体大小</div>
                <el-slider
                  v-model="imageLabelFontSize"
                  class="control"
                  :min="3"
                  :max="40"
                  :step="1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">注释字间距</div>
                <el-slider
                  v-model="imageLabelLetterSpacing"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">注释字体颜色</div>
                <el-color-picker v-model="imageLabelColor" size="mini" :show-alpha="true"></el-color-picker>
              </div>
              <div class="control-row">
                <div class="text">引用段间距</div>
                <el-slider
                  v-model="blockquoteMargin"
                  class="control"
                  :min="0"
                  :max="3"
                  :step="0.1"
                  :show-input="true"
                  input-size="mini"></el-slider>
              </div>
              <div class="control-row">
                <div class="text">引用标示颜色</div>
                <el-color-picker v-model="blockquoteBorderColor" size="mini" :show-alpha="true"></el-color-picker>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <div id="template-list">
          <div class="row">
            <div class="subtitle">已保存的模板</div>
          </div>
          <div v-if="this.$store.state.textToImage.templates.length != 0" id="list" class="interactable">
            <div
              v-for="(template, index) in this.$store.state.textToImage.templates"
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
              <div class="subtext">外框宽度：{{ template.padding != 0 ? template.padding : '无外框' }}</div>
              <div class="subtext">背景颜色：
                <div
                  class="color-sample"
                  :style="{
                    'background-color': template.backgroundColor
                  }"></div>
              </div>
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
      <div id="save">
        <div class="row">
          <div class="subtitle">保存设置</div>
        </div>
        <div class="control-row">
          <div class="text">存储位置</div>
          <el-input disabled size="mini" v-model="distDirectory" class="control interactable">
            <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
          </el-input>
        </div>
        <div class="control-row">
          <div class="text">文件名</div>
          <el-input size="mini" v-model="filename" class="control interactable" placeholder="请输入文件名">
            <template slot="append">.jpg</template>
          </el-input>
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
          <el-button type="primary" size="mini" @click="start" class="bar-button">开始处理</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import html2canvas from 'html2canvas'

const path = require('path')
const fs = require('fs')

export default {
  name: 'textToImageEditor',
  data () {
    return  {
      content: this.$store.state.textToImage.content,
      padding: 20,
      backgroundColor: '#303133',
      titleFont: this.$store.state.fonts.defaultFont,
      titleFontSize: 24,
      titleLetterSpacing: 0.3,
      titleLineHeight: 1.8,
      titleMargin: 0.5,
      titleTextAlign: 'justify',
      titleIndent: false,
      titleColor: 'rgba(255, 255, 255, 1)',
      subtitleFont: this.$store.state.fonts.defaultFont,
      subtitleFontSize: 18,
      subtitleLetterSpacing: 0.1,
      subtitleLineHeight: 1.8,
      subtitleMargin: 0.5,
      subtitleTextAlign: 'justify',
      subtitleIndent: false,
      subtitleColor: 'rgba(255, 255, 255, 1)',
      textFont: this.$store.state.fonts.defaultFont,
      textFontSize: 14,
      textLetterSpacing: 0,
      textLineHeight: 1.8,
      textMargin: 0.5,
      textAlign: 'justify',
      textIndent: true,
      textColor: 'rgba(255, 255, 255, 1)',
      orderedListFont: this.$store.state.fonts.defaultFont,
      orderedListFontSize: 14,
      orderedListLetterSpacing: 0,
      orderedListLineHeight: 1.8,
      orderedListMargin: 0.5,
      orderedListItemMargin: 0,
      orderedListIndent: 2,
      orderedListColor: 'rgba(255, 255, 255, 1)',
      unorderedListFont: this.$store.state.fonts.defaultFont,
      unorderedListFontSize: 14,
      unorderedListLetterSpacing: 0,
      unorderedListLineHeight: 1.8,
      unorderedListMargin: 0.5,
      unorderedListItemMargin: 0,
      unorderedListIndent: 2,
      unorderedListColor: 'rgba(255, 255, 255, 1)',
      imageBorderRadius: 0,
      imageMargin: 0.5,
      imageLabelFont: this.$store.state.fonts.defaultFont,
      imageLabelFontSize: 12,
      imageLabelLetterSpacing: 0,
      imageLabelColor: 'rgba(192, 196, 204, 1)',
      blockquoteMargin: 0.5,
      blockquoteBorderColor: 'rgba(220, 223, 230, 1)',
      distDirectory: '',
      filename: '',
      templateTitle: ''
    }
  },
  watch: {
    titleFont: (value) => {
      document.getElementById('preview').style.setProperty('--title-font', value)
    },
    titleFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--title-font-size', String(value) + 'px')
    },
    titleLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--title-letter-spacing', String(value) + 'em')
    },
    titleLineHeight: (value) => {
      document.getElementById('preview').style.setProperty('--title-line-height', String(value) + 'em')
    },
    titleMargin: (value) => {
      document.getElementById('preview').style.setProperty('--title-margin', String(value) + 'em')
    },
    titleTextAlign: (value) => {
      document.getElementById('preview').style.setProperty('--title-text-align', value)
    },
    titleIndent: (value) => {
      let indent = value ? '2em' : '0'
      document.getElementById('preview').style.setProperty('--title-indent', indent)
    },
    titleColor: (value) => {
      document.getElementById('preview').style.setProperty('--title-color', value)
    },
    subtitleFont: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-font', value)
    },
    subtitleFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-font-size', String(value) + 'px')
    },
    subtitleLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-letter-spacing', String(value) + 'em')
    },
    subtitleLineHeight: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-line-height', String(value) + 'em')
    },
    subtitleMargin: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-margin', String(value) + 'em')
    },
    subtitleTextAlign: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-text-align', value)
    },
    subtitleIndent: (value) => {
      let indent = value ? '2em' : '0'
      document.getElementById('preview').style.setProperty('--subtitle-indent', indent)
    },
    subtitleColor: (value) => {
      document.getElementById('preview').style.setProperty('--subtitle-color', value)
    },
    textFont: (value) => {
      document.getElementById('preview').style.setProperty('--text-font', value)
    },
    textFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--text-font-size', String(value) + 'px')
    },
    textLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--text-letter-spacing', String(value) + 'em')
    },
    textLineHeight: (value) => {
      document.getElementById('preview').style.setProperty('--text-line-height', String(value) + 'em')
    },
    textMargin: (value) => {
      document.getElementById('preview').style.setProperty('--text-margin', String(value) + 'em')
    },
    textAlign: (value) => {
      document.getElementById('preview').style.setProperty('--text-align', value)
    },
    textIndent: (value) => {
      let indent = value ? '2em' : '0'
      document.getElementById('preview').style.setProperty('--text-indent', indent)
    },
    textColor: (value) => {
      document.getElementById('preview').style.setProperty('--text-color', value)
    },
    orderedListFont: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-font', value)
    },
    orderedListFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-font-size', String(value) + 'px')
    },
    orderedListLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-letter-spacing', String(value) + 'em')
    },
    orderedListLineHeight: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-line-height', String(value) + 'em')
    },
    orderedListMargin: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-margin', String(value) + 'em')
    },
    orderedListItemMargin: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-item-margin', String(value) + 'em')
    },
    orderedListIndent: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-indent', String(value) + 'em')
    },
    orderedListColor: (value) => {
      document.getElementById('preview').style.setProperty('--ordered-list-color', value)
    },
    unorderedListFont: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-font', value)
    },
    unorderedListFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-font-size', String(value) + 'px')
    },
    unorderedListLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-letter-spacing', String(value) + 'em')
    },
    unorderedListLineHeight: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-line-height', String(value) + 'em')
    },
    unorderedListMargin: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-margin', String(value) + 'em')
    },
    unorderedListItemMargin: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-item-margin', String(value) + 'em')
    },
    unorderedListIndent: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-indent', String(value) + 'em')
    },
    unorderedListColor: (value) => {
      document.getElementById('preview').style.setProperty('--unordered-list-color', value)
    },
    imageBorderRadius: (value) => {
      document.getElementById('preview').style.setProperty('--image-border-radius', String(value) + 'px')
    },
    imageMargin: (value) => {
      document.getElementById('preview').style.setProperty('--image-margin', String(value) + 'em')
    },
    imageLabelFont: (value) => {
      document.getElementById('preview').style.setProperty('--image-label-font', value)
    },
    imageLabelFontSize: (value) => {
      document.getElementById('preview').style.setProperty('--image-label-font-size', String(value) + 'px')
    },
    imageLabelLetterSpacing: (value) => {
      document.getElementById('preview').style.setProperty('--image-label-letter-spacing', String(value) + 'em')
    },
    imageLabelColor: (value) => {
      document.getElementById('preview').style.setProperty('--image-label-color', value)
    },
    blockquoteMargin: (value) => {
      document.getElementById('preview').style.setProperty('--blockquote-margin', String(value) + 'em')
    },
    blockquoteBorderColor: (value) => {
      document.getElementById('preview').style.setProperty('--blockquote-border-color', value)
    }
  },
  methods: {
    minimize() {
      ipcRenderer.send('minimize')
    },
    close() {
      this.$store.dispatch('textToImage/contentReset')
      ipcRenderer.send('close')
      this.$destroy()
    },
    selectSaveFolder() {
      this.distDirectory = ipcRenderer.sendSync('select-folder')
    },
    applyTemplate(index) {
      let template = this.$store.state.textToImage.templates[index]
      this.padding = template.padding !== undefined ? template.padding : this.padding
      this.backgroundColor = template.backgroundColor !== undefined ? template.backgroundColor : this.backgroundColor
      this.titleFont = template.titleFont !== undefined ? template.titleFont : this.titleFont
      this.titleFontSize = template.titleFontSize !== undefined ? template.titleFontSize : this.titleFontSize
      this.titleLetterSpacing = template.titleLetterSpacing !== undefined ? template.titleLetterSpacing : this.titleLetterSpacing
      this.titleLineHeight = template.titleLineHeight !== undefined ? template.titleLineHeight : this.titleLineHeight
      this.titleMargin = template.titleMargin !== undefined ? template.titleMargin : this.titleMargin
      this.titleTextAlign = template.titleTextAlign !== undefined ? template.titleTextAlign : this.titleTextAlign
      this.titleIndent = template.titleIndent !== undefined ? template.titleIndent : this.titleIndent
      this.titleColor = template.titleColor !== undefined ? template.titleColor : this.titleColor
      this.subtitleFont = template.subtitleFont !== undefined ? template.subtitleFont : this.subtitleFont
      this.subtitleFontSize = template.subtitleFontSize !== undefined ? template.subtitleFontSize : this.subtitleFontSize
      this.subtitleLetterSpacing = template.subtitleLetterSpacing !== undefined ? template.subtitleLetterSpacing : this.subtitleLetterSpacing
      this.subtitleLineHeight = template.subtitleLineHeight !== undefined ? template.subtitleLineHeight : this.subtitleLineHeight
      this.subtitleMargin = template.subtitleMargin !== undefined ? template.subtitleMargin : this.subtitleMargin
      this.subtitleTextAlign = template.subtitleTextAlign !== undefined ? template.subtitleTextAlign : this.subtitleTextAlign
      this.subtitleIndent = template.subtitleIndent !== undefined ? template.subtitleIndent : this.subtitleIndent
      this.subtitleColor = template.subtitleColor !== undefined ? template.subtitleColor : this.subtitleColor
      this.textFont = template.textFont !== undefined ? template.textFont : this.textFont
      this.textFontSize = template.textFontSize !== undefined ? template.textFontSize : this.textFontSize
      this.textLetterSpacing = template.textLetterSpacing !== undefined ? template.textLetterSpacing : this.textLetterSpacing
      this.textLineHeight = template.textLineHeight !== undefined ? template.textLineHeight : this.textLineHeight
      this.textMargin = template.textMargin !== undefined ? template.textMargin : this.textMargin
      this.textAlign = template.textAlign !== undefined ? template.textAlign : this.textAlign
      this.textIndent = template.textIndent !== undefined ? template.textIndent : this.textIndent
      this.textColor = template.textColor !== undefined ? template.textColor : this.textColor
      this.orderedListFont = template.orderedListFont !== undefined ? template.orderedListFont : this.orderedListFont
      this.orderedListFontSize = template.orderedListFontSize !== undefined ? template.orderedListFontSize : this.orderedListFontSize
      this.orderedListLetterSpacing = template.orderedListLetterSpacing !== undefined ? template.orderedListLetterSpacing : this.orderedListLetterSpacing
      this.orderedListLineHeight = template.orderedListLineHeight !== undefined ? template.orderedListLineHeight : this.orderedListLineHeight
      this.orderedListMargin = template.orderedListMargin !== undefined ? template.orderedListMargin : this.orderedListMargin
      this.orderedListItemMargin = template.orderedListItemMargin !== undefined ? template.orderedListItemMargin : this.orderedListItemMargin
      this.orderedListIndent = template.orderedListIndent !== undefined ? template.orderedListIndent : this.orderedListIndent
      this.orderedListColor = template.orderedListColor !== undefined ? template.orderedListColor : this.orderedListColor
      this.unorderedListFont = template.unorderedListFont !== undefined ? template.unorderedListFont : this.unorderedListFont
      this.unorderedListFontSize = template.unorderedListFontSize !== undefined ? template.unorderedListFontSize : this.unorderedListFontSize
      this.unorderedListLetterSpacing = template.unorderedListLetterSpacing !== undefined ? template.unorderedListLetterSpacing : this.unorderedListLetterSpacing
      this.unorderedListLineHeight = template.unorderedListLineHeight !== undefined ? template.unorderedListLineHeight : this.unorderedListLineHeight
      this.unorderedListMargin = template.unorderedListMargin !== undefined ? template.unorderedListMargin : this.unorderedListMargin
      this.unorderedListItemMargin = template.unorderedListItemMargin !== undefined ? template.unorderedListItemMargin : this.unorderedListItemMargin
      this.unorderedListIndent = template.unorderedListIndent !== undefined ? template.unorderedListIndent : this.unorderedListIndent
      this.unorderedListColor = template.unorderedListColor !== undefined ? template.unorderedListColor : this.unorderedListColor
      this.imageBorderRadius = template.imageBorderRadius !== undefined ? template.imageBorderRadius : this.imageBorderRadius
      this.imageMargin = template.imageMargin !== undefined ? template.imageMargin : this.imageMargin
      this.imageLabelFont = template.imageLabelFont !== undefined ? template.imageLabelFont : this.imageLabelFont
      this.imageLabelFontSize = template.imageLabelFontSize !== undefined ? template.imageLabelFontSize : this.imageLabelFontSize
      this.imageLabelLetterSpacing = template.imageLabelLetterSpacing !== undefined ? template.imageLabelLetterSpacing : this.imageLabelLetterSpacing
      this.imageLabelColor = template.imageLabelColor !== undefined ? template.imageLabelColor : this.imageLabelColor
      this.blockquoteMargin = template.blockquoteMargin !== undefined ? template.blockquoteMargin : this.blockquoteMargin
      this.blockquoteBorderColor = template.blockquoteBorderColor !== undefined ? template.blockquoteBorderColor : this.blockquoteBorderColor
      this.$dialog({
        type: 'success',
        title: '成功',
        text: '已成功应用模板。'
      })
    },
    deleteTemplate(index) {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '确定要删除这个模板吗？',
        showCancel: true,
        confirmFunction: () => {
          this.$store.dispatch('textToImage/templateDelete', index)
        }
      })
    },
    saveAsTemplate() {
      let template =  {
        title: this.templateTitle,
        padding: this.padding,
        backgroundColor: this.backgroundColor,
        titleFont: this.titleFont,
        titleFontSize: this.titleFontSize,
        titleLetterSpacing: this.titleLetterSpacing,
        titleLineHeight: this.titleLineHeight,
        titleMargin: this.titleMargin,
        titleTextAlign: this.titleTextAlign,
        titleIndent: this.titleIndent,
        titleColor: this.titleColor,
        subtitleFont: this.subtitleFont,
        subtitleFontSize: this.subtitleFontSize,
        subtitleLetterSpacing: this.subtitleLetterSpacing,
        subtitleLineHeight: this.subtitleLineHeight,
        subtitleMargin: this.subtitleMargin,
        subtitleTextAlign: this.subtitleTextAlign,
        subtitleIndent: this.subtitleIndent,
        subtitleColor: this.subtitleColor,
        textFont: this.textFont,
        textFontSize: this.textFontSize,
        textLetterSpacing: this.textLetterSpacing,
        textLineHeight: this.textLineHeight,
        textMargin: this.textMargin,
        textAlign: this.textAlign,
        textIndent: this.textIndent,
        textColor: this.textColor,
        orderedListFont: this.orderedListFont,
        orderedListFontSize: this.orderedListFontSize,
        orderedListLetterSpacing: this.orderedListLetterSpacing,
        orderedListLineHeight: this.orderedListLineHeight,
        orderedListMargin: this.orderedListMargin,
        orderedListItemMargin: this.orderedListItemMargin,
        orderedListIndent: this.orderedListIndent,
        orderedListColor: this.orderedListColor,
        unorderedListFont: this.unorderedListFont,
        unorderedListFontSize: this.unorderedListFontSize,
        unorderedListLetterSpacing: this.unorderedListLetterSpacing,
        unorderedListLineHeight: this.unorderedListLineHeight,
        unorderedListMargin: this.unorderedListMargin,
        unorderedListItemMargin: this.unorderedListItemMargin,
        unorderedListIndent: this.unorderedListIndent,
        unorderedListColor: this.unorderedListColor,
        imageBorderRadius: this.imageBorderRadius,
        imageMargin: this.imageMargin,
        imageLabelFont: this.imageLabelFont,
        imageLabelFontSize: this.imageLabelFontSize,
        imageLabelLetterSpacing: this.imageLabelLetterSpacing,
        imageLabelColor: this.imageLabelColor,
        blockquoteMargin: this.blockquoteMargin,
        blockquoteBorderColor: this.blockquoteBorderColor
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
                title: '请输入样式模板标题',
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
          for (let i = 0; i < this.$store.state.textToImage.templates.length; i++) {
            if (title == this.$store.state.textToImage.templates[i].title) {
              this.$dialog({
                type: 'warning',
                title: '需要重命名',
                text: '已存在同名模板，您需要更改当前模板的标题才能将其保存。',
                showCancel: true,
                confirmFunction: () => {
                  this.$dialog({
                    title: '请输入样式模板标题',
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
          this.$store.dispatch('textToImage/templatePush', template)
          this.$dialog({
            type: 'success',
            title: '成功',
            text: '样式模板保存成功。'
          })
        }
      }
      this.$dialog({
        title: '请输入样式模板标题',
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
    },
    start() {
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
          let fullname = this.filename + '.jpg'
          let distFullpath = path.join(this.distDirectory, fullname)
          let previewContainer = document.getElementById('preview-container')
          previewContainer.style['overflow-y'] = 'hidden'
          let preview = document.getElementById('preview')
          let width = window.getComputedStyle(preview).getPropertyValue('width').slice(0, -2)
          let height = window.getComputedStyle(preview).getPropertyValue('height').slice(0, -2)
          let scale = Math.min((1500 / width), (16000 / height))
          let canvas = document.createElement('canvas')
          canvas.width = width * scale
          canvas.height = height * scale
          html2canvas(preview, {
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
                  text: '处理完成，制作完成的图片已保存到目标文件夹。即将退出编辑器。',
                  showConfirm: true,
                  confirmFunction: () => {
                    this.close()
                  }
                })
              }
            })
          })
        })
      }
    }
  }
}
</script>

<style lang="scss">  
.el-color-picker__panel {
  button {
    font-family: var(--main-font);
  }
}

.el-popper {
  -webkit-app-region: no-drag;
}

#text-to-image-editor {
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
    width: 35%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    #preview-container {
      width: 100%;
      height: 0;
      flex-grow: 1;
      border-color: var(--light-gray);
      border-style: solid;
      border-width: 1px;
      border-radius: 6px;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: auto;
      
      #preview {
        width: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        color: var(--white);
        margin-bottom: 0;
        margin-top: 0;
        
        --title-font: var(--main-font);
        --title-font-size: 24px;
        --title-letter-spacing: 0.3em;
        --title-line-height: 1.8em;
        --title-margin: 0.5em;
        --title-text-align: justify;
        --title-indent: 0;
        --title-color: #FFFFFF;
        --subtitle-font: var(--main-font);
        --subtitle-font-size: 18px;
        --subtitle-letter-spacing: 0.1em;
        --subtitle-line-height: 1.8em;
        --subtitle-margin: 0.5em;
        --subtitle-text-align: justify;
        --subtitle-indent: 0;
        --subtitle-color: #FFFFFF;
        --text-font: var(--main-font);
        --text-font-size: 14px;
        --text-letter-spacing: 0;
        --text-line-height: 1.8em;
        --text-margin: 0.5em;
        --text-align: justify;
        --text-indent: 2em;
        --text-color: #FFFFFF;
        --ordered-list-font: var(--main-font);
        --ordered-list-font-size: 14px;
        --ordered-list-letter-spacing: 0;
        --ordered-list-line-height: 1.8em;
        --ordered-list-margin: 0.5em;
        --ordered-list-item-margin: 0;
        --ordered-list-indent: 2em;
        --ordered-list-color: #FFFFFF;
        --unordered-list-font: var(--main-font);
        --unordered-list-font-size: 14px;
        --unordered-list-letter-spacing: 0;
        --unordered-list-line-height: 1.8em;
        --unordered-list-margin: 0.5em;
        --unordered-list-item-margin: 0;
        --unordered-list-indent: 2em;
        --unordered-list-color: #FFFFFF;
        --image-margin: 0.5em;
        --image-border-radius: 0;
        --image-label-font: var(--main-font);
        --image-label-font-size: 12px;
        --image-label-letter-spacing: 0;
        --image-label-color: #C0C4CC;
        --blockquote-margin: 0.5em;
        --blockquote-border-color: #DCDFE6;
        
        blockquote {
          margin: 0;
          padding-left: 10px;
          margin-top: var(--blockquote-margin);
          margin-bottom: var(--blockquote-margin);
          border-left-color: var(--blockquote-border-color);
          border-left-style: solid;
          border-left-width: 3px;
          box-sizing: border-box;
        }
        
        h2 {
          font-family: var(--title-font);
          font-size: var(--title-font-size);
          letter-spacing: var(--title-letter-spacing);
          margin-top: var(--title-margin);
          margin-bottom: var(--title-margin);
          line-height: var(--title-line-height);
          text-align: var(--title-text-align);
          text-indent: var(--title-indent);
          color: var(--title-color);
        }
        
        h3 {
          font-family: var(--subtitle-font);
          font-size: var(--subtitle-font-size);
          letter-spacing: var(--subtitle-letter-spacing);
          margin-top: var(--subtitle-margin);
          margin-bottom: var(--subtitle-margin);
          line-height: var(--subtitle-line-height);
          text-align: var(--subtitle-text-align);
          text-indent: var(--subtitle-indent);
          color: var(--subtitle-color);
        }
        
        p {
          font-family: var(--text-font);
          font-size: var(--text-font-size);
          letter-spacing: var(--text-letter-spacing);
          margin-top: var(--text-margin);
          margin-bottom: var(--text-margin);
          line-height: var(--text-line-height);
          text-align: var(--text-align);
          text-indent: var(--text-indent);
          color: var(--text-color);
        }
        
        ul {
          font-family: var(--unordered-list-font);
          font-size: var(--unordered-list-font-size);
          letter-spacing: var(--unordered-list-letter-spacing);
          margin-top: var(--unordered-list-margin);
          margin-bottom: var(--unordered-list-margin);
          line-height: var(--unordered-list-line-height);
          padding-left: var(--unordered-list-indent);
          color: var(--unordered-list-color);
          
          li {
            margin-top: var(--unordered-list-item-margin);
            margin-bottom: var(--unordered-item-list-margin);
          }
        }
        
        ol {
          font-family: var(--ordered-list-font);
          font-size: var(--ordered-list-font-size);
          letter-spacing: var(--ordered-list-letter-spacing);
          margin-top: var(--ordered-list-margin);
          margin-bottom: var(--ordered-list-margin);
          line-height: var(--ordered-list-line-height);
          padding-left: var(--ordered-list-indent);
          color: var(--ordered-list-color);
          
          li {
            margin-top: var(--ordered-list-item-margin);
            margin-bottom: var(--ordered-item-list-margin);
          }
        }
        
        figure {
          margin: 0;
          width: 100%;
          
          img {
            display: block;
            width: 100%;
            border-radius: var(--image-border-radius);
            font-size: 12px;
            margin-top: var(--image-margin);
            margin-bottom: var(--image-margin);
          }
          
          canvas {
            display: block;
            width: 100%;
            border-radius: var(--image-border-radius);
            font-size: 12px;
            margin-top: var(--image-margin);
            margin-bottom: var(--image-margin);
          }
          
          figcaption {
            font-family: var(--image-label-font);
            font-size: var(--image-label-font-size);
            letter-spacing: var(--image-label-letter-spacing);
            text-align: center;
            color: var(--image-label-color);
          }
        }
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
  
  #right {
    flex-grow: 1;
    height: 100%;
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    
    #control {
      width: 100%;
      height: 0;
      flex-grow: 1;
      display: flex;
      justify-content: space-between;
      
      #settings {
        width: 60%;
        height: 100%;
        
        .el-collapse-item__header {
          height: 30px;
          font-size: 14px;
        }
        
        .el-collapse-item__content {
          padding-top: 10px;
          padding-bottom: 10px;
        }
      }
      
      #template-list {
        flex-grow: 1;
        height: 100%;
        margin-left: 20px;
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
            
            .subtext {
              display: flex;
              align-items: center;
              
              .color-sample {
                width: 1em;
                height: 1em;
                border-color: var(--light-gray);
                border-style: solid;
                border-radius: 3px;
                border-width: 1px;
                box-sizing: border-box;
              }
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
    
    #save {
      margin-top: 10px;
    }
  }
}
</style>
