<template>
  <el-tabs type="card" tab-position="left" id="watermark" @tab-click="clear">
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-images"></i> 导入图片</span>
      <div id="single" class="tab-content">
        <div class="upload-area interactable">
          <el-upload class="upload-dragger" drag action="" multiple :auto-upload="false" :on-change="handleFile"
            :show-file-list="false" :class="this.$store.state.watermark.fileList.length != 0 ? 'half' : ''">
            <i class="fas fa-images"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击选择文件</em></div>
          </el-upload>
          <div v-if="this.$store.state.watermark.fileList.length != 0" class="file-list">
            <div class="list">
              <div
                v-for="(file, index) in this.$store.state.watermark.fileList"
                :key="file.fullpath"
                class="file"
                @click="preview(index)">
                <div class="filename">{{ file.name + '.' + file.ext }}</div>
                <div @click.stop="handleDelete(index)">
                  <i class="fas fa-trash-alt delete"></i>
                </div>
              </div>
            </div>
            <div class="row control-row">
              <el-button type="primary" size="mini" @click="clearConfirm" class="half-width-button interactable">清空列表</el-button>
              <el-button type="primary" size="mini" @click="edit" class="half-width-button interactable">进入水印编辑器</el-button>
            </div>
          </div>
        </div>
        <div class="row control-row">
          <div class="subtitle">请选择存储位置</div>
          <div class="flex-space"></div>
          <div v-if="customLocation" class="subtext">处理后的图片将被保存在您选择的文件夹并保持目录结构不变</div>
          <div v-else class="subtext">处理后的图片将存储在原来的位置</div>
        </div>
        <div class="row control-row">
          <el-switch v-model="customLocation" active-color="#2196F3" inactive-color="#2196F3" active-text="自定义路径"
            inactive-text="保存在原路径" class="interactable"></el-switch>
          <div class="flex-space"></div>
          <el-input disabled size="mini" v-model="saveLocation" v-if="customLocation" class="location-input interactable">
            <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
          </el-input>
        </div>
        <div class="row control-row">
          <div class="subtitle">请选择保存的格式</div>
          <div class="flex-space"></div>
          <div v-if="mimeType == 'JPEG'" class="subtext">JPEG格式能够在最小的体积下保证较高的画质</div>
          <div v-if="mimeType == 'PNG'" class="subtext">PNG格式使用无损压缩达到较小的体积和最好的画质</div>
        </div>
        <div class="row control-row">
          <el-radio-group v-model="mimeType" class="interactable">
            <el-radio label="JPEG"></el-radio>
            <el-radio label="PNG"></el-radio>
          </el-radio-group>
        </div>
        <div class="row control-row">
          <div class="subtitle">请输入文件后缀</div>
          <div class="flex-space"></div>
          <div class="subtext">名为“example.ext”的文件将被重命名为“example{{ postPend }}.{{ mimeType.toLowerCase() }}”</div>
        </div>
        <div class="row control-row">
          <el-input size="mini" v-model="postPend" maxlength="12" class="interactable"></el-input>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-folder-open"></i> 选择文件夹</span>
      <div id="multiple" class="tab-content">
        <div v-if="this.$store.state.watermark.fileList.length == 0" class="row">
          <div class="subtitle">请选择读取的文件夹</div>
        </div>
        <div v-else class="row control-row">
          <div class="subtitle">已读取的文件列表</div>
          <div class="flex-space"></div>
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
        <div v-if="this.$store.state.watermark.fileList.length == 0" class="row control-row">
          <el-switch v-model="childFolderIncluded" active-color="#2196F3" inactive-color="#2196F3" active-text="包含子目录"
            inactive-text="不包含子目录" class="interactable"></el-switch>
          <div class="flex-space"></div>
          <el-input disabled size="mini" v-model="sourceLocation" class="location-input interactable">
            <el-button @click="selectSourceFolder" slot="prepend">选择</el-button>
          </el-input>
        </div>
        <el-button v-if="this.$store.state.watermark.fileList.length == 0" type="primary" size="mini" @click="handleFolder" class="interactable full-width-button">读取文件夹</el-button>
        <div class="file-list interactable">
          <div v-if="this.$store.state.watermark.fileList.length == 0" class="empty">
            <i class="far fa-folder-open"></i>
            <div>未读取文件</div>
          </div>
          <div v-else v-for="(file, index) in this.$store.state.watermark.fileList.slice(fileListPage * 100 - 100, fileListPage * 100)" :key="file.fullpath" class="file" @click="preview(index)">
            <div class="filename">{{ file.name + '.' + file.ext }}</div>
            <div class="path">{{ file.path }}</div>
            <div @click.stop="handleDelete(index)">
              <i class="fas fa-trash-alt delete"></i>
            </div>
          </div>
        </div>
        <div v-if="this.$store.state.watermark.fileList.length != 0">
          <div class="row control-row">
            <div class="subtitle">请选择存储位置</div>
            <div class="flex-space"></div>
            <div v-if="customLocation" class="subtext">处理后的图片将被保存在您选择的文件夹并保持目录结构不变</div>
            <div v-else class="subtext">处理后的图片将存储在原来的位置</div>
          </div>
          <div class="row control-row">
            <el-switch v-model="customLocation" active-color="#2196F3" inactive-color="#2196F3" active-text="自定义路径"
              inactive-text="保存在原路径" class="interactable"></el-switch>
            <div class="flex-space"></div>
            <el-input disabled size="mini" v-model="saveLocation" v-if="customLocation" class="location-input interactable">
              <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
            </el-input>
          </div>
          <div class="row control-row">
            <div class="subtitle">请选择保存的格式</div>
            <div class="flex-space"></div>
            <div v-if="mimeType == 'JPEG'" class="subtext">JPEG格式能够在最小的体积下保证较高的画质</div>
            <div v-if="mimeType == 'PNG'" class="subtext">PNG格式使用无损压缩达到较小的体积和最好的画质</div>
          </div>
          <div class="row control-row">
            <el-radio-group v-model="mimeType" class="interactable">
              <el-radio label="JPEG"></el-radio>
              <el-radio label="PNG"></el-radio>
            </el-radio-group>
          </div>
          <div class="row control-row">
            <div class="subtitle">请输入文件后缀</div>
            <div class="flex-space"></div>
            <div class="subtext">名为“example.ext”的文件将被重命名为“example{{ postPend }}.{{ mimeType.toLowerCase() }}”</div>
          </div>
          <div class="row control-row">
            <el-input size="mini" v-model="postPend" maxlength="12" class="interactable"></el-input>
          </div>
          <div class="row control-row">
            <div class="subtitle">下一步操作</div>
            <div class="flex-space"></div>
          </div>
          <div class="row control-row">
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

