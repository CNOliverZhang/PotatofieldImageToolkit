<template>
  <el-tabs type="card" tab-position="left" id="about">
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-code"></i> 版权信息</span>
      <div id="info" class="tab-content">
        <div class="row">
          <div id="intro">
            <img id="logo" src="static/images/logo.png" />
            <div id="intro-text">
              <div class="title">洋芋田图像工具箱</div>
              <div class="text">一个专为摄影师设计的图像工具箱</div>
            </div>
          </div>
          <div class="text link interactable" @click="open('https://imagetoolkit.potatofield.cn')">访问网站</div>
        </div>
        <div class="row">
          <div class="subtitle">开发者信息</div>
        </div>
        <div class="control-row">
          <div class="text">Copyright © 2020 张志毅</div>
          <div class="text link interactable" @click="open('mailto:cnoliverzhang@gmail.com')">联系开发者</div>
        </div>
        <div class="row">
          <div class="subtitle">开源协议</div>
        </div>
        <div class="control-row">
          <div class="text">本程序遵循 MIT 开源许可协议发行，相关资源及源码已托管在 Github ，您可以<span
            class="link interactable"
            @click="open('https://github.com/CNOliverZhang/PotatofieldImageToolkit/')">点此访问</span>。
        </div>
        </div>
        <div class="row">
          <div class="subtitle">相关项目</div>
        </div>
        <div class="control-row">
          <div class="text">本程序的开发过程中使用了下列开源程序和组件：</div>
        </div>
        <div id="resources">
          <el-button
            v-for="(resource) in resources"
            :key="resource.title"
            class="interactable"
            size="mini"
            type="primary"
            @click="open(resource.url)">{{ resource.title }}
          </el-button>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-sync-alt"></i> 版本更新</span>
      <div id="update" class="tab-content">
        <div class="row">
          <div class="subtitle">当前版本</div>
        </div>
        <div class="control-row">
          <div class="text">版本号：{{ version }}</div>
        </div>
        <div class="row">
          <div class="subtitle">最新版本</div>
        </div>
        <div v-if="updateChecked">
          <div v-if="update">
            <div class="control-row">
              <div class="text">版本号：{{ update.version }}</div>
            </div>
            <div class="control-row">
              <div class="text">更新日志：</div>
            </div>
            <div class="subtext" v-for="(releaseNote) in update.releaseNotes" :key="releaseNote">
              {{ releaseNote }}
            </div>
            <div class="control-row">
              <div class="text">发布日期：{{ update.releaseDate }}</div>
            </div>
            <div class="row">
              <el-button type="primary" size="mini" @click="confirmUpdate" class="interactable">现在更新</el-button>
            </div>
          </div>
          <div v-else>
            <div class="control-row">
              <div class="text">您的版本已经是最新版本，无需更新。</div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="control-row">
            <div class="text">尚未获取更新信息，请点击下方按钮检查最新版本。</div>
          </div>
          <div class="row">
            <el-button type="primary" size="mini" @click="checkForUpdate" class="interactable">检查更新</el-button>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-cog"></i> 模板管理</span>
      <div id="templates" class="tab-content">
        <div class="row">
          <div class="subtitle">导出模板备份</div>
        </div>
        <div class="control-row">
          <div class="text">您可以将所有工具的模板导出为备份文件，请先选择目标文件夹并输入文件名。</div>
        </div>
        <div class="row">
          <el-input disabled size="mini" v-model="distDirectory" class="export interactable">
            <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
          </el-input>
          <el-input size="mini" v-model="filename" class="export interactable" placeholder="请输入文件名">
            <template slot="append">.pfitbak</template>
          </el-input>
          <el-button type="primary" size="mini" @click="exportTemplates" class="export interactable">导出备份</el-button>
        </div>
        <div class="row">
          <div class="subtitle">导入模板</div>
        </div>
        <div class="control-row">
          <div class="text">您可以从之前导出的备份文件导入模板。请注意，这将覆盖您已保存的模板。</div>
        </div>
        <el-upload
          action=""
          class="interactable"
          :auto-upload="false"
          :on-change="importTemplates"
          :show-file-list="false">
          <el-button type="primary" size="mini">导入模板</el-button>
        </el-upload>
        <div class="row">
          <div class="subtitle">清空模板</div>
        </div>
        <div class="control-row">
          <div class="text">这将删除您已保存的所有模板且不可恢复，请务必谨慎操作。</div>
        </div>
        <div class="row">
          <el-button type="primary" size="mini" @click="clearTemplates" class="interactable">清空模板</el-button>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane disabled>
      <span slot="label" id="sidebar">
        <div id="tool-info">
          <i id="tool-logo" class="fas fa-question-circle"></i>
          <div class="text">关于</div>
        </div>
        <div id="control-button-holder">
          <div class="control-button interactable" @click="hide">
            <i class="fas fa-angle-double-down"></i>
            <div>最小化</div>
          </div>
          <div class="control-button interactable" @click="close">
            <span class="fas fa-sign-out-alt"></span>
            <div>退出</div>
          </div>
        </div>
      </span>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { ipcRenderer, shell } from 'electron'

