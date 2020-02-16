<template>
  <div id="index">
    <div id="title-bar">
      <img id="logo" src="static/images/logo.png"/>
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
      <div class="control-button interactable" @click="exit">
        <span class="fa fa-sign-out-alt"></span>
        <div>退出</div>
      </div>
    </div>
    <div id="cards-holder" class="interactable">
      <div id="scroll">
        <div class="space">&nbsp;</div>
        <div class="container" @click="open('/watermark', '图片加水印工具')">
          <el-card class="card">
            <i class="fas fa-feather-alt icon"></i>
            <div class="title">图片加水印工具</div>
          </el-card>
        </div>
        <div class="container" @click="open('/splicer', '长图拼接工具')">
          <el-card class="card">
            <i class="fas fa-images icon"></i>
            <div class="title">长图拼接工具</div>
          </el-card>
        </div>
        <div class="container" @click="open('/textToImage', '富文本制图工具')">
          <el-card class="card">
            <span class="fas fa-file-alt icon"></span>
            <div class="title">富文本制图工具</div>
          </el-card>
        </div>
        <div class="container" @click="open('/resizer', '尺寸调整工具')">
          <el-card class="card">
            <span class="fas fa-compress icon"></span>
            <div class="title">尺寸调整工具</div>
          </el-card>
        </div>
        <div class="container" @click="open('/compress', 'JPEG 压缩工具')">
          <el-card class="card">
            <span class="fas fa-compress-arrows-alt icon"></span>
            <div class="title">JPEG 压缩工具</div>
          </el-card>
        </div>
        <div class="container" @click="open('/cropper', '图片裁剪工具')">
          <el-card class="card">
            <span class="fas fa-crop-alt icon"></span>
            <div class="title">图片裁剪工具</div>
          </el-card>
        </div>
        <div class="container" @click="open('/exif', 'EXIF 读取工具')">
          <el-card class="card">
            <span class="fas fa-info icon"></span>
            <div class="title">EXIF 读取工具</div>
          </el-card>
        </div>
        <div class="container" @click="open('/palette', '色彩提取工具')">
          <el-card class="card">
            <span class="fas fa-palette icon"></span>
            <div class="title">色彩提取工具</div>
          </el-card>
        </div>
        <div class="container" @click="open('/fonts', '字体管理工具')">
          <el-card class="card">
            <span class="fas fa-font icon"></span>
            <div class="title">字体管理工具</div>
          </el-card>
        </div>
        <div class="space">&nbsp;</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'index',
  methods: {
    hide() {
      ipcRenderer.send('minimize')
    },
    exit() {
      if (ipcRenderer.sendSync('index-only')) {
        ipcRenderer.send('exit')
      } else {
        this.$dialog({
          type: 'warning',
          title: '操作确认',
          text: '关闭主页面的同时将退出程序，正在运行的所有工具都将关闭。您确定要退出吗？',
          showCancel: true,
          confirmFunction: () => {
            this.$store.dispatch('watermark/fileListEmpty')
            this.$store.dispatch('splicer/fileListEmpty')
            this.$store.dispatch('textToImage/contentReset')
            this.$store.dispatch('cropper/fileListEmpty')
            ipcRenderer.send('exit')
          }
        })
      }
    },
    open(path, title) {
      ipcRenderer.send('open', {
        title: title,
        path: '#' + path
      })
    },
    showDeveloping() {
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
        text: '当前最新版本为 ' + info.version + ' ，新版本特性如下：',
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
        color: var(--main-color);
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
          color: var(--dark-gray);
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
            color: var(--main-color);
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
        background-color: var(--transparent);
        z-index: 3;
        
        &:hover {
          background-color: var(--white-gray);
        }
      }
      
      &::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background-color: var(--light-gray);
        z-index: 3;
        transition: 0.2s;
        
        &:hover {
          background-color: var(--gray);
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
      background-image: linear-gradient(to right, var(--white), var(--transparent));
    }
    
    &:after {
      content: '';
      position: absolute;
      width: 15px;
      height: calc(100% - 10px);
      top: 0;
      right: 0;
      z-index: 2;
      background-image: linear-gradient(to left, var(--white), var(--transparent));
    }
  }
}
</style>