export default {
  name: 'watermark',
  data () {
    return {
      errorList: [],
      fileListPage: 1,
      customLocation: false,
      childFolderIncluded: false,
      saveLocation: '',
      sourceLocation: '',
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
      this.$store.commit('watermark/empty')
      this.$destroy()
    },
    clear() {
      this.$store.commit('watermark/empty')
      this.errorList = []
      this.fileListPage = 1
      this.customLocation = false
      this.childFolderIncluded = false
      this.saveLocation = ''
      this.sourceLocation = ''
      this.mimeType = 'JPEG'
      this.postPend = '_watermarked'
      this.errorLog = null
    },
    clearConfirm() {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '将清除您已读取的图片，确定执行操作吗？',
        showCancel: true,
        confirmFunction: () => {
          this.clear()
        }
      })
    },
    handleFile(file) {
      let ext = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length).toLowerCase()
      let name = file.name.substring(0, file.name.lastIndexOf("."))
      let path = file.raw.path.substring(0, file.raw.path.lastIndexOf("\\"))
      if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) != -1) {
        this.$store.commit('watermark/push', {
          fullpath: file.raw.path,
          path: path,
          name: name,
          ext: ext
        })
      } else {
        this.errorList.push(name + '.' + ext)
        if (this.errorLog) {
          this.errorLog.change({
            content: this.$createElement('div', null, this.errorList.map((file) => {
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
          })
        } else {
          this.errorLog = this.$dialog({
            type: 'warning',
            title: '部分文件读取失败',
            text: '下列文件读取失败，请您检查文件格式。但已导入的图片文件不受影响，您仍可以继续处理列表中显示的已导入文件。',
            content: this.$createElement('div', null, this.errorList.map((file) => {
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
      if (this.sourceLocation == '') {
        this.$dialog({
          type: 'warning',
          text: '您还没有选择需要读取的文件夹！'
        })
        return
      }
      let dialog = this.$dialog({
        title: '正在扫描文件夹',
        text: '扫描时间与您的文件数量及大小有关，请您耐心等待……',
        showConfirm: false
      })
      let result = ReadDirectory(this.sourceLocation, this.childFolderIncluded)
      setTimeout(() => {
        this.$store.commit('watermark/assign', result.fileList)
        this.errorList = result.errorList
        dialog.change({
          type: 'success',
          title: '完成',
          text: '已成功读取您选择的文件夹，共发现 ' + this.$store.state.watermark.fileList.length + ' 个可处理的图片文件，接下来你可以继续执行下一步操作。',
          showConfirm: true
        })
        if (this.errorList.length != 0) {
          dialog.change({
            content: this.$createElement('div', null, [
              this.$createElement('div', null, [
                this.$createElement('p', null, '读取下列文件或文件夹的过程中出现错误，请您检查相关文件或文件夹的权限。这不影响您处理列表中显示的已导入文件。')
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
      this.$store.commit('watermark/del', index + (this.fileListPage - 1) * 100)
    },
    preview(index) {
      console.log(this.$store.state.watermark.fileList[index + (this.fileListPage - 1) * 100].fullpath)
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
      if (this.postPend == '' && this.customLocation == false) {
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
      let files = this.$store.state.watermark.fileList.slice()
      for (let i = 0; i < files.length; i++) {
        let file = files[i]
        let distPath = file.path
        if (this.customLocation) {
          if (this.sourceLocation != '') {
            distPath = this.saveLocation + distPath.slice(this.sourceLocation.length - 1)
          } else {
            distPath = this.saveLocation
          }
        }
        file.distPath = distPath
        file.distFullpath = distPath + '\\' + file.name + this.postPend + '.' + this.mimeType.toLowerCase()
        file.distExt = this.mimeType.toLowerCase()
      }
      this.$store.commit('watermark/assign', files)
      ipcRenderer.send('open', {
        title: '水印编辑器',
        path: '#/watermark/editor',
        modal: true,
        height: 700,
        width: 1000
      })
    },
    selectSaveFolder() {
      this.saveLocation = ipcRenderer.sendSync('select-folder')
    },
    selectSourceFolder() {
      this.sourceLocation = ipcRenderer.sendSync('select-folder')
    }
  },
  beforeMount() {
    //this.$store.commit('watermark/empty')
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
