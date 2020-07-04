<template>
  <div id="splicer">
    <div class="page-header">
      <div class="page-title">长图拼接工具</div>
      <div class="control-button minimize" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div class="control-button close" @click="close">
        <object data="static/images/close.svg" type="image/svg+xml"></object>
      </div>
    </div>
    <el-tabs type="card" tab-position="top" id="content" @tab-click="clear">
      <el-tab-pane>
        <span slot="label"><i class="fas fa-image"></i> 导入图片</span>
        <div id="file-input" class="tab-content">
          <el-upload
            id="upload-dragger"
            action=""
            drag
            multiple
            :auto-upload="false"
            :on-change="handleFile"
            :show-file-list="false"
            :class="this.fileList.length != 0 ? 'half' : ''">
            <i class="fas fa-image"></i>
            <div class="el-upload__text">将图片拖到此处，或<em>点击选择图片</em></div>
          </el-upload>
          <div v-if="this.fileList.length != 0" id="file-list">
            <div id="list">
              <div
                v-for="(file, index) in this.fileList"
                :key="index"
                class="file"
                @click="preview(index)">
                <div class="filename">{{ file.filename + '.' + file.ext }}</div>
                <div @click.stop="handleDelete(index)">
                  <i class="fas fa-trash-alt delete"></i>
                </div>
              </div>
            </div>
            <div class="row">
              <el-button type="primary" size="mini" @click="clearConfirm" class="bar-button">清空列表</el-button>
              <el-button type="primary" size="mini" @click="edit" class="bar-button">进入长图拼接编辑器</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="fas fa-images"></i> 拼接模板库</span>
        <div class="tool-templates tab-content">
          <div class="templates-container" v-if="this.$store.state.splicer.templates.length != 0">
            <div
              v-for="(template, index) in this.$store.state.splicer.templates.slice(templateListPage * 6 - 6, templateListPage * 6)"
              :key="index"
              class="template-container">
              <div class="card">
                <div class="row">
                  <div class="subtitle">{{ template.title }}</div>
                </div>
                <div class="text">外框宽度：{{ template.padding != 0 ? template.padding : '无外框' }}</div>
                <div class="text">图片间距：{{ template.spacing != 0 ? template.spacing : '无间距' }}</div>
                <v-clamp autoresize :max-lines="2" class="text">{{ template.text }}</v-clamp>
                <div class="row actions">
                  <div class="action" @click="editTemplate(index + (templateListPage - 1) * 6)">
                    <span class="fa fa-edit"></span>
                    <div>编辑</div>
                  </div>
                  <div class="action" @click="shareTemplate(index + (templateListPage - 1) * 6)">
                    <span class="fa fa-share-alt"></span>
                    <div>分享</div>
                  </div>
                  <div class="action" @click="deleteTemplate(index + (templateListPage - 1) * 6)">
                    <span class="fa fa-trash-alt"></span>
                    <div>删除</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-container">
            <div class="empty">
              <i class="fas fa-folder-open"></i>
              <div>尚无已保存的模板</div>
            </div>
          </div>
          <div class="row">
            <el-pagination
              v-if="this.$store.state.splicer.templates.length > 6"
              small
              background
              layout="prev, pager, next"
              :pager-count="5"
              :page-size="6"
              :total="this.$store.state.splicer.templates.length"
              :current-page="templateListPage"
              :hide-on-single-page="true"
              @current-change="templateListPageChange">
            </el-pagination>
            <el-button type="primary" size="mini" @click="importTemplate" class="bar-button">导入长图拼接模板</el-button>
            <el-button type="primary" size="mini" @click="createTemplate" class="bar-button">创建长图拼接模板</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ipcRenderer, clipboard } from 'electron'
import EXIF from 'exif-js'

const ReadDirectory = require('../utils/ReadDirectory')
const path = require('path')

