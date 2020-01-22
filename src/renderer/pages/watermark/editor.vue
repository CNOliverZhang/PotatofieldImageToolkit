<template>
  <div id="editor">
    <div id="preview">
      <div id="sample-container">
        <img :src="this.$store.state.watermark.fileList[this.imageIndex].fullpath" id="sample" />
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
              @click="preview(index)">
              <div class="filename">{{ file.filename + '.' + file.ext }}</div>
              <div @click.stop="handleDelete(index)">
                <i class="fas fa-trash-alt delete"></i>
              </div>
            </div>
          </div>
          <div v-if="this.$store.state.watermark.fileList.length > 100" class="control-row interactable">
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
        <div id="template-list" class="interactable">
          <div class="row">
            <div class="subtitle">已保存的模板</div>
          </div>
          <div v-if="this.$store.state.watermark.templates.length != 0" id="list">
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
              <div class="subtext">内容：{{ template.text }}</div>
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
    <div id="control">
      <div>
        <el-input
          :rows="2"
          v-model="text"
          type="textarea"
          resize="none"
          placeholder="请输入水印内容"
          class="interactable control"></el-input>
        <div class="row">
          <div class="subtitle">水印样式设置</div>
        </div>
        <div class="control-row">
          <div class="text">水印文字方向</div>
          <el-select v-model="writingMode" placeholder="请选择" size="mini" class="interactable">
            <el-option label="水平" value="horizontal-tb" class="interactable"/>
            <el-option label="垂直从右至左" value="vertical-rl" class="interactable"/>
            <el-option label="垂直从左至右" value="vertical-lr" class="interactable"/>
          </el-select>
        </div>
        <div class="control-row">
          <div class="text">多行水印对齐方式</div>
          <el-select v-model="textAlign" placeholder="请选择" size="mini" class="interactable">
            <el-option label="居中对齐" value="center" class="interactable"/>
            <el-option label="行首对齐" value="left" class="interactable"/>
            <el-option label="行尾对其" value="right" class="interactable"/>
          </el-select>
        </div>
        <div class="control-row">
          <div class="text">多行水印行距</div>
          <el-slider
            v-model="lineHeight"
            class="control interactable"
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
            class="control interactable"
            :min="0"
            :max="100"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="control-row">
          <div class="text">水印位置基准</div>
          <el-select v-model="position" @change="changePosition" placeholder="请选择" size="mini" class="interactable">
            <el-option label="中央" value="center" class="interactable"/>
            <el-option label="左上角" value="left-top" class="interactable"/>
            <el-option label="右上角" value="right-top" class="interactable"/>
            <el-option label="左下角" value="left-bottom" class="interactable"/>
            <el-option label="右下角" value="right-bottom" class="interactable"/>
            <el-option label="上方" value="top" class="interactable"/>
            <el-option label="下方" value="bottom" class="interactable"/>
            <el-option label="左侧" value="left" class="interactable"/>
            <el-option label="右侧" value="right" class="interactable"/>
          </el-select>
        </div>
        <div
          v-if="position == 'left-top' || position == 'left-bottom' || position == 'left' || position == 'right-top' || position == 'right-bottom' || position == 'right'"
          class="control-row">
          <div v-if="position == 'left-top' || position == 'left-bottom' || position == 'left'" class="text">水印与左边缘的距离</div>
          <div v-if="position == 'right-top' || position == 'right-bottom' || position == 'right'" class="text">水印与右边缘的距离</div>
          <el-slider
            v-model="offsetX"
            class="control interactable"
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
            class="control interactable"
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
            class="control interactable"
            :min="-180"
            :max="180"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="control-row">
          <div class="text">水印字体</div>
          <el-select v-model="font" placeholder="请选择" size="mini" class="interactable">
            <el-option-group label="中英文字体">
              <el-option label="思源黑体(细)" value="NotoSansSCThin" class="interactable" style="font-family: NotoSansSCThin;"/>
              <el-option label="思源黑体(粗)" value="NotoSansSCBlack" class="interactable" style="font-family: NotoSansSCBlack;"/>
              <el-option label="思源宋体(细)" value="NotoSerifSCThin" class="interactable" style="font-family: NotoSerifSCThin;"/>
              <el-option label="思源宋体(粗)" value="NotoSerifSCBlack" class="interactable" style="font-family: NotoSerifSCBlack;"/>
              <el-option label="站酷庆科黄油体" value="ZCoolHuangyou" class="interactable" style="font-family: ZCoolHuangyou;"/>
              <el-option label="站酷小薇LOGO体" value="ZCoolXiaowei" class="interactable" style="font-family: ZCoolXiaowei;"/>
              <el-option label="站酷快乐体" value="ZCoolKuaile" class="interactable" style="font-family: ZCoolKuaile;"/>
              <el-option label="站酷文艺体" value="ZCoolWenyi" class="interactable" style="font-family: ZCoolWenyi;"/>
              <el-option label="站酷酷黑体" value="ZCoolKuhei" class="interactable" style="font-family: ZCoolKuhei;"/>
              <el-option label="站酷高端黑体" value="ZCoolGaoduanhei" class="interactable" style="font-family: ZCoolGaoduanhei;"/>
            </el-option-group>
            <el-option-group label="纯英文字体">
              <el-option label="ZCOOL Addict Italic" value="ZCoolAddict" class="interactable" style="font-family: ZCoolAddict;"></el-option>
            </el-option-group>
          </el-select>
        </div>
        <div class="control-row">
          <div class="text">水印字体大小</div>
          <el-slider
            v-model="relativeFontSize"
            class="control interactable"
            :min="1"
            :max="100"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="control-row">
          <div class="text">水印颜色</div>
          <el-color-picker v-model="color" size="mini" class="interactable" :show-alpha="true"></el-color-picker>
        </div>
        <div class="row">
          <div class="subtitle">保存设置</div>
        </div>
        <div class="control-row">
          <div class="text">存储位置</div>
          <el-switch
            v-model="customDistDirectory"
            active-color="#2196F3"
            inactive-color="#2196F3"
            active-text="自定义路径"
            inactive-text="保存在原路径"
            class="control interactable"></el-switch>
        </div>
        <div v-if="customDistDirectory" class="control-row">
          <div class="text">自定义存储位置</div>
          <el-input disabled size="mini" v-model="distDirectory" v-if="customDistDirectory" class="control interactable">
            <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
          </el-input>
        </div>
        <div class="control-row">
          <div class="text">目录结构</div>
          <el-switch
            v-if="srcDirectory != '' && customDistDirectory"
            v-model="keepDirectoryStructure"
            active-color="#2196F3"
            inactive-color="#2196F3"
            active-text="保持目录结构"
            inactive-text="不保持目录结构"
            class="control interactable"></el-switch>
        </div>
        <div class="control-row">
          <div class="text">保存的图片格式</div>
          <el-radio-group v-model="mimeType" class="interactable control">
            <el-radio label="JPEG"></el-radio>
            <el-radio label="PNG"></el-radio>
            <el-radio label="保持原格式"></el-radio>
          </el-radio-group>
        </div>
        <div class="control-row">
          <div class="text">文件名后缀</div>
          <el-input size="mini" v-model="postPend" maxlength="12" class="interactable control"></el-input>
        </div>
      </div>
      <div class="control-buttons">
        <el-button type="primary" size="mini" @click="exit" class="control-button interactable">退出编辑器</el-button>
        <el-button type="primary" size="mini" @click="saveAsTemplate" class="control-button interactable">保存为模板</el-button>
        <el-button type="primary" size="mini" @click="start" class="control-button interactable">处理这张图片</el-button>
        <el-button type="primary" size="mini" @click="startAll" class="control-button interactable">处理全部图片</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import ResizeObserver from 'resize-observer-polyfill'
