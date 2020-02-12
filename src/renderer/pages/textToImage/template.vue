<template>
  <div id="text-to-image-template">
    <div
      id="preview-container"
      class="interactable"
      :style="{
        'background-color': backgroundColor
      }">
      <div
        id="preview"
        :style="{
          'padding': padding + 'px',
          'background-color': backgroundColor
        }">
        <h2>标题样例</h2>
        <h3>二级标题样例</h3>
        <p>这是一篇样例文章，用于在创建模板时提供参考。下列内容来自公有领域，或由本程序开发者创作并享有著作权。</p>
        <h3>洋芋田图像工具箱</h3>
        <p>洋芋田图像工具箱是一个基于 Electron 和 Vue.js 的具有多种图像相关功能的工具软件。目前它具有以下功能：</p>
        <ul>
          <li>图片加水印工具：具备丰富的样式设置，水印的内容和外观均可随心定制。可单张处理，亦可批量处理，操作便捷高效。性能良好，处理图片迅速；运行稳定，大尺寸图片轻松应对。</li>
          <li>长图拼接工具：可以将若干图片拼接为一张长图，也能为单张图片添加简单边框。不限制输入图片数量，最大支持输出高度为 16000 像素或面积为 256000000 像素的图片，能尽可能多地保留原图片的细节。</li>
          <li>富文本制图工具：将富文本内容输出为图片，支持文本、标题、项目列表、图片和引用内容。每一类富文本元素都有丰富的自定义设置，可以随心定制外观样式，还可以将样式保存为模板以供下次使用。</li>
          <li>尺寸调整工具：对图片进行批量调整大小的操作，支持固定比例、固定长边和固定短边三种模式。同样具有良好的性能和稳定性，短时间内可以处理大量图片，也可以处理大尺寸图片。</li>
          <li>图片裁剪工具：可以采用自由模式裁剪，可以采用预置的多种常用比例裁剪，也可以自定义比例裁剪。支持批量导入图片，在工作流程中能够维持裁剪设置和保存设置不变，提升效率。</li>
          <li>EXIF 读取工具：从 JPEG 文件中读取 EXIF 信息，支持相机制造商、型号等设备信息和曝光补偿、镜头焦距、光圈、快门、感光度等曝光参数以及作者、图像尺寸等图像文件信息。</li>
          <li>字体管理工具：管理本地字体库，还可以从在线字体库中下载字体。在线字体库现有数十款字体，全部为商用免费字体，且仍在持续更新。支持将下载的字体用于其他工具，也能设为界面字体。</li>
        </ul>
        <p>洋芋田图像工具箱基于 MIT 协议开源。目前提供适用于 Windows 的构建版本，使用其他平台的用户可以自行下载源码并构建。</p>
        <p>洋芋田图像工具箱在开发过程中使用了下列开源组件和库：</p>
        <ul>
          <li>Electron</li>
          <li>electron-buider</li>
          <li>Vue.js</li>
          <li>Vue Router</li>
          <li>Vuex</li>
          <li>Vuex Electron</li>
          <li>vue-clamp</li>
          <li>Element UI</li>
          <li>Font Awesome</li>
          <li>html2canvas</li>
          <li>CKEditor 5</li>
          <li>EXIF.js</li>
          <li>Cropper.js</li>
        </ul>
        <h3>爱莲说</h3>
        <blockquote>
          <p>水陆草木之花，可爱者甚蕃。晋陶渊明独爱菊。自李唐来，世人盛爱牡丹。予独爱莲之出淤泥而不染，濯清涟而不妖，中通外直，不蔓不枝，香远益清，亭亭净植，可远观而不可亵玩焉。</p>
          <figure>
            <img src="static/sample/lotus.jpg" />
            <figcaption>莲花</figcaption>
          </figure>
          <P>予谓菊，花之隐逸者也；牡丹，花之富贵者也；莲，花之君子者也。噫！菊之爱，陶后鲜有闻；莲之爱，同予者何人? 牡丹之爱，宜乎众矣。</P>
        </blockquote>
      </div>
    </div>
    <div id="control" class="interactable">
      <div id="controller">
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
              <el-select v-model="titleFont" placeholder="请选择" size="mini">
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
              <el-select v-model="titleTextAlign" placeholder="请选择" size="mini">
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
              <el-select v-model="subtitleFont" placeholder="请选择" size="mini">
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
              <el-select v-model="subtitleTextAlign" placeholder="请选择" size="mini">
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
              <el-select v-model="textFont" placeholder="请选择" size="mini">
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
              <el-select v-model="textAlign" placeholder="请选择" size="mini">
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
              <el-select v-model="orderedListFont" placeholder="请选择" size="mini">
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
              <el-select v-model="orderedListFont" placeholder="请选择" size="mini">
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
              <el-select v-model="imageLabelFont" placeholder="请选择" size="mini">
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
      <el-input v-model="templateTitle" placeholder="请输入模板标题" size="mini"></el-input>
      <div class="row">
        <el-button type="primary" size="mini" @click="exit" class="control-button">退出编辑器</el-button>
        <el-button v-if="index != -1" type="primary" size="mini" @click="save" class="control-button">保存</el-button>
        <el-button type="primary" size="mini" @click="saveAsNew" class="control-button">{{ index == -1 ? '保存' : '另存'}}</el-button>
        <el-button v-if="index != -1" type="primary" size="mini" @click="deleteTemplate" class="control-button">删除</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'textToImageTemplate',
  data () {
    return  {
      templateTitle: '',
      index: this.$route.query.index,
      padding: 20,
      backgroundColor: '#303133',
      titleFont: this.$store.state.fonts.defaultFont,
      titleFontSize: 24,
      titleLetterSpacing: 0.3,
      titleLineHeight: 1.8,
      titleMargin: 0.5,
      titleTextAlign: 'justify',
      titleIndent: false,
      titleColor: '#FFFFFF',
      subtitleFont: this.$store.state.fonts.defaultFont,
      subtitleFontSize: 18,
      subtitleLetterSpacing: 0.1,
      subtitleLineHeight: 1.8,
      subtitleMargin: 0.5,
      subtitleTextAlign: 'justify',
      subtitleIndent: false,
      subtitleColor: '#FFFFFF',
      textFont: this.$store.state.fonts.defaultFont,
      textFontSize: 14,
      textLetterSpacing: 0,
      textLineHeight: 1.8,
      textMargin: 0.5,
      textAlign: 'justify',
      textIndent: true,
      textColor: '#FFFFFF',
      orderedListFont: this.$store.state.fonts.defaultFont,
      orderedListFontSize: 14,
      orderedListLetterSpacing: 0,
      orderedListLineHeight: 1.8,
      orderedListMargin: 0.5,
      orderedListItemMargin: 0,
      orderedListIndent: 2,
      orderedListColor: '#FFFFFF',
      unorderedListFont: this.$store.state.fonts.defaultFont,
      unorderedListFontSize: 14,
      unorderedListLetterSpacing: 0,
      unorderedListLineHeight: 1.8,
      unorderedListMargin: 0.5,
      unorderedListItemMargin: 0,
      unorderedListIndent: 2,
      unorderedListColor: '#FFFFFF',
      imageBorderRadius: 0,
      imageMargin: 0.5,
      imageLabelFont: this.$store.state.fonts.defaultFont,
      imageLabelFontSize: 12,
      imageLabelLetterSpacing: 0,
      imageLabelColor: '#C0C4CC',
      blockquoteMargin: 0.5,
      blockquoteBorderColor: '#DCDFE6'
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
    close() {
      ipcRenderer.send('close')
      this.$destroy()
    },
    exit() {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '您确定要退出编辑器吗？您所作出的更改将会丢失。',
        showCancel: true,
        confirmFunction: () => {
          this.close()
        }
      })
    },
    deleteTemplate(index) {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '确定要删除这个模板吗？',
        showCancel: true,
        confirmFunction: (index) => {
          this.$store.dispatch('textToImage/templateDelete', index)
          this.close()
        }
      })
    },
    save() {
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
            if (title == this.$store.state.textToImage.templates[i].title && this.index != i) {
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
          this.$store.dispatch('textToImage/templatePush', {
            index: this.index,
            template: template
          })
          this.$dialog({
            type: 'success',
            title: '成功',
            text: '保存成功。是否关闭编辑器？',
            showCancel: true,
            confirmFunction: () => {
              this.close()
            }
          })
        }
      }
      checkName(this.templateTitle)
    },
    saveAsNew() {
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
            text: '保存成功。是否关闭编辑器？',
            showCancel: true,
            confirmFunction: () => {
              this.close()
            },
            cancelFunction: () => {
              this.index = this.$store.state.splicer.templates.length - 1
            }
          })
        }
      }
      checkName(this.templateTitle)
    }
  },
  mounted() {
    if (this.$route.query.index != -1) {
      let index = this.$route.query.index
      this.templateTitle = this.$store.state.textToImage.templates[index].title
      this.padding = this.$store.state.textToImage.templates[index].padding
      this.backgroundColor = this.$store.state.textToImage.templates[index].backgroundColor
      this.titleFont = this.$store.state.textToImage.templates[index].titleFont
      this.titleFontSize = this.$store.state.textToImage.templates[index].titleFontSize
      this.titleLetterSpacing = this.$store.state.textToImage.templates[index].titleLetterSpacing
      this.titleLineHeight = this.$store.state.textToImage.templates[index].titleLineHeight
      this.titleMargin = this.$store.state.textToImage.templates[index].titleMargin
      this.titleTextAlign = this.$store.state.textToImage.templates[index].titleTextAlign
      this.titleIndent = this.$store.state.textToImage.templates[index].titleIndent
      this.titleColor = this.$store.state.textToImage.templates[index].titleColor
      this.subtitleFont = this.$store.state.textToImage.templates[index].subtitleFont
      this.subtitleFontSize = this.$store.state.textToImage.templates[index].subtitleFontSize
      this.subtitleLetterSpacing = this.$store.state.textToImage.templates[index].subtitleLetterSpacing
      this.subtitleLineHeight = this.$store.state.textToImage.templates[index].subtitleLineHeight
      this.subtitleMargin = this.$store.state.textToImage.templates[index].subtitleMargin
      this.subtitleTextAlign = this.$store.state.textToImage.templates[index].subtitleTextAlign
      this.subtitleIndent = this.$store.state.textToImage.templates[index].subtitleIndent
      this.subtitleColor = this.$store.state.textToImage.templates[index].subtitleColor
      this.textFont = this.$store.state.textToImage.templates[index].textFont
      this.textFontSize = this.$store.state.textToImage.templates[index].textFontSize
      this.textLetterSpacing = this.$store.state.textToImage.templates[index].textLetterSpacing
      this.textLineHeight = this.$store.state.textToImage.templates[index].textLineHeight
      this.textMargin = this.$store.state.textToImage.templates[index].textMargin
      this.textAlign = this.$store.state.textToImage.templates[index].textAlign
      this.textIndent = this.$store.state.textToImage.templates[index].textIndent
      this.textColor = this.$store.state.textToImage.templates[index].textColor
      this.orderedListFont = this.$store.state.textToImage.templates[index].orderedListFont
      this.orderedListFontSize = this.$store.state.textToImage.templates[index].orderedListFontSize
      this.orderedListLetterSpacing = this.$store.state.textToImage.templates[index].orderedListLetterSpacing
      this.orderedListLineHeight = this.$store.state.textToImage.templates[index].orderedListLineHeight
      this.orderedListMargin = this.$store.state.textToImage.templates[index].orderedListMargin
      this.orderedListItemMargin = this.$store.state.textToImage.templates[index].orderedListItemMargin
      this.orderedListIndent = this.$store.state.textToImage.templates[index].orderedListIndent
      this.orderedListColor = this.$store.state.textToImage.templates[index].orderedListColor
      this.unorderedListFont = this.$store.state.textToImage.templates[index].unorderedListFont
      this.unorderedListFontSize = this.$store.state.textToImage.templates[index].unorderedListFontSize
      this.unorderedListLetterSpacing = this.$store.state.textToImage.templates[index].unorderedListLetterSpacing
      this.unorderedListLineHeight = this.$store.state.textToImage.templates[index].unorderedListLineHeight
      this.unorderedListMargin = this.$store.state.textToImage.templates[index].unorderedListMargin
      this.unorderedListItemMargin = this.$store.state.textToImage.templates[index].unorderedListItemMargin
      this.unorderedListIndent = this.$store.state.textToImage.templates[index].unorderedListIndent
      this.unorderedListColor = this.$store.state.textToImage.templates[index].unorderedListColor
      this.imageBorderRadius = this.$store.state.textToImage.templates[index].imageBorderRadius
      this.imageMargin = this.$store.state.textToImage.templates[index].imageMargin
      this.imageLabelFont = this.$store.state.textToImage.templates[index].imageLabelFont
      this.imageLabelFontSize = this.$store.state.textToImage.templates[index].imageLabelFontSize
      this.imageLabelLetterSpacing = this.$store.state.textToImage.templates[index].imageLabelLetterSpacing
      this.imageLabelColor = this.$store.state.textToImage.templates[index].imageLabelColor
      this.blockquoteMargin = this.$store.state.textToImage.templates[index].blockquoteMargin
      this.blockquoteBorderColor = this.$store.state.textToImage.templates[index].blockquoteBorderColor
      this.$dialog({
        text: '您正在编辑一个已保存的模板。如果您希望修改后覆盖原模板请点击“保存”，如果您希望将修改后的模板存储为副本请点击“另存”。'
      })
    }
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

#text-to-image-template {
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
    
  #preview-container {
    width: 35%;
    height: 100%;
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
  
  #control {
    flex-grow: 1;
    margin-left: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    #controller {
      flex-grow: 1;
    }
    
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
    
    .el-collapse-item__header {
      height: 30px;
      font-size: 14px;
    }
    
    .el-collapse-item__content {
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
}
</style>
