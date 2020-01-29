<template>
  <el-tabs type="card" tab-position="left" id="textToImage" @tab-click="clear">
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-file-alt"></i> 输入内容</span>
      <div id="editor" class="tab-content">
        <div v-html="content"></div>
        <div id="controller" class="interactable">
          <ckeditor :editor="editor.editor" :config="editor.config" v-model="content"></ckeditor>
          <div class="row">
            <el-button type="primary" size="mini" @click="clear" class="half-width-button interactable">清空内容</el-button>
            <el-button type="primary" size="mini" @click="edit" class="half-width-button interactable">进入样式编辑器</el-button>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-palette"></i> 样式模板库</span>
      <div id="templates" class="tab-content">
        <div id="container" v-if="this.$store.state.textToImage.templates.length != 0">
          <div
            v-for="(template, index) in this.$store.state.textToImage.templates.slice(templateListPage * 6 - 6, templateListPage * 6)"
            :key="index"
            class="template-container">
            <el-card class="card interactable">
              <div class="row">
                <div class="subtitle">{{ template.title }}</div>
              </div>
              <div class="text">外框宽度：{{ template.padding != 0 ? template.padding : '无外框' }}</div>
              <div class="text">图片间距：{{ template.spacing != 0 ? template.spacing : '无间距' }}</div>
              <v-clamp autoresize :max-lines="2" class="text">{{ template.text }}</v-clamp>
              <div class="row control-buttons">
                <div class="control-button interactable" @click="editTemplate(index)">
                  <span class="fa fa-edit"></span>
                  <div>编辑</div>
                </div>
                <div class="control-button interactable" @click="shareTemplate(index)">
                  <span class="fa fa-share-alt"></span>
                  <div>分享</div>
                </div>
                <div class="control-button interactable" @click="deleteTemplate(index)">
                  <span class="fa fa-trash-alt"></span>
                  <div>删除</div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
        <div v-else id="empty-container">
          <div id="empty">
            <i class="far fa-folder-open"></i>
            <div>尚无已保存的模板</div>
          </div>
        </div>
        <div class="row">
          <el-pagination
            v-if="this.$store.state.textToImage.templates.length > 6"
            class="interactable"
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
          <el-button type="primary" size="mini" @click="importTemplate" class="half-width-button interactable">导入样式模板</el-button>
          <el-button type="primary" size="mini" @click="createTemplate" class="half-width-button interactable">创建样式模板</el-button>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane disabled>
      <span slot="label" id="control-button-holder">
        <div class="control-button interactable" @click="hide">
          <i class="fas fa-angle-double-down"></i>
          <div>最小化</div>
        </div>
        <div class="control-button interactable" @click="close">
          <span class="fas fa-sign-out-alt"></span>
          <div>退出</div>
        </div>
      </span>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
const { ipcRenderer, clipboard } = require('electron')
const path = require('path')

import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn'

export default {
  name: 'textToImage',
  data () {
    return {
      editor: {
        editor: ClassicEditor,
        uiColor: '#FFFFFF',
        config: {
          language: 'zh-cn',
          toolbar: ['heading', 'imageUpload', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo']
        }
      },
      content: '',
      templateListPage: 1,
      templateTitle: ''
    }
  },
  methods: {
    hide() {
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
      ipcRenderer.send('open', {
        title: '拼图编辑器',
        path: '#/textToImage/editor',
        modal: true,
        height: 720,
        width: 1000
      })
    },
    editTemplate(index) {
      ipcRenderer.send('open', {
        title: '样式模板编辑器',
        path: '#/textToImage/template?index=' + String(index + (this.templateListPage - 1) * 6),
        modal: true,
        height: 600,
        width: 1000
      })
    },
    shareTemplate(index) {
      clipboard.writeText(btoa(encodeURI(JSON.stringify({
        type: 'textToImageTemplate',
        content: this.$store.state.text.templates[index]
      }))))
      this.$dialog({
        type: 'success',
        title: '成功',
        text: '已成功将样式模板复制到剪贴板。'
      })
    },
    deleteTemplate(index) {
      index = index + (this.templateListPage - 1) * 6
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
                text: '请输入模板标题，否则无法保存该模板。',
                showCancel: true,
                confirmFunction: () => {
                  this.$dialog({
                    title: '请输入拼图模板标题',
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
              for (let i = 0; i < this.$store.state.text.templates.length; i++) {
                if (title == this.$store.state.text.templates[i].title) {
                  this.$dialog({
                    type: 'warning',
                    title: '存在同名模板',
                    text: '您需要将新导入的模板重命名，才能将其保存。',
                    showCancel: true,
                    confirmFunction: () => {
                      this.$dialog({
                        title: '请输入拼图模板标题',
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
              this.$store.dispatch('text/templatePush', template)
              this.$dialog({
                type: 'success',
                title: '成功',
                text: '拼图模板导入成功。'
              })
            }
          }
          checkName(template.title)
        }
      } catch (e) {
        this.$dialog({
          type: 'error',
          title: '导入失败',
          text: '未能从您的剪贴板中读取到拼图模板信息！'
        })
      }
    },
    createTemplate() {
      ipcRenderer.send('open', {
        title: '拼图模板编辑器',
        path: '#/textToImage/template?index=-1',
        modal: true,
        height: 600,
        width: 1000
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
    font-family: "NotoSansSC";
  }
  
  .el-tabs__header {
    margin-right: 0;
    
    .el-tabs__nav-scroll {
      background-color: #606266;
      
      .el-tabs__nav {
        border: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        
        .el-tabs__item {
          width: 150px;
          height: 50px;
          line-height: 50px;
          color: #DCDFE6;
          text-align: center;
          border: 0;
          transition: 0.2s;
          
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
                color: #FFFFFF;
              }
              
              &:active {
                filter: brightness(0.9);
              }
            }
          }
          
          &.is-active {
            background-color: #FFFFFF;
            color: #2196F3;
            cursor: default;
          }
          
          &.is-disabled {
            flex-grow: 1;
            padding: 0;
            display: flex;
            align-items: flex-end;
          }
          
          &:hover:not(.is-disabled):not(.is-active) {
            color: #FFFFFF;
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
  }
  
  .el-tab-pane {
    width: 100%;
    height: 100%;
  }
  
  .tab-content {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    
    .controller {
      width: 60%;
    }
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .half-width-button {
    width: calc(50% - 5px);
  }
    
  #editor {
    flex-direction: row;
    
    #controller {
      width: calc(50% - 5px);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .ck-editor {
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
            
            &:hover {
              border-color: #2196F3;
            }
            
            &:focus {
              border-color: #2196F3;
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
        }
      }
    }
  }
    
  #templates {
    flex-direction: column;
    
    #container {
      width: 100%;
      flex-grow: 1;
      display: flex;
      flex-wrap: wrap;
      
      .template-container {
        width: calc(100%/3);
        height: 210px;
        box-sizing: border-box;
        padding: 10px;
        
        .card {
          width: 100%;
          height: 100%;
          color: #606266;
          
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
            
            .control-buttons {
              width: 100%;
              flex-grow: 1;
              align-items: flex-end;
              
              .control-button {
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
                  color: #2196F3;
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