import '../../utils/html2canvas.min.js'

const path = require('path')
const fs = require('fs')
const ipcRenderer = require('electron').ipcRenderer
const CreateDirectory = require('../../utils/createdirectory').CreateDirectory

export default {
  name: 'watermarkEditor',
  data () {
    return  {
      customDistDirectory: false,
      distDirectory: '',
      srcDirectory: this.$route.query.srcDirectory,
      keepDirectoryStructure: false,
      mimeType: 'JPEG',
      postPend: '_watermarked',
      fileListPage: 1,
      imageIndex: 0,
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
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.$store.state.watermark.fileList.length / 100)
    },
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
      ipcRenderer.send('close')
      this.$store.dispatch('watermark/fileListEmpty')
      this.$store.dispatch('watermark/configReset')
    },
    pageChange(page) {
      this.fileListPage = page
    },
    handleDelete(index) {
      let targetIndex = index + (this.fileListPage - 1) * 100
      if (this.$store.state.watermark.fileList.length > 1) {
        this.$store.dispatch('watermark/fileListDelete', targetIndex)
        if (this.imageIndex > targetIndex) {
          this.imageIndex -= 1
        } else if (this.imageIndex == targetIndex) {
          this.imageIndex = 0
        }
      } else {
        this.close()
      }
    },
    preview(index) {
      this.imageIndex = index + (this.fileListPage - 1) * 100
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
    exit() {
      if (this.$store.state.watermark.fileList.length != 0) {
        this.$dialog({
          title: '操作确认',
          text: '您即将退出编辑器，但您的文件列表中仍有待处理文件。您是否要保留这些文件，以便您修改图片保存设置后继续编辑？',
          showCancel: true,
          confirmText: '保留',
          cancelText: '不保留',
          confirmFunction: () => {
            ipcRenderer.send('close')
          },
          cancelFunction: () => {
            this.close()
          }
        })
      } else {
        this.close()
      }
    },
    saveAsTemplate() {
      if (this.text.length == 0) {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字！'
        })
        return
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
              'font-family': 'NotoSansSCThin'
            }
          })
        ]),
        showCancel: true,
        confirmFunction: () => {
          if (this.templateTitle == '') {
            this.$dialog({
              type: 'error',
              title: '保存失败',
              text: '请输入水印模板标题！'
            })
            return
          }
          for (let i = 0; i < this.$store.state.watermark.templates.length; i++) {
            if (this.templateTitle == this.$store.state.watermark.templates[i].title) {
              this.$dialog({
                type: 'warning',
                title: '操作确认',
                text: '已存在同名的水印模板，是否覆盖？',
                showCancel: true,
                confirmFunction: () => {
                  this.$store.dispatch('watermark/templateReplace', {
                    index: i,
                    template: {
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
                  })
                  this.templateTitle = ''
                },
                cancelFunction: () => {
                  this.templateTitle = ''
                }
              })
              return
            }
          }
          this.$store.dispatch('watermark/templatePush', {
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
          })
          this.templateTitle = ''
        },
        cancelFunction: () => {
          this.templateTitle = ''
        }
      })
    },
    start() {
      if (this.text.length == 0) {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字！'
        })
        return
      }
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
      let distFilename = imageInfo.filename + this.postPend + '.' + distExt
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
      let image = new Image()
      image.src = imageInfo.fullpath
      let scale = image.width / this.sampleWidth
      let baseCanvas = document.createElement('canvas')
      let context = baseCanvas.getContext("2d")
      baseCanvas.width = image.width
      baseCanvas.height = image.height
      context.drawImage(image, 0, 0)
      html2canvas(document.getElementById('watermark-container'), {
        scale: scale,
        backgroundColor: null
      }).then(canvas => {
        context.drawImage(canvas, 0, 0)
        let url = baseCanvas.toDataURL('image/' + mimeType).replace(/^data:image\/\w+;base64,/, "")
        let buffer = new Buffer(url, 'base64')
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
              this.$store.dispatch('watermark/fileListDelete', this.imageIndex)
              this.imageIndex = 0
              dialog.change({
                type: 'success',
                title: '成功',
                text: '处理完成，添加水印后的图片已保存到目标文件夹。',
                showConfirm: true
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
    },
    startAll() {
      this.$dialog({
        text: '功能正在开发中。'
      })
    }
  },
  mounted() {
    const WatermarkSizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        this.watermarkWidth = entry.contentRect.width
        this.watermarkHeight = entry.contentRect.height
      })
    })
    WatermarkSizeObserver.observe(document.getElementById('watermark'))
    const SampleSizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        let width = entry.contentRect.width
        let height = entry.contentRect.height
        this.sampleWidth = width
        this.sampleHeight = height
        this.sizeBaseX = width / 100
        this.sizeBaseY = height / 100
      })
    })
    SampleSizeObserver.observe(document.getElementById('sample'))
  }
}
</script>

