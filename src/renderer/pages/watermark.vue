<template>
  <div id="watermark">
    <div id="header">
      <div id="title">图片加水印工具</div>
      <div id="minimize" class="control-button" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div id="close" class="control-button" @click="close">
        <object data="static/images/close.svg" type="image/svg+xml"></object>
      </div>
    </div>
    <el-tabs type="card" tab-position="top" id="content" @tab-click="clear">
      <el-tab-pane>
        <span slot="label"><i class="fas fa-image"></i> 导入图片</span>
        <div id="single" class="tab-content">
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
                :key="file.fullpath"
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
              <el-button type="primary" size="mini" @click="edit" class="bar-button">进入水印编辑器</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="fas fa-folder-open"></i> 选择文件夹</span>
        <div id="multiple" class="tab-content">
          <div class="wrapper" v-if="this.fileList.length == 0">
            <div class="row">
              <el-switch
                v-model="childDirectoryIncluded"
                active-text="包含子目录"
                inactive-text="不包含子目录"
               ></el-switch>
              <el-input disabled size="mini" v-model="srcDirectory" class="control">
                <el-button @click="selectSourceFolder" slot="prepend">选择</el-button>
              </el-input>
            </div>
            <el-button
              @click="handleFolder"
              type="primary"
              size="mini"
             >扫描文件夹</el-button>
            <div id="file-list" class="row">
              <div id="empty">
                <i class="fas fa-folder-open"></i>
                <div>未导入图片</div>
              </div>
            </div>
          </div>
          <div class="wrapper" v-else>
            <div id="file-list">
              <div
                v-for="(file, index) in this.fileList.slice(fileListPage * 100 - 100, fileListPage * 100)"
                :key="file.fullpath"
                class="file"
                @click="preview(index + (fileListPage - 1) * 100)">
                <div class="filename">{{ file.filename + '.' + file.ext }}</div>
                <div class="path">{{ file.filepath }}</div>
                <div @click.stop="handleDelete(index + (fileListPage - 1) * 100)">
                  <i class="fas fa-trash-alt delete"></i>
                </div>
              </div>
            </div>
            <div class="row">
              <el-pagination
                small
                background
                layout="prev, pager, next"
                :pager-count="5"
                :page-size="100"
                :total="this.fileList.length"
                :current-page="fileListPage"
                :hide-on-single-page="true"
                @current-change="fileListPageChange">
              </el-pagination>
              <el-button type="primary" size="mini" @click="clearConfirm" class="bar-button">清空列表</el-button>
              <el-button type="primary" size="mini" @click="edit" class="bar-button">进入水印编辑器</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="fas fa-feather-alt"></i> 水印模板库</span>
        <div id="templates" class="tab-content">
          <div id="container" v-if="this.$store.state.watermark.templates.length != 0">
            <div
              v-for="(template, index) in this.$store.state.watermark.templates.slice(templateListPage * 6 - 6, templateListPage * 6)"
              :key="template.title"
              class="template-container">
              <div class="card">
                <div class="row">
                  <div class="subtitle">{{ template.title }}</div>
                </div>
                <v-clamp autoresize :max-lines="2" class="text">{{ template.text != '' ? template.text : '[图片]' }}</v-clamp>
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
          <div v-else id="empty-container">
            <div id="empty">
              <i class="fas fa-folder-open"></i>
              <div>尚无已保存的模板</div>
            </div>
          </div>
          <div class="row">
            <el-pagination
              v-if="this.$store.state.watermark.templates.length > 6"
              small
              background
              layout="prev, pager, next"
              :pager-count="5"
              :page-size="6"
              :total="this.$store.state.watermark.templates.length"
              :current-page="templateListPage"
              :hide-on-single-page="true"
              @current-change="templateListPageChange">
            </el-pagination>
            <el-button type="primary" size="mini" @click="importTemplate" class="bar-button">导入水印模板</el-button>
            <el-button type="primary" size="mini" @click="createTemplate" class="bar-button">创建水印模板</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ipcRenderer, clipboard } from 'electron'
import EXIF from 'exif-js'
import ReadDirectory from '../utils/ReadDirectory'
import CreateDirectory from '../utils/CreateDirectory'

const path = require('path')
const fs = require('fs')

