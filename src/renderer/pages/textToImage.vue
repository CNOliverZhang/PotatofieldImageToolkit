<template>
  <el-tabs type="card" tab-position="left" id="textToImage">
    <el-tab-pane>
      <span slot="label"><i class="fas fa-keyboard"></i> 输入内容</span>
      <div id="editor" class="tab-content">
        <div id="preview" v-html="content"></div>
        <div id="editor-panel">
          <ckeditor :editor="editor.editor" :config="editor.config" v-model="content"></ckeditor>
          <div class="row">
            <el-button type="primary" size="mini" @click="clear" class="bar-button">清空内容</el-button>
            <el-button type="primary" size="mini" @click="edit" class="bar-button">进入样式编辑器</el-button>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label"><i class="fas fa-file-alt"></i> 样式模板库</span>
      <div id="templates" class="tab-content">
        <div id="container" v-if="this.$store.state.textToImage.templates.length != 0">
          <div
            v-for="(template, index) in this.$store.state.textToImage.templates.slice(templateListPage * 6 - 6, templateListPage * 6)"
            :key="index"
            class="template-container">
            <el-card class="card">
              <div class="row">
                <div class="subtitle">{{ template.title }}</div>
              </div>
              <div class="text">外框宽度：{{ template.padding != 0 ? template.padding : '无外框' }}</div>
              <div class="text">背景颜色：
                <div
                  class="color-sample"
                  :style="{
                    'background-color': template.backgroundColor
                  }"></div>
              </div>
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
            </el-card>
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
            v-if="this.$store.state.textToImage.templates.length > 6"
           
            small
            background
            layout="prev, pager, next"
            :pager-count="5"
            :page-size="6"
            :total="this.$store.state.textToImage.templates.length"
            :current-page="templateListPage"
            :hide-on-single-page="true"
            @current-change="templateListPageChange">
          </el-pagination>
          <el-button type="primary" size="mini" @click="importTemplate" class="bar-button">导入样式模板</el-button>
          <el-button type="primary" size="mini" @click="createTemplate" class="bar-button">创建样式模板</el-button>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane disabled>
      <span slot="label" id="sidebar">
        <div id="tool-info">
          <i id="tool-logo" class="fas fa-file-alt"></i>
          <div class="text">富文本制图工具</div>
        </div>
        <div id="control-button-holder">
          <div class="control-button" @click="minimize">
            <i class="fas fa-angle-double-down"></i>
            <div>最小化</div>
          </div>
          <div class="control-button" @click="close">
            <span class="fas fa-sign-out-alt"></span>
            <div>退出</div>
          </div>
        </div>
      </span>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { ipcRenderer, clipboard } from 'electron'
import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import UploadAdapterPlugin from '../utils/EditorUploadAdapter'

const path = require('path')

export default {
  name: 'textToImage',
  data () {
    return {
      editor: {
        editor: ClassicEditor,
        config: {
          language: 'zh-cn',
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' }
            ]
          },
          image: {
            toolbar: []
          },
          toolbar: ['heading', 'imageUpload', 'bold', 'italic', 'blockQuote', 'bulletedList', 'numberedList', 'undo', 'redo'],
          extraPlugins: [UploadAdapterPlugin]
        }
      },
      content: '',
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
      this.content = ''
    },
    templateListPageChange(page) {
      this.templateListPage = page
    },
    edit() {
      if (this.content == '') {
        this.$dialog({
          type: 'warning',
          text: '请您输入内容！'
        })
      } else {
        this.$dialog({
          text: '请在编辑器中继续操作。',
          showConfirm: false
        }).then((dialog) => {
          this.$store.dispatch('textToImage/contentAssign', this.content).then(() => {
            ipcRenderer.send('open', {
              title: '样式编辑器',
              path: '#/textToImage/editor',
              modal: true,
              height: 800,
              width: 1000
            })
            ipcRenderer.once('modal-window-closed', () => {
              dialog.close()
            })
          })
        })
      }
    },
    editTemplate(index) {
      this.$dialog({
        text: '请在编辑器中继续操作。',
        showConfirm: false
      }).then((dialog) => {
        ipcRenderer.send('open', {
          title: '样式模板编辑器',
          path: '#/textToImage/template?index=' + String(index),
          modal: true,
          height: 800,
          width: 1000
        })
        ipcRenderer.once('modal-window-closed', () => {
          this.clear()
          dialog.close()
        })
      })
    },
    shareTemplate(index) {
      clipboard.writeText(btoa(encodeURI(JSON.stringify({
        type: 'textToImageTemplate',
        content: this.$store.state.textToImage.templates[index]
      }))))
      this.$dialog({
        type: 'success',
        title: '成功',
        text: '已成功将样式模板复制到剪贴板。'
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
            if (this.templateListPage == Math.ceil(this.$store.state.textToImage.templates.length / 6)) {
              if (this.$store.state.textToImage.templates.length % 6 == 1) {
                this.templateListPage -= 1
              }
            }
          }
          this.$store.dispatch('textToImage/templateDelete', index)
        }
      })
    },
    importTemplate() {
      try {
        let template = JSON.parse(decodeURI(atob(clipboard.readText())))
        if (template.type != 'textToImageTemplate') {
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
                    title: '存在同名模板',
                    text: '您需要将新导入的模板重命名，才能将其保存。',
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
                text: '样式模板导入成功。'
              })
            }
          }
          checkName(template.title)
        }
      } catch (e) {
        this.$dialog({
          type: 'error',
          title: '导入失败',
          text: '未能从您的剪贴板中读取到样式模板信息！'
        })
      }
    },
    createTemplate() {
      this.$dialog({
        text: '请在编辑器中继续操作。',
        showConfirm: false
      }).then((dialog) => {
        ipcRenderer.send('open', {
          title: '样式模板编辑器',
          path: '#/textToImage/template?index=-1',
          modal: true,
          height: 800,
          width: 1000
        })
        ipcRenderer.once('modal-window-closed', () => {
          this.clear()
          dialog.close()
        })
      })
    }
  }
}
</script>

