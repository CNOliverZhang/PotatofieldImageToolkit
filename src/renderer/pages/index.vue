<template>
  <div id="index">
    <div id="title-bar">
      <img id="logo" src="static/logo.png"/>
      <div class="title">洋芋田图像工具箱</div>
      <div id="title-bar-space"></div>
      <div class="control-button interactable" @click="open('/about', '关于')">
        <span class="fa fa-question-circle"></span>
        <div>关于</div>
      </div>
      <div class="control-button interactable" @click="hide">
        <span class="fa fa-angle-double-down"></span>
        <div>隐藏</div>
      </div>
      <div class="control-button interactable" @click="close">
        <span class="fa fa-sign-out-alt"></span>
        <div>退出</div>
      </div>
    </div>
    <div id="cards-holder" class="interactable">
      <div id="scroll">
        <div class="space">&nbsp;</div>
        <div class="container" @click="open('/watermark', '水印工具')">
          <el-card shadow="always" class="card">
            <i class="fas fa-feather icon"></i>
            <div class="title">添加水印</div>
          </el-card>
        </div>
        <div class="container" @click="showDeveloping">
          <el-card shadow="always" class="card">
            <i class="fas fa-images icon"></i>
            <div class="title">长图拼接</div>
          </el-card>
        </div>
        <div class="container" @click="showDeveloping">
          <el-card shadow="always" class="card">
            <span class="fas fa-crop icon"></span>
            <div class="title">裁剪工具</div>
          </el-card>
        </div>
        <div class="container" @click="showDeveloping">
          <el-card shadow="always" class="card">
            <span class="fas fa-magic icon"></span>
            <div class="title">滤镜美化</div>
          </el-card>
        </div>
        <div class="container" @click="showDeveloping">
          <el-card shadow="always" class="card">
            <span class="fas fa-compress icon"></span>
            <div class="title">尺寸压缩</div>
          </el-card>
        </div>
        <div class="container" @click="showDeveloping">
          <el-card shadow="always" class="card">
            <span class="fas fa-database icon"></span>
            <div class="title">图像瘦身</div>
          </el-card>
        </div>
        <div class="space">&nbsp;</div>
      </div>
    </div>
  </div>
</template>

<script>
const ipcRenderer = require('electron').ipcRenderer

export default {
  name: 'index',
  methods: {
    hide() {
      ipcRenderer.send('minimize')
    },
    close() {
      ipcRenderer.send('close')
    },
    open (path, title) {
      if (!ipcRenderer.sendSync('open', {
        title: title,
        path: '#' + path
      })) {
        this.$dialog({
          text: '不支持同时打开两个相同的窗口。'
        })
      }
    },
    showDeveloping () {
      this.$dialog({
        text: '功能正在开发中。'
      })
    }
  },
  mounted() {
    document.getElementById('scroll').addEventListener('mousewheel', (event) => {
      document.getElementById('scroll').scrollLeft -= event.wheelDelta / 5
      event.preventDefault()
    })
    ipcRenderer.send('check-for-update')
    ipcRenderer.once('update-available', (event, info) => {
      this.$dialog({
        title: '发现新版本',
        text: '当前最新版本为 ' + info.version + '，新版本特性如下：',
        content: this.$createElement('div', null, info.releaseNotes.split('\n').map((releaseNote) => {
          return this.$createElement('p', {
            'style': {
              'text-indent': 0
            }
          }, releaseNote)
        })),
        showCancel: true,
        cancelText: '忽略',
        confirmText: '更新',
        confirmFunction: () => {
          ipcRenderer.send('download-update')
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
          ipcRenderer.once('error', () => {
            dialog.change({
              type: 'error',
              title: '出现错误',
              text: '下载更新的过程中出现错误。您可以在下次启动程序时重试，也可以进入“关于”页面手动更新。',
              content: null,
              showConfirm: true,
              confirmFunction: () => {
                dialog.close()
              }
            })
          })
        }
      })
    })
  }
}
</script>

<style lang="scss">
#index {
  width: 100%;
  height: 100%;
  padding: 60px;
  box-sizing: border-box;
  
  #title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    #logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }
    
    .title {
      margin-left: 20px;
    }
    
    #title-bar-space {
      flex-grow: 1;
    }
    
    .control-button {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-size: 12px;
      width: 32px;
      margin-left: 10px;
      margin-right: 10px;
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
  
  #cards-holder {
    width: 100%;
    margin-top: 50px;
    position: relative;
    
    #scroll {
      overflow-y: hidden;
      overflow-x: auto;
      display: flex;
      padding-top: 15px;
      padding-bottom: 15px;
      box-sizing: border-box;
      
      .container {
        margin: 10px;
        
        .card {
          width: 200px;
          height: 200px;
          flex-shrink: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          cursor: pointer;
          font-size: 14px;
          color: #606266;
          text-align: center;
          
          .icon {
            font-size: 80px;
          }
          
          .title {
            font-size: 16px;
            margin-top: 10px;
          }
          
          &:hover {
            transform: scale(1.05);
            color: #2196F3;
          }
          
          &:active {
            filter: brightness(0.9);
          }
          
          &:first-child {
            margin-left: 0;
          }
          
          &:last-child {
            margin-right: 0;
          }
        }
      }
      
      .space {
        width: 15px;
        height: 100%;
      }
      
      &::-webkit-scrollbar {
        height: 10px;
        z-index: 3;
      }
          
      &::-webkit-scrollbar-track {
        border-radius: 5px;
        background-color: rgba(255, 255, 255, 0);
        z-index: 3;
        
        &:hover {
          background-color: #F5F7FA;
        }
      }
      
      &::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background-color: #DCDFE6;
        z-index: 3;
        transition: 0.2s;
        
        &:hover {
          background-color: #C0C4CC;
        }
      }
    }
    
    &:before {
      content: '';
      position: absolute;
      width: 15px;
      height: calc(100% - 10px);
      top: 0;
      left: 0;
      z-index: 2;
      background-image: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
    }
    
    &:after {
      content: '';
      position: absolute;
      width: 15px;
      height: calc(100% - 10px);
      top: 0;
      right: 0;
      z-index: 2;
      background-image: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
    }
  }
}
</style>
