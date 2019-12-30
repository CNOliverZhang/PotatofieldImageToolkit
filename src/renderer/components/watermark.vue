<template>
  <el-tabs type="card" tab-position="left" id="watermark">
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-images"></i> 导入图片</span>
      <div class="tab-content">
        <div class="upload-area interactable">
          <el-upload class="upload-dragger" drag action="" multiple :auto-upload="false" :on-change="handleFile"
            :show-file-list="false" :class="fileList.length != 0 ? 'half' : ''">
            <i class="fas fa-images icon"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击选择文件</em></div>
          </el-upload>
          <div v-if="fileList.length != 0" class="file-list">
            <div class="list">
              <el-scrollbar>
                <div v-for="(file, index) in fileList" :key="file.name" class="file">
                  <div class="filename">{{ file.name + '.' + file.ext }}</div>
                  <div @click="handleDelete(index)">
                    <i class="fas fa-trash-alt delete"></i>
                  </div>
                </div>
              </el-scrollbar>
            </div>
            <el-button type="primary" size="mini" @click="edit" class="interactable">进入水印编辑器</el-button>
          </div>
        </div>
        <div class="el-upload__tip">支持JPEG，PNG和GIF格式图像。</div>
        <div class="subtitle">请选择存储位置</div>
        <div class="control-row">
          <el-switch v-model="customLocation" active-color="#2196F3" inactive-color="#2196F3" active-text="自定义路径"
            inactive-text="保存在原路径" class="interactable"></el-switch>
          <div class="space"></div>
          <el-input disabled size="mini" v-model="saveLocation" v-if="customLocation" class="position interactable">
            <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
          </el-input>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-folder-open"></i> 选择文件夹</span>
      <div class="tab-content">内容</div>
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
      customLocation: false,
      saveLocation: ''
    }
  },
  methods: {
    hide() {
      ipcRenderer.send('minimize')
    },
    close() {
      ipcRenderer.send('close')
    },
    handleFile(file) {
      let ext = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length).toLowerCase()
      let name = file.name.substring(0, file.name.lastIndexOf("."))
      let path = file.raw.path.substring(0, file.raw.path.lastIndexOf("\\"))
      if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) != -1) {
        this.fileList.push({
          file: file,
          path: path,
          name: name,
          ext: ext
        })
      } else {
        this.$message.error({
          message: "文件“" + file.name + "”的格式不受支持"
        })
      }
    },
    handleDelete(index) {
      this.fileList.splice(index, 1)
    },
    edit() {},
    selectSaveFolder() {}
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
            
            .icon {
              font-size: 50px;
              margin: 20px;
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
    
    .el-upload__tip {
      margin-bottom: 10px;
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
      
      .position {
        width: 60%;
      }
    }
  }
}
</style>