<style lang="scss">
#textToImage {
  width: 100%;
  height: 100%;
  
  button {
    font-family: var(--main-font);
  }
  
  .el-tabs__header {
    margin-right: 0;
    
    .el-tabs__nav-scroll {
      background-color: var(--dark-gray);
      
      .el-tabs__nav {
        border: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        
        .el-tabs__item {
          width: 150px;
          height: 50px;
          line-height: 50px;
          color: var(--light-gray);
          text-align: center;
          border: 0;
          transition: 0.2s;
          
          #sidebar {
            width: 100%;
            
            @keyframes shine {
              0% {
                color: var(--light-gray)
              }
              25% {
                color: var(--light-gray)
              }
              50% {
                color: var(--main-color)
              }
              75% {
                color: var(--light-gray)
              }
              100% {
                color: var(--light-gray)
              }
            }
            
            #tool-info {
              display: flex;
              flex-direction: column;
              align-items: center;
              animation: shine 5s infinite;
              
              #tool-logo {
                font-size: 60px;
                margin: 20px;
              }
            }
            
            #control-button-holder {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 20px;
              box-sizing: border-box;
              
              .control-button {
                font-size: 12px;
                line-height: initial;
                cursor: pointer;
                transition: 0.2s;
                
                svg {
                  font-size: 20px;
                  margin: 5px;
                }
                
                &:hover {
                  color: var(--white);
                }
                
                &:active {
                  filter: brightness(0.9);
                }
              }
            }
          }
          
          &.is-active {
            background-color: var(--white);
            color: var(--main-color);
            cursor: default;
          }
          
          &.is-disabled {
            flex-grow: 1;
            padding: 0;
            display: flex;
            align-items: flex-end;
          }
          
          &:hover:not(.is-disabled):not(.is-active) {
            color: var(--white);
          }
          
          &:active:not(.is-disabled):not(.is-active) {
            filter: brightness(0.9);
          }
        }
      }
    }
  }
  
  .el-tabs__content {
    height: 100%;
    
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
        align-items: center;
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
    
  #editor {
    flex-direction: row;
    
    #preview {
      width: calc(50% - 5px);
      height: 100%;
      background-color: var(--black-gray);
      box-sizing: border-box;
      border-radius: 6px;
      padding: 10px;
      line-height: 1.5em;
      overflow-x: hidden;
      overflow-y: auto;
      color: var(--white);
      
      blockquote {
        margin: 0;
        padding-left: 10px;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        border-left-color: var(--light-gray);
        border-left-style: solid;
        border-left-width: 3px;
        box-sizing: border-box;
      }
      
      h2 {
        font-family: var(--main-font);
        font-size: 24px;
        letter-spacing: 0.3em;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        line-height: 1.8em;
        text-align: justify;
        color: var(--white)
      }
      
      h3 {
        font-family: var(--main-font);
        font-size: 18px;
        letter-spacing: 0.1em;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        line-height: 1.8em;
        text-align: justify;
        color: var(--white)
      }
      
      p {
        font-family: var(--main-font);
        font-size: 14px;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        line-height: 1.8em;
        text-indent: 2em;
        text-align: justify;
        color: var(--white)
      }
      
      ul {
        font-family: var(--main-font);
        font-size: 14px;
        padding-left: 2em;
        line-height: 1.8em;
        text-align: justify;
        color: var(--white)
        
        li {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
      }
      
      ol {
        font-family: var(--main-font);
        font-size: 14px;
        padding-left: 2em;
        line-height: 1.8em;
        text-align: justify;
        color: var(--white)
        
        li {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
      }
      
      figure {
        margin: 0;
        width: 100%;
        
        img {
          display: block;
          width: 100%;
          font-size: 12px;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        canvas {
          display: block;
          width: 100%;
          font-size: 12px;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        figcaption {
          font-family: var(--main-font);
          font-size: 12px;
          text-align: center;
          color: var(--gray);
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
    
    #editor-panel {
      width: calc(50% - 5px);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      
      .ck-editor {
        height: 0;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        
        .ck-editor__main {
          flex-grow: 1;
          overflow: hidden;
          
          .ck-editor__editable {
            height: 100%;
            box-sizing: border-box;
            transition: 0.2s;
            
            blockquote {
              font-style: normal;
            }
            
            &:hover {
              border-color: var(--main-color);
            }
            
            &:focus {
              border-color: var(--main-color);
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
        
        .ck-toolbar {
          background-color: var(--white);
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
          color: var(--dark-gray);
          
          .el-card__body {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            
            .subtitle {
              width: 100%;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            
            .text {
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
</style>
