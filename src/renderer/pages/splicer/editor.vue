<template>
  <div id="splicer-editor">
    <div class="page-header">
      <div class="page-title">长图拼接工具 - 编辑器</div>
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
          <div v-if="vertical" id="vertical-sample-container">
            <div
              id="sample"
              :style="{
                'padding': padding + 'px',
                'background-color': backgroundColor
              }">
              <div
                v-for="(image, index) in this.$store.state.splicer.fileList"
                class="image-container"
                :key="index"
                :style="{
                  'margin-bottom': index != ($store.state.splicer.fileList.length - 1) ? (spacing + 'px') : 0
                }">
                <div
                  class="image-wrapper"
                  :style="{
                    'border-radius': borderRadius + 'px'
                  }">
                  <img
                    class="image"
                    :src="image.fullpath"/>
                </div>
                <div
                  class="image-controller"
                  :style="{
                    'border-radius': borderRadius + 'px'
                  }">
                  <div
                    v-if="index != 0"
                    class="action move"
                    key="up"
                    @click="moveUp(index)">
                    <span class="fa fa-arrow-up"></span>
                    <div>上移</div>
                  </div>
                  <div
                    v-if="index != ($store.state.splicer.fileList.length - 1)"
                    class="action move"
                    key="down"
                    @click="moveDown(index)">
                    <span class="fa fa-arrow-down"></span>
                    <div>下移</div>
                  </div>
                  <div class="action delete" @click="handleDelete(index)">
                    <span class="fa fa-trash-alt"></span>
                    <div>删除</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else id="horizontal-sample-container">
            <div
              id="sample"
              :style="{
                'padding': padding + 'px',
                'background-color': backgroundColor
              }">
              <div
                v-for="(image, index) in this.$store.state.splicer.fileList"
                class="image-container"
                :key="index"
                :style="{
                  'margin-left': index == 0 ? 0 : (spacing + 'px')
                }">
                <div
                  class="image-wrapper"
                  :style="{
                    'border-radius': borderRadius + 'px'
                  }">
                  <img
                    class="image"
                    :src="image.fullpath"/>
                </div>
                <div
                  class="image-controller"
                  :style="{
                    'border-radius': borderRadius + 'px'
                  }">
                  <div
                    v-if="index != 0"
                    class="action move"
                    key="left"
                    @click="moveUp(index)">
                    <span class="fa fa-arrow-left"></span>
                    <div>左移</div>
                  </div>
                  <div
                    v-if="index != ($store.state.splicer.fileList.length - 1)"
                    class="action move"
                    key="right"
                    @click="moveDown(index)">
                    <span class="fa fa-arrow-right"></span>
                    <div>右移</div>
                  </div>
                  <div class="action delete" @click="handleDelete(index)">
                    <span class="fa fa-trash-alt"></span>
                    <div>删除</div>
                  </div>
                </div>
              </div>
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
                  <div class="subtitle">拼接方向设置</div>
                </div>
                <div class="control-row">
                  <el-switch
                    v-model="vertical"
                    active-color="var(--main-color)"
                    inactive-color="var(--main-color)"
                    active-text="纵向拼接"
                    inactive-text="横向拼接"
                    class="full-width-control"
                    @change="changeDirection"></el-switch>
                </div>
                <div class="row">
                  <div class="subtitle">拼接样式设置</div>
                </div>
                <div class="control-row">
                  <div class="text">边框颜色</div>
                  <el-color-picker v-model="backgroundColor" size="mini" :show-alpha="true"></el-color-picker>
                </div>
                <div class="control-row">
                  <div class="text">外框宽度</div>
                </div>
                <div class="control-row">
                  <el-slider
                    v-model="padding"
                    class="full-width-control"
                    :min="0"
                    :max="100"
                    :step="1"
                    :show-input="true"
                    input-size="mini"></el-slider>
                </div>
                <div class="control-row">
                  <div class="text">图片间距</div>
                </div>
                <div class="control-row">
                  <el-slider
                    v-model="spacing"
                    class="full-width-control"
                    :min="0"
                    :max="100"
                    :step="1"
                    :show-input="true"
                    input-size="mini"></el-slider>
                </div>
                <div class="control-row">
                  <div class="text">图片圆角</div>
                </div>
                <div class="control-row">
                  <el-slider
                    v-model="borderRadius"
                    class="full-width-control"
                    :min="0"
                    :max="100"
                    :step="1"
                    :show-input="true"
                    input-size="mini"></el-slider>
                </div>
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
                    class="full-width-control"
                    :min="1"
                    :max="100"
                    :step="1"
                    :show-input="true"
                    input-size="mini"></el-slider>
                </div>
                <div class="control-row">
                  <div class="text">存储位置</div>
                </div>
                <div class="control-row">
                  <el-input disabled size="mini" v-model="distDirectory" class="full-width-control">
                    <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
                  </el-input>
                </div>
                <div class="control-row">
                  <div class="text">文件名</div>
                </div>
                <div class="control-row">
                  <el-input size="mini" v-model="filename" class="full-width-control" placeholder="请输入文件名">
                    <el-select v-model="mimeType" size="mini" slot="append">
                      <el-option label=".jpg" value="jpeg"/>
                      <el-option label=".webp" value="webp"/>
                      <el-option label=".png" value="png"/>
                    </el-select>
                  </el-input>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane>
            <span slot="label">文件列表</span>
            <div id="file-list">
              <div id="list">
                <div
                  v-for="(file, index) in this.$store.state.splicer.fileList"
                  :key="index"
                  class="file">
                  <div class="filename">{{ file.filename + '.' + file.ext }}</div>
                  <div
                    v-if="index != 0 && vertical"
                    key="up"
                    @click.stop="moveUp(index)">
                    <i class="fas fa-arrow-up move"></i>
                  </div>
                  <div
                    v-if="index != $store.state.splicer.fileList.length - 1 && vertical"
                    key="down"
                    @click.stop="moveDown(index)">
                    <i class="fas fa-arrow-down move"></i>
                  </div>
                  <div
                    v-if="index != 0 && !vertical"
                    key="left"
                    @click.stop="moveUp(index)">
                    <i class="fas fa-arrow-left move"></i>
                  </div>
                  <div
                    v-if="index != $store.state.splicer.fileList.length - 1 && !vertical"
                    key="right"
                    @click.stop="moveDown(index)">
                    <i class="fas fa-arrow-right move"></i>
                  </div>
                  <div @click.stop="handleDelete(index)">
                    <i class="fas fa-trash-alt delete"></i>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane>
            <span slot="label">模板列表</span>
            <div id="template-list">
              <div v-if="this.$store.state.splicer.templates.length != 0" id="list">
                <div
                  v-for="(template, index) in this.$store.state.splicer.templates"
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
                  <div class="subtext">外框宽度：{{ template.padding != 0 ? template.padding : '无外框' }}</div>
                  <div class="subtext">图片间距：{{ template.spacing != 0 ? template.spacing : '无间距' }}</div>
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
          <el-button type="primary" size="mini" @click="start" class="bar-button">开始拼接</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import html2canvas from 'html2canvas'