export default {
  name: 'splicer',
  data () {
    return {
      fileList: [],
      templateListPage: 1,
      templateTitle: ''
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
    clear() {
      this.fileList = []
    },
    clearConfirm() {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '将清除您已导入的图片，确定执行操作吗？',
        showCancel: true,
        confirmFunction: () => {
          this.clear()
        }
      })
    },
    handleFile(file) {
      let ext = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length).toLowerCase()
      let filename = file.name.substring(0, file.name.lastIndexOf("."))
      let filepath = path.dirname(file.raw.path)
      let formats = new Set(['jpg', 'jpeg','webp', 'png'])
      if (formats.has(ext)) {
        this.fileList.push({
          fullpath: file.raw.path,
          filename: filename,
          ext: ext
        })
      }
    },
    handleDelete(index) {
      this.fileList.splice(index, 1)
    },
    preview(index) {
      this.$dialog({
        title: '图像预览',
        text: '正在生成预览',
        showConfirm: false
      }).then((dialog) => {
        let url = this.fileList[index].fullpath
        let image = document.createElement('img')
        image.src = url
        image.onerror = () => {
          dialog.change({
            type: 'error',
            title: '出现错误',
            text: '生成预览失败，请检查图像文件是否正常。',
            showConfirm: true
          })
        }
        image.onload = () => {
          EXIF.getData(image, () => {
            EXIF.getAllTags(image)
            let orientation = EXIF.getTag(image, 'Orientation')
            if (orientation == 3 || orientation == 6 || orientation == 8) {
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
              } else {
                width = image.height
                height = image.width
                x = -height
                y = 0
                rotation = 270
              }
              canvas.height = height
              canvas.width = width
              let context = canvas.getContext("2d")
              context.rotate(rotation * Math.PI / 180)
              context.drawImage(image, x, y)
              dialog.change({
                title: '图像预览',
                text: '',
                showConfirm: true,
                content: this.$createElement('img', {
                  'attrs': {
                    'id': 'preview-image'
                  }
                })
              }).then(() => {
                canvas.style.width = '100%'
                canvas.style.display = 'block'
                let previewImage = document.getElementById('preview-image')
                previewImage.parentNode.replaceChild(canvas, previewImage)
              })
            } else {
              dialog.change({
                title: '图像预览',
                text: '',
                showConfirm: true,
                content: this.$createElement('img', {
                  'attrs': {
                    'src': url
                  }
                })
              })
            }
          })
        }
      })
    },
    templateListPageChange(page) {
      this.templateListPage = page
    },
    edit() {
      this.$store.dispatch('splicer/fileListAssign', this.fileList).then(() => {
        this.$router.replace('/splicer/editor')
      })
    },
    editTemplate(index) {
      this.$router.replace('/splicer/template?index=' + String(index))
    },
    shareTemplate(index) {
      clipboard.writeText(btoa(encodeURI(JSON.stringify({
        type: 'splicerTemplate',
        content: this.$store.state.splicer.templates[index]
      }))))
      this.$dialog({
        type: 'success',
        title: '成功',
        text: '已成功将长图拼接模板复制到剪贴板。'
      })
    },
    deleteTemplate(index) {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '确定要删除这个模板吗？',
        showCancel: true,
        confirmFunction: () => {
          if (this.templateListPage != 1) {
            if (this.templateListPage == Math.ceil(this.$store.state.splicer.templates.length / 6)) {
              if (this.$store.state.splicer.templates.length % 6 == 1) {
                this.templateListPage -= 1
              }
            }
          }
          this.$store.dispatch('splicer/templateDelete', index)
        }
      })
    },
    importTemplate() {
      try {
        let template = JSON.parse(decodeURI(atob(clipboard.readText())))
        if (template.type != 'splicerTemplate') {
          throw false
        } else {
          template = template.content
          let checkName = (title) => {
            if (title == '') {
              this.$dialog({
                type: 'error',
                title: '错误',
                text: '请输入模板标题，否则无法导入该模板。',
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
                    title: '存在同名模板',
                    text: '您需要将新导入的模板重命名，才能将其保存。',
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
                text: '长图拼接模板导入成功。'
              })
            }
          }
          checkName(template.title)
        }
      } catch (e) {
        this.$dialog({
          type: 'error',
          title: '导入失败',
          text: '未能从您的剪贴板中读取到长图拼接模板信息！'
        })
      }
    },
    createTemplate() {
      this.$router.replace('/splicer/template?index=-1')
    }
  },
  mounted() {
    ipcRenderer.send('unmaximize')
  }
}
</script>

<style lang="scss">
#splicer {
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
      
    #file-input {
      flex-direction: row;
      
      #upload-dragger {
        width: 100%;
        height: 100%;
        transition: 0.5s;
        
        &.half {
          width: calc(50% - 10px);
        }
        
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
      
      #file-list {
        width: calc(50% - 10px);
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
    }
  }
}
</style>
