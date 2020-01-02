<template>
  <el-tabs type="card" tab-position="left" id="watermark" @tab-click="clear">
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-images"></i> 导入图片</span>
      <div id="single" class="tab-content">
        <div class="upload-area interactable">
          <el-upload class="upload-dragger" drag action="" multiple :auto-upload="false" :on-change="handleFile"
            :show-file-list="false" :class="fileList.length != 0 ? 'half' : ''">
            <i class="fas fa-images"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击选择文件</em></div>
          </el-upload>
          <div v-if="fileList.length != 0" class="file-list">
            <div class="list">
              <div v-for="(file, index) in fileList" :key="file.fullpath" class="file">
                <div class="filename">{{ file.name + '.' + file.ext }}</div>
                <div @click="handleDelete(index)">
                  <i class="fas fa-trash-alt delete"></i>
                </div>
              </div>
            </div>
            <el-button type="primary" size="mini" @click="edit" class="interactable">进入水印编辑器</el-button>
          </div>
        </div>
        <div class="control-row">
          <div class="subtitle">请选择存储位置</div>
          <div class="space"></div>
          <div v-if="customLocation" class="subtext">处理后的图片将被保存在您选择的文件夹并保持目录结构不变</div>
          <div v-else class="subtext">处理后的图片将存储在原来的位置</div>
        </div>
        <div class="control-row">
          <el-switch v-model="customLocation" active-color="#2196F3" inactive-color="#2196F3" active-text="自定义路径"
            inactive-text="保存在原路径" class="interactable"></el-switch>
          <div class="space"></div>
          <el-input disabled size="mini" v-model="saveLocation" v-if="customLocation" class="location interactable">
            <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
          </el-input>
        </div>
        <div class="control-row">
          <div class="subtitle">请选择保存的格式</div>
          <div class="space"></div>
          <div v-if="mimeType == 'JPG'" class="subtext">JPG格式能够在最小的体积下保证较高的画质</div>
          <div v-if="mimeType == 'PNG'" class="subtext">PNG格式使用无损压缩达到较小的体积和最好的画质</div>
        </div>
        <div class="control-row">
          <el-radio-group v-model="mimeType" class="interactable">
            <el-radio label="JPG"></el-radio>
            <el-radio label="PNG"></el-radio>
          </el-radio-group>
        </div>
        <div class="control-row">
          <div class="subtitle">请输入文件后缀</div>
          <div class="space"></div>
          <div class="subtext">名为“example.jpg”的文件将被重命名为“example{{ postPend }}.{{ mimeType.toLowerCase() }}”</div>
        </div>
        <div class="control-row">
          <el-input size="mini" v-model="postPend" maxlength="12" class="interactable"></el-input>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-folder-open"></i> 选择文件夹</span>
      <div id="multiple" class="tab-content">
        <div v-if="fileList.length == 0" class="subtitle">请选择读取的文件夹</div>
        <div v-else class="control-row">
          <div class="subtitle">已读取的文件列表</div>
          <div class="space"></div>
          <el-pagination
            class="interactable"
            small
            background
            layout="prev, pager, next"
            :page-size="100"
            :total="fileList.length"
            :current-page="fileListPage"
            :hide-on-single-page="true"
            @current-change="pageChange">
          </el-pagination>
        </div>
        <div v-if="fileList.length == 0" class="control-row">
          <el-switch v-model="childFolderIncluded" active-color="#2196F3" inactive-color="#2196F3" active-text="包含子目录"
            inactive-text="不包含子目录" class="interactable"></el-switch>
          <div class="space"></div>
          <el-input disabled size="mini" v-model="sourceLocation" class="location interactable">
            <el-button @click="selectSourceFolder" slot="prepend">选择</el-button>
          </el-input>
        </div>
        <el-button v-if="fileList.length == 0" type="primary" size="mini" @click="handleFolder" class="interactable full-width-button">读取文件夹</el-button>
        <div class="file-list interactable">
          <div v-if="fileList.length == 0" class="empty">
            <i class="far fa-folder-open"></i>
            <div>未读取文件</div>
          </div>
          <div v-else v-for="(file, index) in fileList.slice(fileListPage * 100 - 100, fileListPage * 100)" :key="file.fullpath" class="file">
            <div class="filename">{{ file.name + '.' + file.ext }}</div>
            <div class="path">{{ file.path }}</div>
            <div class="controller" @click="handleDelete(index)">
              <i class="fas fa-trash-alt delete"></i>
            </div>
          </div>
        </div>
        <div v-if="fileList.length != 0">
          <div class="control-row">
            <div class="subtitle">请选择存储位置</div>
            <div class="space"></div>
            <div v-if="customLocation" class="subtext">处理后的图片将被保存在您选择的文件夹，原目录结构将被舍弃</div>
            <div v-else class="subtext">处理后的图片将存储在原来的位置，并保持目录结构不变</div>
          </div>
          <div class="control-row">
            <el-switch v-model="customLocation" active-color="#2196F3" inactive-color="#2196F3" active-text="自定义路径"
              inactive-text="保存在原路径" class="interactable"></el-switch>
            <div class="space"></div>
            <el-input disabled size="mini" v-model="saveLocation" v-if="customLocation" class="location interactable">
              <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
            </el-input>
          </div>
          <div class="control-row">
            <div class="subtitle">请选择保存的格式</div>
            <div class="space"></div>
            <div v-if="mimeType == 'JPG'" class="subtext">JPG格式能够在最小的体积下保证较高的画质</div>
            <div v-if="mimeType == 'PNG'" class="subtext">PNG格式使用无损压缩达到较小的体积和最好的画质</div>
          </div>
          <div class="control-row">
            <el-radio-group v-model="mimeType" class="interactable">
              <el-radio label="JPG"></el-radio>
              <el-radio label="PNG"></el-radio>
            </el-radio-group>
          </div>
          <div class="control-row">
            <div class="subtitle">请输入文件后缀</div>
            <div class="space"></div>
            <div class="subtext">名为“example.jpg”的文件将被重命名为“example{{ postPend }}.{{ mimeType.toLowerCase() }}”</div>
          </div>
          <div class="control-row">
            <el-input size="mini" v-model="postPend" maxlength="12" class="interactable"></el-input>
          </div>
          <div class="control-row">
            <div class="subtitle">下一步操作</div>
            <div class="space"></div>
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
const path = require('path')
const fs = require('fs')