import EXIF from 'exif-js'

const path = require('path')
const fs = require('fs')

export default {
  name: 'splicerEditor',
  data () {
    return  {
      vertical: true,
      padding: 0,
      spacing: 0,
      borderRadius: 0,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      quality: 90,
      distDirectory: '',
      filename: '',
      mimeType: 'jpeg',
      templateTitle: '',
      imagesChanged: false,
      errorList: []
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
      this.$store.dispatch('splicer/fileListEmpty').then(() => {
        this.$router.replace('/splicer')
      })
    },
    close() {
      this.$store.dispatch('splicer/fileListEmpty').then(() => {
        ipcRenderer.send('close')
        this.$destroy()
      })
    },
    changeDirection(vertical) {
      if (!vertical) {
        this.$nextTick(() => {
          document.getElementById('horizontal-sample-container').addEventListener('mousewheel', (event) => {
            if (document.getElementById('horizontal-sample-container')) {
              document.getElementById('horizontal-sample-container').scrollLeft -= event.wheelDelta / 2
              event.preventDefault()
            }
          })
        })
      }
    },
    moveUp(index) {
      let fileList = this.$store.state.splicer.fileList.slice()
      let image = fileList[index - 1]
      fileList[index - 1] = fileList[index]
      fileList[index] = image
      this.$store.dispatch('splicer/fileListAssign', fileList)
      this.imagesChanged = true
    },
    moveDown(index) {
      let fileList = this.$store.state.splicer.fileList.slice()
      let image = fileList[index + 1]
      fileList[index + 1] = fileList[index]
      fileList[index] = image
      this.$store.dispatch('splicer/fileListAssign', fileList)
      this.imagesChanged = true
    },
    handleDelete(index) {
      if (this.$store.state.splicer.fileList.length > 1) {
        this.$store.dispatch('splicer/fileListDelete', index)
        this.imagesChanged = true
      } else {
        this.back()
      }
    },
    selectSaveFolder() {
      this.distDirectory = ipcRenderer.sendSync('select-folder')
    },
    applyTemplate(index) {
      let template = this.$store.state.splicer.templates[index]
      this.padding = template.padding !== undefined ? template.padding : this.padding
      this.spacing = template.spacing !== undefined ? template.spacing : this.spacing
      this.borderRadius = template.borderRadius !== undefined ? template.borderRadius : this.borderRadius
      this.backgroundColor = template.backgroundColor !== undefined ? template.backgroundColor : this.backgroundColor
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
          this.$store.dispatch('splicer/templateDelete', index)
        }
      })
    },
    saveAsTemplate() {
      let template =  {
        title: this.templateTitle,
        padding: this.padding,
        spacing: this.spacing,
        borderRadius: this.borderRadius,
        backgroundColor: this.backgroundColor
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
                title: '请输入长图拼接模板标题',
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
          for (let i = 0; i < this.$store.state.splicer.templates.length; i++) {
            if (title == this.$store.state.splicer.templates[i].title) {
              this.$dialog({
                type: 'warning',
                title: '需要重命名',
                text: '已存在同名模板，您需要更改当前模板的标题才能将其保存。',
                showCancel: true,
                confirmFunction: () => {
                  this.$dialog({
                    title: '请输入长图拼接模板标题',
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
          this.$store.dispatch('splicer/templatePush', template)
          this.$dialog({
            type: 'success',
            title: '成功',
            text: '长图拼接模板保存成功。'
          })
        }
      }
      this.$dialog({
        title: '请输入长图拼接模板标题',
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
          let ext = this.mimeType == 'jpeg' ? '.jpg' : ('.' + this.mimeType)
          let fullname = this.filename + ext
          let distFullpath = path.join(this.distDirectory, fullname)
          let images = document.getElementsByClassName('image')
          let sample = document.getElementById('sample')
          let width = window.getComputedStyle(sample).getPropertyValue('width').slice(0, -2)
          let height = window.getComputedStyle(sample).getPropertyValue('height').slice(0, -2)
          let scale
          let maxScale
          if (this.vertical) {
            let maxWidth = 0
            for (let i = 0; i < images.length; i++) {
              maxWidth = Math.max(maxWidth, images[i].width)
            }
            maxWidth = maxWidth * (width / (width - this.padding * 2))
            maxScale = maxWidth / width
            scale = Math.min((maxWidth / width), (16000 / height), Math.sqrt(256000000 / (width * height)))
          } else {
            let maxHeight = 0
            for (let i = 0; i < images.length; i++) {
              maxHeight = Math.max(maxHeight, images[i].height)
            }
            maxHeight = maxHeight * (height / (height - this.padding * 2))
            maxScale = maxHeight / height
            scale = Math.min((maxHeight / height), (16000 / width), Math.sqrt(256000000 / (width * height)))
          }
          let canvas = document.createElement('canvas')
          canvas.width = width * scale
          canvas.height = height * scale
          html2canvas(sample, {
            canvas: canvas,
            scale: scale,
            backgroundColor: null,
            allowTaint: true,
            imageTimeout: 0
          }).then(canvas => {
            let url = canvas.toDataURL('image/' + this.mimeType, this.quality).replace(/^data:image\/\w+;base64,/, "")
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
                if (scale < maxScale) {
                  dialog.change({
                    type: 'success',
                    title: '成功',
                    text: '处理完成，拼接后的长图已保存到目标文件夹。因为图片数量过多或原图尺寸过大，拼接后图片尺寸超出限制，已将其缩小到系统允许的最大尺寸。',
                    showConfirm: true,
                    confirmFunction: () => {
                      this.back()
                    }
                  })
                } else {
                  dialog.change({
                    type: 'success',
                    title: '成功',
                    text: '处理完成，拼接后的长图已保存到目标文件夹。',
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
    },
    refresh() {
      this.$dialog({
        title: '正在更新预览',
        text: '即将完成，请稍候。',
        showConfirm: false
      }).then((dialog) => {
        let total = this.$store.state.splicer.fileList.length
        let wrappers = document.getElementsByClassName('image-wrapper')
        let images = document.getElementsByClassName('image')
        let replace = (index) => {
          dialog.change({
            text: '正在处理第 ' + String(index + 1) + ' 张，共 ' + String(total) + ' 张。'
          }).then(() => {
            let image = document.createElement('img')
            image.src = `file://${this.$store.state.splicer.fileList[index].fullpath}`
            image.onerror = () => {
              this.errorList.push(this.$store.state.splicer.fileList[index].fullpath)
              this.$store.dispatch('splicer/fileListDelete', index).then(() => {
                if (this.$store.state.splicer.fileList.length == 0) {
                  dialog.change({
                    type: 'error',
                    title: '出现错误',
                    text: '全部图片读取失败，即将返回。',
                    showConfirm: true,
                    confirmFunction: () => {
                      this.back()
                    }
                  })
                } else {
                  if (index < this.$store.state.splicer.fileList.length) {
                    return replace(index)
                  } else {
                    dialog.change({
                      type: 'warning',
                      title: '出现错误',
                      text: '部分图片读取失败，但您仍可以使用余下的图片生成长图。以下为读取失败的文件：',
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
                        this.errorList = []
                      }
                    })
                  }
                }
              })
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
                canvas.className = 'image'
                images[index].parentNode.replaceChild(canvas, images[index])
                if (index < this.$store.state.splicer.fileList.length - 1) {
                  return replace(index + 1)
                } else {
                  if (this.errorList.length == 0) {
                    dialog.close()
                  } else {
                    dialog.change({
                      type: 'warning',
                      title: '出现错误',
                      text: '部分图片读取失败，但您仍可以使用余下的图片生成长图。以下为读取失败的文件：',
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
                        this.errorList = []
                      }
                    })
                  }
                }
              })
            }
          })
        }
        replace(0)
      })
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.refresh()
    })
  },
  updated() {
    if (this.imagesChanged) {
      this.$nextTick(() => {
        this.refresh()
      this.imagesChanged = false
      })
    }
  }
}
</script>

<style lang="scss">  
#splicer-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  #content {
    height: 0;
    width: 100%;
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
    
    .el-input-group__append {
      width: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  
  #left {
    width: 0;
    height: 100%;
    flex-grow: 1;
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
    
      #vertical-sample-container {
        width: 100%;
        height: 100%;
        background-color: var(--black-gray);
        border-color: var(--light-gray);
        border-style: solid;
        border-width: 1px;
        box-sizing: border-box;
        border-radius: 6px;
        overflow-x: hidden;
        overflow-y: auto;
        text-align: center;
        font-size: 0;
          
        #sample {
          width: 400px;
          box-sizing: border-box;
          display: inline-block;
          box-shadow: 0 0 10px var(--black);
          
          .image-container {
            width: 100%;
            position: relative;
            
            .image-wrapper {
              width: 100%;
              overflow: hidden;
              
              .image {
                width: 100%;
                display: block;
              }
            }
            
            .image-controller {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: var(--transparent-black-cover);
              transition: 0.2s;
              opacity: 0;
                
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
                color: var(--white);
                transition: 0.2s;
                
                svg {
                  font-size: 20px;
                  margin: 5px;
                }
                
                &:active {
                  filter: brightness(0.9);
                }
              }
              
              &:hover {
                opacity: 1;
              }
              
              .move:hover {
                color: var(--main-color);
              }
              
              .delete:hover {
                color: var(--warning-red);
              }
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

      #horizontal-sample-container {
        width: 100%;
        height: 100%;
        background-color: var(--black-gray);
        border-color: var(--light-gray);
        border-style: solid;
        border-width: 1px;
        box-sizing: border-box;
        border-radius: 6px;
        overflow-x: auto;
        overflow-y: hidden;
        display: flex;
        align-items: center;
          
        #sample {
          height: 400px;
          width: fit-content;
          box-sizing: border-box;
          white-space: nowrap;
          box-shadow: 0 0 10px var(--black);
          
          .image-container {
            height: 100%;
            position: relative;
            display: inline-block;
            
            .image-wrapper {
              height: 100%;
              overflow: hidden;
              
              .image {
                height: 100%;
                display: block;
              }
            }
            
            .image-controller {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: var(--transparent-black-cover);
              transition: 0.2s;
              opacity: 0;
                
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
                color: var(--white);
                transition: 0.2s;
                
                svg {
                  font-size: 20px;
                  margin: 5px;
                }
                
                &:active {
                  filter: brightness(0.9);
                }
              }
              
              &:hover {
                opacity: 1;
              }
              
              .move:hover {
                color: var(--main-color);
              }
              
              .delete:hover {
                color: var(--warning-red);
              }
            }
          }
        }
        
        &::-webkit-scrollbar {
          height: 10px;
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

        #save {
          margin-top: 10px;
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
              margin-right: 5px;
              margin-left: 5px;
              
              &:hover {
                color: var(--warning-red);
              }
              
              &:first-index {
                margin-left: 0;
              }
              
              &:last-index {
                margin-right: 0;
              }
            }
            
            .move {
              color: var(--light-gray);
              cursor: pointer;
              transition: 0.2s;
              margin-right: 5px;
              margin-left: 5px;
              
              &:hover {
                color: var(--main-color);
              }
              
              &:first-index {
                margin-left: 0;
              }
              
              &:last-index {
                margin-right: 0;
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