export default {
  name: 'watermark',
  data () {
    return {
      fileList: [],
      fileSet: new Set(),
      errorList: [],
      fileListPage: 1,
      templateListPage: 1,
      childDirectoryIncluded: false,
      srcDirectory: '',
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
      this.fileSet = new Set()
      this.errorList = []
      this.fileListPage = 1
      this.childDirectoryIncluded = false
      this.srcDirectory = ''
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
      let formats = new Set(['jpg', 'jpeg', 'webp', 'png'])
      if (formats.has(ext) && !this.fileSet.has(file.raw.path)) {
        this.fileList.push({
          fullpath: file.raw.path,
          filepath: filepath,
          filename: filename,
          ext: ext
        })
        this.fileSet.add(file.raw.path)
      }
    },
    handleFolder() {
      if (this.srcDirectory == '') {
        this.$dialog({
          type: 'warning',
          text: '您还没有选择需要扫描的文件夹！'
        })
      } else {
        this.$dialog({
          title: '正在扫描文件夹',
          text: '扫描时间与您的文件数量及大小有关，请您耐心等待……',
          showConfirm: false
        }).then((dialog) => {
          let formats = new Set(['jpg', 'jpeg', 'webp', 'png'])
          let result = ReadDirectory(this.srcDirectory, this.childDirectoryIncluded, formats)
          this.fileList = result.fileList
          this.fileSet = new Set(result.fileList)
          this.errorList = result.errorList
          dialog.change({
            type: 'success',
            title: '完成',
            text: '已扫描完您选择的文件夹，共发现 ' + result.fileList.length + ' 个可处理的图片文件，接下来您可以继续执行下一步操作。',
            showConfirm: true
          })
          if (this.errorList.length != 0) {
            dialog.change({
              content: this.$createElement('div', null, [
                this.$createElement('div', null, [
                  this.$createElement('p', null, '扫描下列文件或文件夹的过程中出现错误，请您检查相关文件或文件夹的权限。这不影响您处理列表中显示的已导入文件。')
                ]),
                this.$createElement('div', null, this.errorList.map((file) => {
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
                  }, file)
                }))
              ]),
              confirmFunction: () => {
                this.errorList = []
              }
            })
          }
        })
      }
    },
    handleDelete(index) {
      if (this.fileListPage != 1) {
        if (this.fileListPage == Math.ceil(this.fileList.length / 100)) {
          if (this.fileList.length % 100 == 1) {
            this.fileListPage -= 1
          }
        }
      }
      this.fileSet.delete(this.fileList[index].fullpath)
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
    fileListPageChange(page) {
      this.fileListPage = page
    },
    templateListPageChange(page) {
      this.templateListPage = page
    },
    edit() {
      this.$store.dispatch('watermark/fileListAssign', this.fileList).then(() => {
        this.$router.replace('/watermark/editor?srcDirectory=' + this.srcDirectory)
      })
    },
    selectSourceFolder() {
      this.srcDirectory = ipcRenderer.sendSync('select-folder')
    },
    editTemplate(index) {
      this.$router.replace('/watermark/template?index=' + String(index))
    },
    shareTemplate(index) {
      this.$dialog({
        title: '正在处理',
        text: '即将完成，请稍候。',
        showConfirm: false
      }).then((dialog) => {
        let template = JSON.parse(JSON.stringify(this.$store.state.watermark.templates[index]))
        if (template.image) {
          template.imageData = fs.readFileSync(template.image).toString('base64')
          template.image = path.basename(template.image)
        }
        clipboard.writeText(btoa(encodeURI(JSON.stringify({
          type: 'watermarkTemplate',
          content: template
        }))))
        dialog.change({
          type: 'success',
          title: '成功',
          text: '已成功将水印模板复制到剪贴板。',
          showConfirm: true
        })
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
            if (this.templateListPage == Math.ceil(this.$store.state.watermark.templates.length / 6)) {
              if (this.$store.state.watermark.templates.length % 6 == 1) {
                this.templateListPage -= 1
              }
            }
          }
          let template = this.$store.state.watermark.templates[index]
          if (template.image) {
            try {
              fs.unlinkSync(template.image)
            } catch (error) {}
          }
          this.$store.dispatch('watermark/templateDelete', index)
        }
      })
    },
    importTemplate() {
      try {
        let template = JSON.parse(decodeURI(atob(clipboard.readText())))
        if (template.type != 'watermarkTemplate') {
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
                    title: '存在同名模板',
                    text: '您需要将新导入的模板重命名，才能将其保存。',
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
              if (template.image) {
                let imagepath = path.join(ipcRenderer.sendSync('app-data-path'), 'watermarkImages')
                if (!fs.existsSync(imagepath)) {
                  CreateDirectory(imagepath)
                }
                let ext = template.image.substring(template.image.lastIndexOf(".") + 1, template.image.length).toLowerCase()
                let filename = Math.random((new Date())).toString(36).slice(2).toUpperCase() + '.' + ext
                let fullpath = path.join(imagepath, filename)
                let buffer = new Buffer.from(template.imageData, 'base64')
                fs.writeFileSync(fullpath, buffer)
                template.image = fullpath
                delete template.imageData
              }
              this.$store.dispatch('watermark/templatePush', template)
              this.$dialog({
                type: 'success',
                title: '成功',
                text: '水印模板导入成功。'
              })
            }
          }
          checkName(template.title)
        }
      } catch (e) {
        this.$dialog({
          type: 'error',
          title: '导入失败',
          text: '未能从您的剪贴板中读取到水印模板信息！'
        })
      }
    },
    createTemplate() {
      this.$router.replace('/watermark/template?index=-1')
    }
  },
  mounted() {
    ipcRenderer.send('unmaximize')
  }
}
</script>

