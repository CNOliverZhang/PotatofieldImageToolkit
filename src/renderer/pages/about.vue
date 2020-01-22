<template>
  <el-tabs type="card" tab-position="left" id="about">
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-code"></i> 版权信息</span>
      <div id="info" class="tab-content">
        <div class="row">
          <div id="intro">
            <img id="logo" src="static/logo.png" />
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
        <div class="row">
          <div class="text">Copyright © 2020 张志毅</div>
          <div class="text link interactable" @click="open('mailto:cnoliverzhang@gmail.com')">联系开发者</div>
        </div>
        <div class="row">
          <div class="subtitle">开源协议</div>
        </div>
        <div class="row">
          <div class="text">本程序遵循MIT开源许可协议发行，相关资源及源码已托管在Github，您可以<span
            class="link interactable"
            @click="open('https://github.com/CNOliverZhang/PotatofieldImageToolkit/')">点此访问</span>。
        </div>
        </div>
        <div class="row">
          <div class="subtitle">相关项目</div>
        </div>
        <div class="row">
          <div class="text">本程序的开发过程中使用了下列开源程序和组件：</div>
        </div>
        <el-button
          class="interactable"
          size="mini"
          type="primary"
          @click="open('https://github.com/electron/electron')">Electron
        </el-button>
        <el-button
          class="interactable"
          size="mini"
          type="primary"
          @click="open('https://github.com/vuejs/vue')">Vue.js
        </el-button>
        <el-button
          class="interactable"
          size="mini"
          type="primary"
          @click="open('https://github.com/SimulatedGREG/electron-vue')">electron-vue
        </el-button>
        <el-button
          class="interactable"
          size="mini"
          type="primary"
          @click="open('https://github.com/ElemeFE/element')">Element UI
        </el-button>
        <el-button
          class="interactable"
          size="mini"
          type="primary"
          @click="open('https://github.com/electron-userland/electron-builder')">electron-builder
        </el-button>
        <el-button
          class="interactable"
          size="mini"
          type="primary"
          @click="open('https://github.com/niklasvh/html2canvas/')">html2canvas
        </el-button>
      </div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-sync-alt"></i> 版本更新</span>
      <div id="update" class="tab-content">
        <div class="row">
          <div class="subtitle">当前版本</div>
        </div>
        <div class="row">
          <div class="text">版本号：{{ version }}</div>
        </div>
        <div class="row">
          <div class="subtitle">最新版本</div>
        </div>
        <div v-if="updateChecked">
          <div v-if="update">
            <div class="row">
              <div class="text">版本号：{{ update.version }}</div>
            </div>
            <div class="row">
              <div class="text">更新日志：</div>
            </div>
            <div class="subtext" v-for="(releaseNote) in update.releaseNotes" :key="releaseNote">
              {{ releaseNote }}
            </div>
            <div class="row">
              <div class="text">发布日期：{{ update.releaseDate }}</div>
            </div>
            <div class="row">
              <el-button type="primary" size="mini" @click="confirmUpdate" class="interactable">现在更新</el-button>
            </div>
          </div>
          <div v-else>
            <div class="row">
              <div class="text">您的版本已经是最新版本，无需更新。</div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="row">
            <div class="text">尚未获取更新信息，请点击下方按钮检查最新版本。</div>
          </div>
          <div class="row">
            <el-button type="primary" size="mini" @click="checkForUpdate" class="interactable">检查更新</el-button>
          </div>
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
const ipcRenderer = require('electron').ipcRenderer
const shell = require('electron').shell

export default {
  name: 'about',
  data () {
    return {
      version: null,
      updateChecked: false,
      update: null
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
      let dialog = this.$dialog({
        text: '正在检查更新',
        showConfirm: false
      })
      ipcRenderer.once('error', () => {
        dialog.change({
          type: 'error',
          title: '出现错误',
          text: '检查更新的过程中出现错误，请您检查网络连接状态或稍后重试。',
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
      
    },
    confirmUpdate() {
      ipcRenderer.send('download-update')
      ipcRenderer.removeAllListeners(['error'])
      let dialog = this.$dialog({
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
      })
      ipcRenderer.once('error', () => {
        dialog.change({
          type: 'error',
          title: '出现错误',
          text: '检查或下载更新的过程中出现错误，请您检查网络连接状态或稍后重试。',
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
    }
  },
  beforeMount() {
    this.version = ipcRenderer.sendSync('version')
  }
}
</script>

<style lang="scss">
#about {
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
    
    .link {
      cursor: pointer;
      transition: 0.2s;
      
      &:hover {
        color: #2196F3;
      }
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
        color: #FFFFFF;
      }
      
      &:active {
        filter: brightness(0.9);
      }
    }
  }
}
</style>
