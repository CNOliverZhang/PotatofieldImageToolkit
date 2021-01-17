<template>
  <div id="settings">
    <div class="page-header">
      <div class="page-title">设置</div>
      <div class="control-button minimize" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div class="control-button close" @click="close">
        <object data="static/images/close.svg" type="image/svg+xml"></object>
      </div>
    </div>
    <el-tabs type="card" tab-position="top" id="content">
      <el-tab-pane>
        <span slot="label"><i class="fas fa-code"></i> 版权信息</span>
        <div id="info" class="tab-content">
          <div class="row">
            <div id="intro">
              <img id="logo" src="static/images/logo.png" />
              <div id="intro-text">
                <div class="title">洋芋田图像工具箱</div>
                <div class="text">一个专为摄影师设计的图像工具箱</div>
              </div>
            </div>
            <div class="text link" @click="open('https://imagetoolkit.potatofield.cn')">访问网站</div>
          </div>
          <div class="row">
            <div class="subtitle">开发者信息</div>
          </div>
          <div class="control-row">
            <div class="text">Copyright © 2021 张志毅</div>
            <div class="text link" @click="copyEmail">联系开发者</div>
          </div>
          <div class="row">
            <div class="subtitle">开源协议</div>
          </div>
          <div class="control-row">
            <div class="text">本程序遵循 MIT 开源许可协议发行，相关资源及源码已托管在 Github ，您可以<span
              class="link"
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
              size="mini"
              type="primary"
              @click="open(resource.url)">{{ resource.title }}
            </el-button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="fas fa-sync-alt"></i> 版本更新</span>
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
                <el-button type="primary" size="mini" @click="confirmUpdate">现在更新</el-button>
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
              <el-button type="primary" size="mini" @click="checkForUpdate">检查更新</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="fas fa-cog"></i> 模板管理</span>
        <div id="templates" class="tab-content">
          <div class="row">
            <div class="subtitle">导出模板备份</div>
          </div>
          <div class="control-row">
            <div class="text">您可以将所有工具的模板导出为备份文件，请先选择目标文件夹并输入文件名。</div>
          </div>
          <div class="row">
            <el-input disabled size="mini" v-model="distDirectory" class="export">
              <el-button @click="selectSaveFolder" slot="prepend">选择</el-button>
            </el-input>
            <el-input size="mini" v-model="filename" class="export" placeholder="请输入文件名">
              <template slot="append">.pfitbak</template>
            </el-input>
            <el-button type="primary" size="mini" @click="exportTemplates" class="export">导出备份</el-button>
          </div>
          <div class="row">
            <div class="subtitle">导入模板</div>
          </div>
          <div class="control-row">
            <div class="text">您可以从之前导出的备份文件导入模板。请注意，这将覆盖您已保存的模板。</div>
          </div>
          <el-upload
            action=""
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
            <el-button type="primary" size="mini" @click="clearTemplates">清空模板</el-button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="fas fa-wrench"></i> 个性化设置</span>
        <div id="custom" class="tab-content">
          <div class="row">
            <div class="subtitle">设置缩放比例</div>
          </div>
          <div class="control-row">
            <div class="text">您可以自定义界面的缩放比例以匹配您计算机显示器的尺寸和分辨率。</div>
          </div>
          <div id="scale" class="row">
            <el-select v-model="scale" size="mini" class="scale">
              <el-option label="75%" :value="0.75"/>
              <el-option label="100%" :value="1.0"/>
              <el-option label="125%" :value="1.25"/>
              <el-option label="150%" :value="1.5"/>
              <el-option label="175%" :value="1.75"/>
              <el-option label="200%" :value="2.0"/>
            </el-select>
            <el-button type="primary" size="mini" @click="setScale" class="scale">保存设置</el-button>
          </div>
          <div class="row">
            <div class="subtitle">开机启动选项</div>
          </div>
          <div class="control-row">
            <div class="text">您可以选择本软件是否随您的计算机开机启动。</div>
          </div>
          <div class="control-row">
            <el-switch
              @change="switchOpenAtLogin"
              v-model="openAtLogin"
              active-text="开机启动"
              inactive-text="开机不启动"></el-switch>
          </div>
          <div class="row">
            <div class="subtitle">首页样式设置</div>
          </div>
          <div class="control-row">
            <div class="text">您可以选择首页各工具采用大图标横向滚动排列或小图标平铺排列的样式。</div>
          </div>
          <div class="control-row">
            <el-switch
              @change="switchHomeIconStyle"
              v-model="smallHomeIcon"
              active-color="var(--main-color)"
              inactive-color="var(--main-color)"
              active-text="小图标平铺排列"
              inactive-text="大图标横向滚动"></el-switch>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ipcRenderer, shell, clipboard } from 'electron'
