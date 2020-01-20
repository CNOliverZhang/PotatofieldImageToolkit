<template>
  <el-tabs type="card" tab-position="left" id="watermark" @tab-click="clear">
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-images"></i> 导入图片</span>
      <div id="single" class="tab-content">
        <div class="upload-area interactable">
          <el-upload id="upload-dragger" drag action="" multiple :auto-upload="false" :on-change="handleFile"
            :show-file-list="false" :class="this.$store.state.watermark.fileList.length != 0 ? 'half' : ''">
            <i class="fas fa-images"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击选择文件</em></div>
          </el-upload>
          <div v-if="this.$store.state.watermark.fileList.length != 0" id="file-list">
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
            <div class="control-row">
              <el-button type="primary" size="mini" @click="clearConfirm" class="half-width-button interactable">清空列表</el-button>
              <el-button type="primary" size="mini" @click="edit" class="half-width-button interactable">进入水印编辑器</el-button>
            </div>
          </div>
        </div>
        <div class="control-row">
          <div class="subtitle">请选择存储位置</div>
        </div>
        <div class="control-row">
          <el-switch v-model="customDistDirectory" active-color="#2196F3" inactive-color="#2196F3" active-text="自定义路径"
            inactive-text="保存在原路径" class="interactable"></el-switch>
          <el-input disabled size="mini" v-model="distDirectory" v-if="customDistDirectory" class="controller interactable">
            <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
          </el-input>
        </div>
        <div class="control-row">
          <div class="subtitle">自定义保存设置</div>
        </div>
        <div class="control-row">
          <div class="text">保存的图片格式</div>
          <el-radio-group v-model="mimeType" class="interactable controller">
            <el-radio label="JPEG"></el-radio>
            <el-radio label="PNG"></el-radio>
            <el-radio label="保持原格式"></el-radio>
          </el-radio-group>
        </div>
        <div class="control-row">
          <div class="text">文件名后缀</div>
          <el-input size="mini" v-model="postPend" maxlength="12" class="interactable controller"></el-input>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-folder-open"></i> 选择文件夹</span>
      <div id="multiple" class="tab-content">
        <div v-if="this.$store.state.watermark.fileList.length == 0" class="control-row">
          <div class="subtitle">请选择需要扫描的文件夹</div>
        </div>
        <div v-else class="control-row">
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
            @current-change="pageChange">
          </el-pagination>
        </div>
        <div v-if="this.$store.state.watermark.fileList.length == 0" class="control-row">
          <el-switch v-model="childDirectoryIncluded" active-color="#2196F3" inactive-color="#2196F3" active-text="包含子目录"
            inactive-text="不包含子目录" class="interactable"></el-switch>
          <el-input disabled size="mini" v-model="srcDirectory" class="controller interactable">
            <el-button @click="selectSourceFolder" slot="prepend">选择</el-button>
          </el-input>
        </div>
        <el-button v-if="this.$store.state.watermark.fileList.length == 0" type="primary" size="mini" @click="handleFolder" class="interactable full-width-button">扫描文件夹</el-button>
        <div id="file-list" class="interactable">
          <div v-if="this.$store.state.watermark.fileList.length == 0" class="empty">
            <i class="far fa-folder-open"></i>
            <div>未导入图片文件</div>
          </div>
          <div v-else v-for="(file, index) in this.$store.state.watermark.fileList.slice(fileListPage * 100 - 100, fileListPage * 100)" :key="file.fullpath" class="file" @click="preview(index)">
            <div class="filename">{{ file.filename + '.' + file.ext }}</div>
            <div class="path">{{ file.path }}</div>
            <div @click.stop="handleDelete(index)">
              <i class="fas fa-trash-alt delete"></i>
            </div>
          </div>
        </div>
        <div v-if="this.$store.state.watermark.fileList.length != 0">
          <div class="control-row">
            <div class="subtitle">请选择存储位置</div>
          </div>
          <div class="control-row">
            <el-switch v-model="customDistDirectory" active-color="#2196F3" inactive-color="#2196F3" active-text="自定义路径"
              inactive-text="保存在原路径" class="interactable"></el-switch>
            <el-input disabled size="mini" v-model="distDirectory" v-if="customDistDirectory" class="controller interactable">
              <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
            </el-input>
          </div>
          <div class="control-row">
            <div class="subtitle">自定义保存设置</div>
          </div>
          <div class="control-row">
            <div class="text">保存的文件格式</div>
            <el-radio-group v-model="mimeType" class="interactable  controller">
              <el-radio label="JPEG"></el-radio>
              <el-radio label="PNG"></el-radio>
              <el-radio label="保持原格式"></el-radio>
            </el-radio-group>
          </div>
          <div class="control-row">
            <div class="text">文件名后缀</div>
            <el-input size="mini" v-model="postPend" maxlength="12" class="interactable controller"></el-input>
          </div>
          <div class="control-row" v-if="customDistDirectory">
            <div class="text">是否保持源文件夹目录结构</div>
            <el-switch v-model="keepDirectoryStructure" active-text="保持原目录结构" inactive-text="直接保存到目标文件夹" class="interactable controller"></el-switch>
          </div>
          <div class="control-row">
            <div class="subtitle">下一步操作</div>
          </div>
          <div class="control-row">
            <el-button type="primary" size="mini" @click="clearConfirm" class="half-width-button interactable">清空列表</el-button>
            <el-button type="primary" size="mini" @click="edit" class="half-width-button interactable">进入水印编辑器</el-button>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-feather"></i> 水印模板库</span>
      <div class="tab-content">内容</div>
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
      customDistDirectory: false,
      childDirectoryIncluded: false,
      distDirectory: '',
      srcDirectory: '',
      keepDirectoryStructure: false,
      mimeType: 'JPEG',
      postPend: '_watermarked',
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
      this.customDistDirectory = false
      this.childDirectoryIncluded = false
      this.distDirectory = ''
      this.srcDirectory = ''
      this.keepDirectoryStructure = false
      this.mimeType = 'JPEG'
      this.postPend = '_watermarked'
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
    pageChange(page) {
      this.fileListPage = page
    },
    clearErrorList() {
      this.errorList = []
      this.errorListTitle = ""
    },
    edit() {
      if (this.customDistDirectory && this.distDirectory == '') {
        this.$dialog({
          type: 'warning',
          text: '您还没有选择保存的路径！'
        })
        return
      }
      if (this.postPend == '' && this.customDistDirectory == false) {
        this.$dialog({
          type: 'warning',
          title: '警告',
          text: '您选择了将处理后的图片储存在原图片路径且未设置输出文件的后缀，这可能导致原图被覆盖！您确定要继续吗？',
          showCancel: true,
          confirmFunction: () => {
            this.openEditor()
          }
        })
      } else {
        this.openEditor()
      }
    },
    openEditor() {
      this.$store.dispatch('watermark/configAssign', {
        customDistDirectory: this.customDistDirectory,
        distDirectory: this.distDirectory,
        srcDirectory: this.srcDirectory,
        keepDirectoryStructure: this.keepDirectoryStructure,
        mimeType: this.mimeType,
        postPend: this.postPend,
      })
      ipcRenderer.send('open', {
        title: '水印编辑器',
        path: '#/watermark/editor',
        modal: true,
        height: 700,
        width: 1000
      })
    },
    selectSaveFolder() {
      this.distDirectory = ipcRenderer.sendSync('select-folder')
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
  
  .tab-content {
    padding: 20px;
  }
  
  .control-row {
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
    height: 28px;
    font-size: 14px;
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
    
  #single {
    
    .upload-area {
      width: 100%;
      height: 220px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      
      #upload-dragger {
        width: 100%;
        height: 100%;
        transition: 0.5s;
        
        &.half {
          width: 49%;
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
              margin: 15px;
            }
          }
        }
      }
      
      #file-list {
        width: 49%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        #list {
          width: 100%;
          height: 200px;
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
  }
  
  #multiple {
    
    #file-list {
      width: 100%;
      height: 120px;
      background-color: #F5F7FA;
      margin-top: 10px;
      margin-bottom: 10px;
      box-sizing: border-box;
      border-radius: 6px;
      border-color: #DCDFE6;
      border-style: solid;
      border-width: 1px;
      overflow-y: auto;
      overflow-x: hidden;
      
      .empty {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        
        svg {
          font-size: 40px;
          margin: 15px;
        }
      }
      
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
    
  .full-width-button {
    width: 100%;
  }
  
  .half-width-button {
    width: 48%;
  }
}
</style>