export default {
  name: 'watermark',
  data () {
    return {
      fileList: [],
      errorList: [],
      fileListPage: 0,
      customLocation: false,
      childFolderIncluded: false,
      saveLocation: '',
      sourceLocation: '',
      mimeType: 'JPG',
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
    },
    clear() {
      this.fileList = []
      this.errorList = []
      this.fileListPage = 1
      this.customLocation = false
      this.childFolderIncluded = false
      this.saveLocation = ''
      this.sourceLocation = ''
      this.mimeType = 'JPG'
      this.postPend = '_watermarked'
      this.errorLog = null
    },
    clearConfirm() {
      let that = this
      that.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '将清除您已读取的图片，确定执行操作吗？',
        showCancel: true,
        confirmFunction: function () {
          that.clear()
        }
      })
    },
    handleFile(file) {
      let that =  this
      let ext = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length).toLowerCase()
      let name = file.name.substring(0, file.name.lastIndexOf("."))
      let path = file.raw.path.substring(0, file.raw.path.lastIndexOf("\\"))
      if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) != -1) {
        that.fileList.push({
          fullpath: file.raw.path,
          path: path,
          name: name,
          ext: ext
        })
      } else {
        that.errorList.push(name + '.' + ext)
        if (that.errorLog) {
          that.errorLog.change({
            content: that.$createElement('div', null, that.errorList.map((file) => {
              return that.$createElement('p', {
                style: {
                   lineHeight: '24px',
                   fontSize: '12px',
                   width: '100%',
                   overflow: 'hidden',
                   textOverflow: 'ellipsis',
                   whiteSpace: 'nowrap',
                   textIndent: '0'
                }
              }, file)
            }))
          })
        } else {
          that.errorLog = that.$dialog({
            type: 'error',
            title: '错误',
            text: '下列文件格式的不受支持，请您检查文件格式。但已导入的图片文件不受影响，您仍可以处理列表中显示的已导入文件。',
            content: that.$createElement('div', null, that.errorList.map((file) => {
              return that.$createElement('p', {
                style: {
                  lineHeight: '24px',
                  fontSize: '12px',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textIndent: '0'
               }
              }, file)
            })),
            confirmFunction: function() {
              that.errorList = []
              that.errorDialog = null
            }
          })
        }
      }
    },
    handleFolder() {
      let that = this
      if (that.sourceLocation == '') {
        that.$dialog({
          type: 'warning',
          text: '您还没有选择需要读取的文件夹！'
        })
        return
      }
      if (that.childFolderIncluded) {
        let dialog = that.$dialog({
          title: '正在扫描文件夹',
          text: '扫描时间与您的文件数量及大小有关，请您耐心等待……',
          showConfirm: false
        })
        let dirList = [];
        (function traverse(directory, dirList) {
          fs.readdir(directory, function(e, files) {
            if (e) {
              that.$dialog({
                type: 'error',
                title: '错误',
                text: '无法读取文件夹“' + directory + '”，请检查文件夹权限。',
              })
            } else {
              for (let i = 0; i < files.length; i++) {
                let filename = files[i]
                try {
                  let filepath = path.join(directory, filename)
                  let stats = fs.statSync(filepath)
                  if (stats.isFile()) {
                    let ext = filename.substring(filename.lastIndexOf(".") + 1, filename.length).toLowerCase()
                    let name = filename.substring(0, filename.lastIndexOf("."))
                    let path = directory
                    if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) != -1) {
                      that.fileList.push({
                        fullpath: filepath,
                        path: path,
                        name: name,
                        ext: ext
                      })
                      dialog.change({
                        text: '正在扫描文件夹“' + path + '”，已读取 ' + that.fileList.length + ' 个可处理的图片文件。'
                      })
                    }
                  } else {
                    dirList.push(filepath)
                  }
                } catch(e) {
                }
              }
              if (dirList.length != 0) {
                traverse(dirList.pop(), dirList)
              } else {
                dialog.change({
                  type: 'success',
                  title: '完成',
                  text: '已成功读取您选择的文件夹及其子文件夹，共读取 ' + that.fileList.length + ' 个可处理的图片文件。',
                  showConfirm: true
                })
              }
            }
          })
        })(that.sourceLocation, dirList);
      } else {
        let dialog = that.$dialog({
          title: '正在扫描文件夹',
          text: '扫描时间与您的文件数量及大小有关，请您耐心等待……',
          showConfirm: false
        })
        fs.readdir(that.sourceLocation, function(e, files) {
          if (e) {
            that.$dialog({
              type: 'error',
              title: '错误',
              text: '无法读取文件夹“' + that.sourceLocation + '”，请检查文件夹权限。',
            })
          } else {
            for (let i = 0; i < files.length; i++) {
              let filename = files[i]
              let filepath = path.join(that.sourceLocation, filename)
              let stats = fs.statSync(filepath)
              if (stats.isFile()) {
                let ext = filename.substring(filename.lastIndexOf(".") + 1, filename.length).toLowerCase()
                let name = filename.substring(0, filename.lastIndexOf("."))
                let path = that.sourceLocation
                if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) != -1) {
                  that.fileList.push({
                    fullpath: filepath,
                    path: path,
                    name: name,
                    ext: ext
                  })
                  dialog.change({
                    text: '正在扫描文件夹，已读取 ' + that.fileList.length + ' 个可处理的图片文件。'
                  })
                }
              }
            }
            dialog.change({
              type: 'success',
              title: '完成',
              text: '已成功读取您选择的文件夹，共读取 ' + that.fileList.length + ' 个可处理的图片文件。',
              showConfirm: true
            })
          }
        })
      }
    },
    handleDelete(index) {
      this.fileList.splice(index + (this.fileListPage - 1) * 100, 1)
    },
    pageChange(page) {
      this.fileListPage = page
    },
    clearErrorList() {
      this.errorList = []
      this.errorListTitle = ""
    },
    edit() {
      if (this.postPend == '' && this.customLocation == false) {
        this.$dialog({
          type: 'warning',
          title: '警告',
          text: '您选择了将处理后的图片储存在原图片路径且未设置输出文件的后缀，这可能导致原图被覆盖！您确定要继续吗？',
          showCancel: true,
          confirmFunction: function () {
            ipcRenderer.send('open', {
              title: '水印编辑器',
              path: '/watermark/editor',
              modal: true
            })
          }
        })
      } else {
        ipcRenderer.send('open', {
          title: '水印编辑器',
          path: '/watermark/editor',
          modal: true
        })
      }
    },
    selectSaveFolder() {
      this.saveLocation = ipcRenderer.sendSync('select-folder')
    },
    selectSourceFolder() {
      this.sourceLocation = ipcRenderer.sendSync('select-folder')
    }
  }
}
</script>

<style lang="scss">
#watermark {
  width: 100%;
  height: 100%;
  
  button {
    font-family: "SourceHanSansSC";
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
    
  #single {
    
    .upload-area {
      width: 100%;
      height: 220px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      
      .upload-dragger {
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
      
      .file-list {
        width: 49%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        .list {
          width: 100%;
          height: 200px;
          background-color: #F5F7FA;
          margin-bottom: 10px;
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
    
    .file-list {
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
          width: 40%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          padding-right: 10px;
          box-sizing: border-box;
        }
        
        .path {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          flex-grow: 1;
          padding-right: 10px;
          box-sizing: border-box;
        }
        
        .controller {
          width: 5%;
          
          .delete {
            color: #DCDFE6;
            cursor: pointer;
            transition: 0.2s;
            
            &:hover {
              color: #F56C6C;
            }
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
    
    .full-width-button {
      width: 100%;
    }
    
    .half-width-button {
      width: 48%;
    }
  }
  
  .control-row {
    height: 28px;
    font-size: 14px;
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    
    .space {
      flex-grow: 1;
    }
    
    .location {
      width: 60%;
    }
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