import CreateDirectory from '../utils/CreateDirectory'

const path = require('path')
const fs = require('fs')

export default {
  name: 'settings',
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
        },
        {
          title: 'Crypto-JS',
          url: 'https://github.com/brix/crypto-js'
        }
      ],
      version: null,
      updateChecked: false,
      update: null,
      distDirectory: '',
      filename: '',
      scale: this.$store.state.settings.scale,
      openAtLogin: false,
      smallHomeIcon: this.$store.state.settings.smallHomeIcon
    }
  },
  methods: {
    minimize() {
      ipcRenderer.send('minimize')
    },
    close() {
      ipcRenderer.send('close')
    },
    open(url) {
      shell.openExternal(url)
    },
    copyEmail() {
      clipboard.writeText('cnoliverzhang@gmail.com')
      this.$dialog({
        type: 'success',
        title: '已复制邮箱',
        text: '已成功将开发者的邮箱地址复制到剪贴板，您现在可以通过电子邮件联系开发者。'
      })
    },
    checkForUpdate() {
      ipcRenderer.send('check-for-update')
      this.$dialog({
        text: '正在检查更新',
        showConfirm: false
      }).then((dialog) => {
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
            releaseDate: info.releaseDate.slice(0, 4) + " 年 "
            + info.releaseDate.slice(5, 7) + " 月 "
            + info.releaseDate.slice(8, 10) + " 日"
          }
        })
        ipcRenderer.once('error', () => {
          dialog.change({
            type: 'error',
            title: '出现错误',
            text: '检查更新的过程中出现错误，请您检查网络连接状态或稍候重试。',
            showConfirm: true
          })
        })
      })
    },
    confirmUpdate() {
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
            text: '新版本的安装文件已经下载完成，即将退出程序以安装更新。',
            content: null,
            showConfirm: true,
            confirmFunction: () => {
              ipcRenderer.send('update-now')
            }
          }).then(() => {
            ipcRenderer.removeAllListeners('update-download-progress')
          })
        })
        ipcRenderer.once('error', () => {
          dialog.change({
            type: 'error',
            title: '出现错误',
            text: '下载更新的过程中出现错误，请您检查网络连接状态或稍候重试。',
            content: null,
            showConfirm: true
          }).then(() => {
            ipcRenderer.removeAllListeners('update-download-progress')
          })
        })
        ipcRenderer.send('download-update')
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
              watermarkTemplates: this.$store.state.watermark.templates.slice().map(template => {
                if (template.image) {
                  template.imageData = fs.readFileSync(template.image).toString('base64')
                  template.image = path.basename(template.image)
                }
                return template
              }),
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
          this.$dialog({
            title: '正在处理',
            text: '即将完成，请稍候。',
            showConfirm: false
          }).then((dialog) => {
            this.$store.state.watermark.templates.map(template => {
              if (template.image) {
                try {
                  fs.unlinkSync(template.image)
                } catch (error) {}
              }
            })
            this.$store.dispatch('watermark/templatesEmpty')
            this.$store.dispatch('splicer/templatesEmpty')
            this.$store.dispatch('textToImage/templatesEmpty')
            dialog.change({
              type: 'success',
              title: '成功',
              text: '已删除您保存的所有模板。',
              showConfirm: true
            })
          })
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
                let watermarkTemplates = backup.templates.watermarkTemplates.map(template => {
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
                  return template
                })
                this.$store.dispatch('watermark/templatesAssign', watermarkTemplates)
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
    },
    setScale() {
      this.$dialog({
        title: '操作确认',
        text: '更改缩放比例后本程序将重启，确定执行操作吗？',
        showCancel: true,
        confirmFunction: () => {
          this.$store.dispatch('settings/setScale', this.scale)
          ipcRenderer.send('relaunch')
        }
      })
    },
    switchOpenAtLogin(value) {
      ipcRenderer.send('open-at-login', value)
      this.$dialog({
        type: 'success',
        title: '设置成功',
        text: '已' + (value ? '设置' : '取消') + '开机启动。'
      })
    },
    switchHomeIconStyle(value) {
      this.$store.dispatch('settings/changeHomeIconStyle', value)
    }
  },
  mounted() {
    this.version = ipcRenderer.sendSync('version')
    this.openAtLogin = ipcRenderer.sendSync('auto-open-status')
  }
}
</script>

<style lang="scss">
#settings {
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
  
    .tab-content {
      padding: 20px;
    }
    
    .subtext {
      margin-top: 5px;
      margin-bottom: 5px;
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
    
    .el-input-group__append {
      width: fit-content;
      display: flex;
      justify-content: center;
      align-items: center;
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
    
    #custom {
      
      #scale {
        width: fit-content;
        
        .scale {
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
  }
}
</style>
