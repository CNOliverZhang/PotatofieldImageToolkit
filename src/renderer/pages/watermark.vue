<template>
  <el-tabs type="card" tab-position="left" id="watermark" @tab-click="clear">
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-images"></i> 导入图片</span>
      <div id="single" class="tab-content">
        <el-upload
          id="upload-dragger"
          action=""
          class="interactable"
          drag
          multiple
          :auto-upload="false"
          :on-change="handleFile"
          :show-file-list="false"
          :class="this.$store.state.watermark.fileList.length != 0 ? 'half' : ''">
          <i class="fas fa-images"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击选择文件</em></div>
        </el-upload>
        <div v-if="this.$store.state.watermark.fileList.length != 0" id="file-list" class="interactable">
          <div id="list">
            <div
              v-for="(file, index) in this.$store.state.watermark.fileList"
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
            <el-button type="primary" size="mini" @click="clearConfirm" class="half-width-button interactable">清空列表</el-button>
            <el-button type="primary" size="mini" @click="edit" class="half-width-button interactable">进入水印编辑器</el-button>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-folder-open"></i> 选择文件夹</span>
      <div id="multiple" class="tab-content" v-if="this.$store.state.watermark.fileList.length == 0">
        <div id="controller">
          <div class="row">
            <div class="subtitle">请选择需要扫描的文件夹</div>
          </div>
          <div class="row">
            <el-switch
              v-model="childDirectoryIncluded"
              active-color="#2196F3"
              inactive-color="#2196F3"
              active-text="包含子目录"
              inactive-text="不包含子目录"
              class="interactable"></el-switch>
            <el-input disabled size="mini" v-model="srcDirectory" class="controller interactable">
              <el-button @click="selectSourceFolder" slot="prepend">选择</el-button>
            </el-input>
          </div>
          <div class="row">
            <el-button
              @click="handleFolder"
              type="primary"
              size="mini"
              class="interactable full-width-button">扫描文件夹</el-button>
          </div>
        </div>
        <div id="file-list" class="row interactable">
          <div id="empty">
            <i class="far fa-folder-open"></i>
            <div>未导入图片文件</div>
          </div>
        </div>
      </div>
      <div id="multiple" class="tab-content" v-else>
        <div class="row">
          <div class="subtitle">已导入的文件列表</div>
          <el-pagination
            class="interactable"
            small
            background
            layout="prev, pager, next, jumper"
            :page-size="100"
            :total="this.$store.state.watermark.fileList.length"
            :current-page="fileListPage"
            :hide-on-single-page="true"
            @current-change="fileListPageChange">
          </el-pagination>
        </div>
        <div id="file-list" class="interactable">
          <div v-for="(file, index) in this.$store.state.watermark.fileList.slice(fileListPage * 100 - 100, fileListPage * 100)" :key="file.fullpath" class="file" @click="preview(index)">
            <div class="filename">{{ file.filename + '.' + file.ext }}</div>
            <div class="path">{{ file.path }}</div>
            <div @click.stop="handleDelete(index)">
              <i class="fas fa-trash-alt delete"></i>
            </div>
          </div>
        </div>
        <div class="row">
          <el-button type="primary" size="mini" @click="clearConfirm" class="half-width-button interactable">清空列表</el-button>
          <el-button type="primary" size="mini" @click="edit" class="half-width-button interactable">进入水印编辑器</el-button>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-feather"></i> 水印模板库</span>
      <div id="templates" class="tab-content">
        
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
const ipcRenderer = require('electron').ipcRenderer
const ReadDirectory = require('../utils/readdirectory').ReadDirectory
const path = require('path')