<style lang="scss">
#watermark {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  button {
    font-family: var(--main-font);
  }

  #header {
    padding-left: 20px;
    padding-right: 20px;
    box-sizing: border-box;
    flex-basis: 40px;
    background-color: var(--black-gray);
    display: flex;
    align-items: center;
    z-index: 3000;
    -webkit-app-region: drag;

    #title {
      color: var(--white);
      font-size: 16px;
      flex-grow: 1;
    }

    .control-button {
      -webkit-app-region: no-drag;
      width: 20px;
      height: 20px;
      margin-left: 5px;
      margin-right: 5px;
      border-radius: 10px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;

      object {
        width: 50%;
        color: var(--white);
      }

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;
      }

      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        border-radius: 50%;
        transition: 0.2s;
      }

      &:hover::after {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }

    #minimize {
      background-color: var(--success-green);
    }

    #close {
      background-color: var(--warning-red);
    }
  }

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
    
    .row {
      width: 100%;
      flex-shrink: 0;
      margin-top: 10px;
      margin-bottom: 10px;
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
    
    .bar-button {
      width: 0;
      height: 28px;
      flex-grow: 1;
      box-sizing: border-box;
      border: none;
      padding-left: 0;
      padding-right: 0;
      margin-left: 5px;
      margin-right: 5px;
      
      &:first-child {
        margin-left: 0;
      }
      
      &:last-child {
        margin-right: 0;
      }
    }
    
    .wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
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
      
    #single {
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
    
    #multiple {
      flex-direction: column;
      
      .el-pagination {
        padding: 0;
        margin-right: 5px;
        
        li {
          min-width: 24px;
          height: 28px;
          line-height: 28px;
        }
        
        .btn-prev {
          width: 24px;
          height: 28px;
          line-height: 28px;
          margin-left: 0;
        }
        
        .btn-next {
          width: 24px;
          height: 28px;
          line-height: 28px;
          margin-right: 0;
        }
      }
      
      #file-list {
        width: 100%;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        background-color: var(--white-gray);
        box-sizing: border-box;
        border-radius: 6px;
        border-color: var(--light-gray);
        border-style: solid;
        border-width: 1px;
        overflow-y: auto;
        overflow-x: hidden;
        
        #empty {
          width: 100%;
          flex-grow: 1;
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
        
        .file {
          height: 28px;
          width: 100%;
          flex-shrink: 0;
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
            width: 50%;
            flex-shrink: 1;
            padding-right: 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            box-sizing: border-box;
          }
          
          .path {
            width: 50%;
            flex-shrink: 1;
            padding-right: 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            box-sizing: border-box;
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
      
    #templates {
      flex-direction: column;
      
      #container {
        width: 100%;
        height: 0;
        flex-grow: 1;
        display: flex;
        flex-wrap: wrap;
        
        .template-container {
          width: calc(100% / 3);
          height: 50%;
          box-sizing: border-box;
          padding: 10px;
          
          .card {
            width: 100%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 12px var(--card-shadow);
            transition: 0.2s;
              
            .subtitle {
              width: 100%;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            
            .actions {
              width: 100%;
              flex-grow: 1;
              align-items: flex-end;
              
              .action {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                font-size: 12px;
                width: 32px;
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
            }
            
            &:hover {
              transform: scale(1.05);
            }
          }
        }
      }
      
      #empty-container {
        width: 100%;
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        
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
      
      .el-pagination {
        padding: 0;
        margin-right: 10px;
        
        li {
          min-width: 24px;
          height: 28px;
          line-height: 28px;
        }
        
        .btn-prev {
          width: 24px;
          height: 28px;
          line-height: 28px;
          margin-left: 0;
        }
        
        .btn-next {
          width: 24px;
          height: 28px;
          line-height: 28px;
          margin-right: 0;
        }
      }
    }
  }
}
</style>