<style lang="scss">  
.el-color-picker__panel {
  -webkit-app-region: no-drag;
  
  button {
    font-family: "NotoSansSC";
  }
}

#editor {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
  button {
    font-family: "NotoSansSC";
  }
  
  input {
    font-family: "NotoSansSC";
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
  
  .control-buttons {
    display: flex;
    justify-content: space-between;
    justify-content: flex-end;
    
    .control-button {
      width: calc((100% - 30px) / 4);
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
      background-color: #606266;
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
      }
      
      #watermark {
        position: absolute;
        width: fit-content;
        height: fit-content;
        line-height: 1em;
      }
    }
    
    #lists {
      width: 100%;
      flex-grow: 1;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      
      #file-list {
        width: calc(50% - 5px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        #indicator {
          height: 28px;
          width: 100%;
          line-height: 28px;
          font-size: 14px;
          text-align: center;
          color: #FFFFFF;
          background-color: #2196F3;
          border-radius: 14px;
        }
        
        #list {
          width: 100%;
          flex-grow: 1;
          background-color: #F5F7FA;
          box-sizing: border-box;
          border-radius: 6px;
          border-color: #DCDFE6;
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
            background-color: #FFFFFF;
            border-bottom-color: #DCDFE6;
            border-bottom-style: solid;
            border-bottom-width: 1px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: 0.2s;
            
            &:hover {
              background-color: #F5F7FA;
            }
            
            .filename {
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              flex-grow: 1;
              padding-right: 10px;
            }
            
            .delete {
              color: #DCDFE6;
              cursor: pointer;
              transition: 0.2s;
              
              &:hover {
                color: #F56C6C;
              }
            }
          }
          
          &::-webkit-scrollbar {
            width: 10px;
          }
              
          &::-webkit-scrollbar-track {
            border-radius: 5px;
            background-color: rgba(255, 255, 255, 0);
            
            &:hover {
              background-color: #F5F7FA;
            }
          }
          
          &::-webkit-scrollbar-thumb {
            border-radius: 5px;
            background-color: #DCDFE6;
            transition: 0.2s;
            
            &:hover {
              background-color: #C0C4CC;
            }
          }
        }
        
        .el-pagination {
          width: 100%;
          padding: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .el-pagination__jump {
            margin: 0;
          }
          
          .btn-prev {
            margin: 0;
          }
          
          .btn-next {
            margin: 0;
          }
        }
      }
      
      #template-list {
        width: calc(50% - 5px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        
        #list {
          width: 100%;
          flex-grow: 1;
          background-color: #F5F7FA;
          box-sizing: border-box;
          border-radius: 6px;
          border-color: #DCDFE6;
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
            background-color: #FFFFFF;
            border-bottom-color: #DCDFE6;
            border-bottom-style: solid;
            border-bottom-width: 1px;
            
            .text {
              width: 100%;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            
            .subtext {
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
              background-color: #FFFFFF;
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
                  color: #2196F3;
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
            background-color: rgba(255, 255, 255, 0);
            
            &:hover {
              background-color: #F5F7FA;
            }
          }
          
          &::-webkit-scrollbar-thumb {
            border-radius: 5px;
            background-color: #DCDFE6;
            transition: 0.2s;
            
            &:hover {
              background-color: #C0C4CC;
            }
          }
        }
        
        #empty-container {
          width: 100%;
          flex-grow: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #F5F7FA;
          box-sizing: border-box;
          border-radius: 6px;
          border-color: #DCDFE6;
          border-style: solid;
          border-width: 1px;
          overflow-y: auto;
          overflow-x: hidden;
          
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
      font-family: "NotoSansSC"
    }
      
    textarea {
      &::-webkit-scrollbar {
        width: 10px;
      }
          
      &::-webkit-scrollbar-track {
        border-radius: 5px;
        background-color: rgba(255, 255, 255, 0);
        
        &:hover {
          background-color: #F5F7FA;
        }
      }
      
      &::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background-color: #DCDFE6;
        transition: 0.2s;
        
        &:hover {
          background-color: #C0C4CC;
        }
      }
    }
  }
}
</style>