export default {
  name: 'watermark',
  data () {
    return {
      errorList: [],
      fileListPage: 1,
      childDirectoryIncluded: false,
      srcDirectory: '',
      errorLog: null
    }
  },
  methods: {
    hide() {
      ipcRenderer.send('minimize')
    },
    close() {
      ipcRenderer.send('close')
      this.$store.dispatch('watermark/fileListEmpty')
      this.$destroy()
    },
    clear() {
      this.$store.dispatch('watermark/fileListEmpty')
      this.errorList = []
      this.fileListPage = 1
      this.childDirectoryIncluded = false
      this.srcDirectory = ''
      this.errorLog = null
    },
    clearConfirm() {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '将清除您已导入的图片文件，确定执行操作吗？',
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
      if (['jpg', 'jpeg', 'png'].indexOf(ext) != -1) {
        this.$store.dispatch('watermark/fileListPush', {
          fullpath: file.raw.path,
          filepath: filepath,
          filename: filename,
          ext: ext
        })
      } else {
        this.errorList.push(filename + '.' + ext)
        if (this.errorLog) {
          this.errorLog.change({
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
            }))
          })
        } else {
          this.errorLog = this.$dialog({
            type: 'warning',
            title: '部分文件导入失败',
            text: '下列文件导入失败，请您检查文件格式。但已导入的图片文件不受影响，您仍可以继续处理列表中显示的已导入文件。',
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
            confirmFunction: () => {
              this.errorList = []
              this.errorLog = null
            }
          })
        }
      }
    },
    handleFolder() {
      if (this.srcDirectory == '') {
        this.$dialog({
          type: 'warning',
          text: '您还没有选择需要扫描的文件夹！'
        })
        return
      }
      let dialog = this.$dialog({
        title: '正在扫描文件夹',
        text: '扫描时间与您的文件数量及大小有关，请您耐心等待……',
        showConfirm: false
      })
      let result = ReadDirectory(this.srcDirectory, this.childDirectoryIncluded)
      setTimeout(() => {
        this.$store.dispatch('watermark/fileListAssign', result.fileList)
        this.errorList = result.errorList
        dialog.change({
          type: 'success',
          title: '完成',
          text: '已扫描完您选择的文件夹，共发现 ' + this.$store.state.watermark.fileList.length + ' 个可处理的图片文件，接下来你可以继续执行下一步操作。',
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
      }, 500)
    },
    handleDelete(index) {
      this.$store.dispatch('watermark/fileListDelete', index + (this.fileListPage - 1) * 100)
    },
    preview(index) {
      this.$dialog({
        title: '图像预览',
        content: this.$createElement('img', {
          'attrs': {
            'src': this.$store.state.watermark.fileList[index + (this.fileListPage - 1) * 100].fullpath
          }
        })
      })
    },
    fileListPageChange(page) {
      this.fileListPage = page
    },
    clearErrorList() {
      this.errorList = []
    },
    edit() {
      ipcRenderer.send('open', {
        title: '水印编辑器',
        path: '#/watermark/editor?srcDirectory=' + this.srcDirectory,
        modal: true,
        height: 720,
        width: 1000
      })
    },
    selectSourceFolder() {
      this.srcDirectory = ipcRenderer.sendSync('select-folder')
    }
  }
}
</script>

<style lang="scss">
#watermark {
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
  
  .full-width-button {
    width: 100%;
  }
  
  .half-width-button {
    width: calc(50% - 5px);
  }
    
  #single {
    flex-direction: row;
    
    #upload-dragger {
      width: 100%;
      height: 100%;
      transition: 0.5s;
      
      &.half {
        width: calc(50% - 5px);
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
          
          svg {
            font-size: 40px;
            margin: 14px;
          }
        }
      }
    }
    
    #file-list {
      width: calc(50% - 5px);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
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
    }
  }
  
  #multiple {
    flex-direction: column;
    
    #controller {
      width: 100%;
      flex-shrink: 0;
    }
    
    #file-list {
      width: 100%;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      background-color: #F5F7FA;
      box-sizing: border-box;
      border-radius: 6px;
      border-color: #DCDFE6;
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
  }
    
  #templates {
    flex-direction: column;
    
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
}
</style>