const path = require('path')
const fs = require('fs')

export default {
  name: 'about',
  data () {
    return {
      resources: [
        {
          title: 'Electron',
          url: 'https://github.com/electron/electron'
        },
        {
          title: 'electron-promise-ipc',
          url: 'https://github.com/sibnerian/electron-promise-ipc'
        },
        {
          title: 'electron-buider',
          url: 'https://github.com/electron-userland/electron-builder'
        },
        {
          title: 'Vue.js',
          url: 'https://github.com/vuejs/vue'
        },
        {
          title: 'Vue Router',
          url: 'https://github.com/vuejs/vue-router'
        },
        {
          title: 'Vuex',
          url: 'https://github.com/vuejs/vuex'
        },
        {
          title: 'Vuex Electron',
          url: 'https://github.com/vue-electron/vuex-electron'
        },
        {
          title: 'vue-clamp',
          url: 'https://github.com/Justineo/vue-clamp'
        },
        {
          title: 'Element UI',
          url: 'https://github.com/ElemeFE/element'
        },
        {
          title: 'Font Awesome',
          url: 'https://github.com/FortAwesome/Font-Awesome'
        },
        {
          title: 'html2canvas',
          url: 'https://github.com/niklasvh/html2canvas'
        },
        {
          title: 'CKEditor 5',
          url: 'https://github.com/ckeditor/ckeditor5'
        },
        {
          title: 'EXIF.js',
          url: 'https://github.com/exif-js/exif-js'
        },
        {
          title: 'Cropper.js',
          url: 'https://github.com/fengyuanchen/cropperjs'
        },
        {
          title: 'Color Thief',
          url: 'https://github.com/lokesh/color-thief'
        }
      ],
      version: null,
      updateChecked: false,
      update: null,
      distDirectory: '',
      filename: ''
    }
  },
  methods: {
    hide() {
      ipcRenderer.send('minimize')
    },
    close() {
      ipcRenderer.send('close')
    },
    open(url) {
      shell.openExternal(url)
    },
    checkForUpdate() {
      ipcRenderer.send('check-for-update')
      this.$dialog({
        text: '正在检查更新',
        showConfirm: false
      }).then((dialog) => {
        ipcRenderer.once('error', () => {
          dialog.change({
            type: 'error',
            title: '出现错误',
            text: '检查更新的过程中出现错误，请您检查网络连接状态或稍候重试。',
            showConfirm: true
          })
        })
        ipcRenderer.once('update-not-available', () => {
          dialog.close()
          this.updateChecked = true
        })
        ipcRenderer.once('update-available', (event, info) => {
          dialog.close()
          this.updateChecked = true
          this.update = {
            version: info.version,
            releaseNotes: info.releaseNotes.split('\n'),
            releaseDate: info.releaseDate.slice(0, 4) + "年"
            + info.releaseDate.slice(5, 7) + "月"
            + info.releaseDate.slice(8, 10) + "日"
          }
        })
      })
    },
    confirmUpdate() {
      ipcRenderer.send('download-update')
      ipcRenderer.removeAllListeners(['error'])
      this.$dialog({
        title: '正在下载更新',
        content: this.$createElement('el-progress', {
          'style': {
            'height': '20px'
          },
          'props': {
            'text-inside': true,
            'stroke-width': 20,
            'percentage': 0
          }
        }),
        showConfirm: false
      }).then((dialog) => {
        ipcRenderer.once('error', () => {
          dialog.change({
            type: 'error',
            title: '出现错误',
            text: '检查或下载更新的过程中出现错误，请您检查网络连接状态或稍候重试。',
            content: null,
            showConfirm: true
          })
        })
        ipcRenderer.on('update-download-progress', (event, progress) => {
          dialog.change({
            content: this.$createElement('el-progress', {
              'props': {
                'text-inside': true,
                'stroke-width': 20,
                'percentage': Math.round(progress)
              }
            })
          })
        })
        ipcRenderer.once('update-downloaded', () => {
          dialog.change({
            type: 'success',
            title: '更新下载完成',
            text: '新版本的安装文件已经下载完成，即将开始更新。',
            content: null,
            showConfirm: true,
            confirmFunction: () => {
              ipcRenderer.send('update-now')
              this.$dialog({
                title: '正在安装更新',
                text: '更新完成后本程序将自动重启，在此期间无需其他操作，请您耐心等待。',
                showConfirm: false
              })
            }
          })
        })
      })
    },
    selectSaveFolder() {
      this.distDirectory = ipcRenderer.sendSync('select-folder')
    },
    exportTemplates() {
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
          let backup = {
            type: 'PotatofieldImageToolkitTemplatesBackup',
            version: this.version,
            templates: {
              watermarkTemplates: this.$store.state.watermark.templates,
              splicerTemplates: this.$store.state.splicer.templates,
              textToImageTemplates: this.$store.state.textToImage.templates
            }
          }
          let buffer = new Buffer.from(btoa(encodeURI(JSON.stringify(backup))))
          let distFullpath = path.join(this.distDirectory, this.filename + '.pfitbak')
          fs.writeFile(distFullpath, buffer, (error) => {
            if (error) {
              dialog.change({
                type: 'error',
                title: '出现错误',
                text: '导出备份，请检查目标文件夹权限。',
                showConfirm: true
              })
            } else {
              dialog.change({
                type: 'success',
                title: '成功',
                text: '备份文件已导出到目标文件夹。',
                showConfirm: true
              })
            }
            this.distDirectory = ''
            this.filename = ''
          })
        })
      }
    },
    clearTemplates() {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '这将删除您已保存的所有模板且不可恢复，确定执行操作吗？',
        showCancel: true,
        confirmFunction: () => {
          this.$store.dispatch('watermark/templatesEmpty')
          this.$store.dispatch('splicer/templatesEmpty')
          this.$store.dispatch('textToImage/templatesEmpty')
        }
      })
    },
    importTemplates(file) {
      let ext = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length).toLowerCase()
      if (ext != 'pfitbak') {
        this.$dialog({
          type: 'error',
          title: '错误',
          text: '文件格式不正确。'
        })
      } else {
        this.$dialog({
          title: '正在处理',
          text: '即将完成，请稍候。',
          showConfirm: false
        }).then((dialog) => {
          try {
            let backup = JSON.parse(decodeURI(atob(fs.readFileSync(file.raw.path))))
            if (backup.type != 'PotatofieldImageToolkitTemplatesBackup') {
              throw 'error'
            } else {
              if (backup.templates.watermarkTemplates) {
                this.$store.dispatch('watermark/templatesAssign', backup.templates.watermarkTemplates)
              }
              if (backup.templates.splicerTemplates) {
                this.$store.dispatch('splicer/templatesAssign', backup.templates.splicerTemplates)
              }
              if (backup.templates.textToImageTemplates) {
                this.$store.dispatch('textToImage/templatesAssign', backup.templates.textToImageTemplates)
              }
            }
            dialog.change({
              type: 'success',
              title: '成功',
              text: '已将该备份文件中的模板导入到您的模板库中。',
              showConfirm: true
            })
          } catch(e) {
            dialog.change({
              type: 'error',
              title: '出现错误',
              text: '文件已损坏，导入模板失败。',
              showConfirm: true
            })
          }
        })
      }
    }
  },
  mounted() {
    this.version = ipcRenderer.sendSync('version')
  }
}
</script>

<style lang="scss">
#about {
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
  
  .tab-content {
    padding: 20px;
  }
  
  .control-row {
    width: 100%;
    height: 21px;
    flex-shrink: 0;
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 14px;
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
  
  .subtext {
    margin-top: 5px;
    margin-bottom: 5px;
  }
  
  #info {      
    #intro {
      display: flex;
      flex-direction: row;
      margin-top: 10px;
      margin-bottom: 10px;
      
      #logo {
        width: 60px;
        height: 60px;
        object-fit: contain;
      }
      
      #intro-text {
        margin-left: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        
        .title {
          line-height: 1em;
        }
        
        .text {
          line-height: 1em;
        }
      }
    }
    
    #resources {
      display: flex;
      flex-wrap: wrap;
      margin: -5px;
      
      button {
        margin: 5px;
      }
    }
    
    .link {
      cursor: pointer;
      transition: 0.2s;
      
      &:hover {
        color: var(--main-color);
      }
    }
  }
  
  #templates {
    .export {
      margin-left: 5px;
      margin-right: 5px;
      
      &:first-child {
        margin-left: 0;
      }
      
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
