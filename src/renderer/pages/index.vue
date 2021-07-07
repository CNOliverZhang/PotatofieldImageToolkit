<template>
  <div id="index">
    <div id="content">
      <div id="title-bar">
        <img id="logo" src="static/images/logo.png"/>
        <div id="title" class="title">洋芋田图像工具箱</div>
        <div id="title-bar-space"></div>
        <div class="control-button" @click="open('/messages', '消息中心')">
          <div key="hasUnreadMessage" v-if="unreadMessages > 0">
            <el-badge :value="unreadMessages">
              <span class="fa fa-envelope"></span>
            </el-badge>
          </div>
          <div key="noUnreadMessage" v-else>
            <span class="fa fa-envelope"></span>
          </div>
          <div>消息中心</div>
        </div>
        <div class="control-button" @click="open('/settings', '设置')">
          <span class="fa fa-tools"></span>
          <div>设置</div>
        </div>
        <div class="control-button" @click="minimize">
          <span class="fa fa-angle-double-down"></span>
          <div>最小化</div>
        </div>
        <div class="control-button" @click="hide">
          <span class="fa fa-compress-alt"></span>
          <div>隐藏</div>
        </div>
        <div class="control-button" @click="exit">
          <span class="fa fa-sign-out-alt"></span>
          <div>退出程序</div>
        </div>
      </div>
      <div id="small-cards-holder" key="small" v-if="this.$store.state.settings.smallHomeIcon">
        <div id="wrapper">
          <div class="container" @click="open('/watermark', '图片加水印工具')">
            <div class="card">
              <i class="fas fa-feather-alt icon"></i>
              <div class="title">图片加水印</div>
            </div>
          </div>
          <div class="container" @click="open('/splicer', '长图拼接工具')">
            <div class="card">
              <i class="fas fa-images icon"></i>
              <div class="title">长图拼接</div>
            </div>
          </div>
          <div class="container" @click="open('/cropper', '图片裁剪工具')">
            <div class="card">
              <span class="fas fa-crop-alt icon"></span>
              <div class="title">图片裁剪</div>
            </div>
          </div>
          <div class="container" @click="open('/slicer', '图片分割工具')">
            <div class="card">
              <i class="fas fa-th icon"></i>
              <div class="title">图片分割</div>
            </div>
          </div>
          <div class="container" @click="open('/textToImage', '富文本制图工具')">
            <div class="card">
              <span class="fas fa-file-alt icon"></span>
              <div class="title">富文本制图</div>
            </div>
          </div>
          <div class="container" @click="open('/resizer', '尺寸调整工具')">
            <div class="card">
              <span class="fas fa-compress icon"></span>
              <div class="title">尺寸调整</div>
            </div>
          </div>
          <div class="container" @click="open('/compress', '图片压缩工具')">
            <div class="card">
              <span class="fas fa-compress-arrows-alt icon"></span>
              <div class="title">图片压缩</div>
            </div>
          </div>
          <div class="container" @click="open('/convert', '格式转换工具')">
            <div class="card">
              <span class="fas fa-sync-alt icon"></span>
              <div class="title">格式转换</div>
            </div>
          </div>
          <div class="container" @click="open('/exif', 'EXIF 读取工具')">
            <div class="card">
              <span class="fas fa-camera icon"></span>
              <div class="title">EXIF 读取</div>
            </div>
          </div>
          <div class="container" @click="open('/palette', '色彩提取工具')">
            <div class="card">
              <span class="fas fa-palette icon"></span>
              <div class="title">色彩提取</div>
            </div>
          </div>
          <div class="container" @click="open('/fonts', '字体管理工具')">
            <div class="card">
              <span class="fas fa-font icon"></span>
              <div class="title">字体管理</div>
            </div>
          </div>
        </div>
      </div>
      <div id="big-cards-holder" key="big" v-else>
        <div id="scroll">
          <div class="space">&nbsp;</div>
          <div class="container" @click="open('/watermark', '图片加水印工具')">
            <div class="card">
              <i class="fas fa-feather-alt icon"></i>
              <div class="title">图片加水印工具</div>
            </div>
          </div>
          <div class="container" @click="open('/splicer', '长图拼接工具')">
            <div class="card">
              <i class="fas fa-images icon"></i>
              <div class="title">长图拼接工具</div>
            </div>
          </div>
          <div class="container" @click="open('/cropper', '图片裁剪工具')">
            <div class="card">
              <span class="fas fa-crop-alt icon"></span>
              <div class="title">图片裁剪工具</div>
            </div>
          </div>
          <div class="container" @click="open('/slicer', '图片分割工具')">
            <div class="card">
              <i class="fas fa-th icon"></i>
              <div class="title">图片分割工具</div>
            </div>
          </div>
          <div class="container" @click="open('/textToImage', '富文本制图工具')">
            <div class="card">
              <span class="fas fa-file-alt icon"></span>
              <div class="title">富文本制图工具</div>
            </div>
          </div>
          <div class="container" @click="open('/resizer', '尺寸调整工具')">
            <div class="card">
              <span class="fas fa-compress icon"></span>
              <div class="title">尺寸调整工具</div>
            </div>
          </div>
          <div class="container" @click="open('/compress', '图片压缩工具')">
            <div class="card">
              <span class="fas fa-compress-arrows-alt icon"></span>
              <div class="title">图片压缩工具</div>
            </div>
          </div>
          <div class="container" @click="open('/convert', '格式转换工具')">
            <div class="card">
              <span class="fas fa-sync-alt icon"></span>
              <div class="title">格式转换工具</div>
            </div>
          </div>
          <div class="container" @click="open('/exif', 'EXIF 读取工具')">
            <div class="card">
              <span class="fas fa-camera icon"></span>
              <div class="title">EXIF 读取工具</div>
            </div>
          </div>
          <div class="container" @click="open('/palette', '色彩提取工具')">
            <div class="card">
              <span class="fas fa-palette icon"></span>
              <div class="title">色彩提取工具</div>
            </div>
          </div>
          <div class="container" @click="open('/fonts', '字体管理工具')">
            <div class="card">
              <span class="fas fa-font icon"></span>
              <div class="title">字体管理工具</div>
            </div>
          </div>
          <div class="space">&nbsp;</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import AES from 'crypto-js/aes'

const os = require('os')

export default {
  name: 'index',
  data() {
    return {
      totalMessages: 0,
      changeLog: [],
    }
  },
  methods: {
    minimize() {
      ipcRenderer.send('minimize')
    },
    hide() {
      ipcRenderer.send('hide')
    },
    exit() {
      if (ipcRenderer.sendSync('index-only')) {
        ipcRenderer.send('exit')
      } else {
        this.$dialog({
          type: 'warning',
          title: '操作确认',
          text: '即将退出程序，正在运行的所有工具都将关闭。您确定要退出吗？',
          showCancel: true,
          confirmFunction: () => {
            this.$store.dispatch('watermark/fileListEmpty')
            this.$store.dispatch('slicer/fileListEmpty')
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
    checkMessage() {
      this.$http.get('https://api.potatofield.cn/image_toolkit/message/latest').then((res) => {
        let message = res.data
        if (this.$store.state.messages.messageList.indexOf(message.id) == -1) {
          this.$dialog({
            title: message.title,
            text: message.text
          })
          this.$store.dispatch('messages/markRead', message.id)
        }
      })
    }
  },
  computed: {
    unreadMessages() {
      return this.totalMessages - this.$store.state.messages.messageList.length
    }
  },
  updated() {
    if (document.getElementById('scroll')) {
      document.getElementById('scroll').addEventListener('mousewheel', (event) => {
        if (document.getElementById('scroll')) {
            document.getElementById('scroll').scrollLeft -= event.wheelDelta / 5
            event.preventDefault()
        }
      })
    }
  },
  mounted() {
    if (this.$store.state.fonts.fontList.length && this.$store.state.fonts.fontList[0].verbose) {
      const newFontList = this.$store.state.fonts.fontList.map(font => ({
        fontFile: font.src,
        previewImage: font.image,
        fontFamily: font.verbose,
        fontStyle: font.style,
        language: font.language === '中文' ? 1 : 2,
        isDefault: font.isDefault,
        builtin: font.builtin,
      }))
      this.$store.dispatch('fonts/fontListAssign', newFontList)
    }
    this.$http.get('https://api.potatofield.cn/image_toolkit/version/list').then((res) => {
      this.changeLog = res.data.list
    })
    ipcRenderer.on('exit', () => {
      this.exit()
    })
    ipcRenderer.send('scale', this.$store.state.settings.scale)
    ipcRenderer.send('check-for-update')
    ipcRenderer.once('update-not-available', () => {
      this.checkMessage()
    })
    ipcRenderer.once('update-available', (event, info) => {
      const releaseDate = Number(info.releaseDate.slice(0, 4)) + " 年 "
      + Number(info.releaseDate.slice(5, 7)) + " 月 "
      + Number(info.releaseDate.slice(8, 10)) + " 日"
      this.$dialog({
        title: '发现新版本',
        text: '当前最新版本为 ' + info.version + `，发布于 ${releaseDate}。`,
        content: this.$createElement('div', null, [
          this.$createElement('p', {
            style: {
              'line-height': '24px',
              'font-size': '12px',
              'text-align': 'justify',
              'text-indent': '0'
            }
          }, '新版本特性如下：'),
          this.$createElement('ul', {
            style: {
              'padding-inline-start': '2em'
            }
          }, info.releaseNotes.split('\n').map((releaseNote) => {
            return this.$createElement('li', {
              style: {
                'line-height': '24px',
                'font-size': '12px',
                'text-align': 'justify',
                'text-indent': '0'
              }
            }, releaseNote)
          })),
          this.$createElement('p', {
            style: {
              'line-height': '24px',
              'font-size': '12px',
              'text-align': 'justify',
              'text-indent': '0'
            }
          }, '版本历史：'),
          this.$createElement('ul', {
            style: {
              'padding-inline-start': '2em'
            }
          }, [
            this.changeLog.slice(1, 10).map((log, index) => {
              return [
                this.$createElement('li', {
                  style: {
                    'line-height': '24px',
                    'font-size': '12px',
                    'text-align': 'justify',
                    'text-indent': '0',
                    'margin-block-start': index == 0 ? '0' : '1em'
                  }
                }, `版本号：${log.code}`),
                ...(log.features.split('\n').map((feature) => {
                  return this.$createElement('li', {
                    style: {
                      'line-height': '24px',
                      'font-size': '12px',
                      'text-align': 'justify',
                      'text-indent': '0',
                      'margin-left': '1em',
                      'list-style': 'circle'
                    }
                  }, feature)
                }))
              ]
            })
          ]),
          this.$createElement('p', {
            style: {
              'line-height': '24px',
              'font-size': '12px',
              'text-align': 'justify',
              'text-indent': '0'
            }
          }, '更多历史版本请访问官方网站查看。')
        ]),
        showCancel: true,
        cancelText: '忽略',
        confirmText: '更新',
        confirmFunction: () => {
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
                text: '下载更新的过程中出现错误。您可以在下次启动程序时重试，也可以点击“确定”按钮手动下载最新版本安装包进行覆盖安装。',
                content: null,
                showConfirm: true,
                showCancel: true,
                confirmFunction: () => {
                  shell.openExternal(`https://files.potatofield.cn/ImageToolkit/Packages/${info.path}`)
                }
              }).then(() => {
                ipcRenderer.removeAllListeners('update-download-progress')
              })
            })
            ipcRenderer.send('download-update')
          })
        },
        cancelFunction: () => {
          this.checkMessage()
        }
      })
    })
    document.body.id = 'index-wrapper'
    this.$http.get('https://api.potatofield.cn/image_toolkit/message/list').then((res) => {
      this.totalMessages = res.data.count
    }).catch(() => {})
    let version = ipcRenderer.sendSync('version')
    let platform = os.platform()
    if (this.$store.state.settings.identifier) {
      this.$http.post('https://api.potatofield.cn/image_toolkit/client/register', {
        identifier: this.$store.state.settings.identifier,
        version: version
      })
    } else {
      let identifier = AES.encrypt('potatofield' + String(new Date()) + String(Math.random()), version).toString()
      this.$store.dispatch('settings/setIdentifier', identifier).then(() => {
        this.$http.post('https://api.potatofield.cn/image_toolkit/client/register', {
          identifier: identifier,
          version: version,
          platform: platform
        })
      })
    }
  }
}
</script>

<style lang="scss">
#index-wrapper {

  .v-modal {
    margin: 6px;
    border-radius: 20px;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: unset;
    height: unset;
  }

  #index {
    width: 100%;
    height: 100%;
    padding: 6px;
    box-sizing: border-box;
    -webkit-app-region: drag;

    #content {
      width: 100%;
      height: 100%;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
      background-color: #FFFFFF;
      padding: 60px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      #title-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        #logo {
          width: 50px;
          height: 50px;
          object-fit: contain;
        }
        
        #title {
          margin-left: 10px;
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
          width: 4em;
          margin-left: 3px;
          margin-right: 3px;
          transition: 0.2s;
          -webkit-app-region: no-drag;
          
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
      
      #small-cards-holder {
        width: 100%;
        -webkit-app-region: no-drag;

        #wrapper {
          display: flex;
          flex-wrap: wrap;

          .container {
            width: calc(100% / 6);
            padding: 5px;
            box-sizing: border-box;

            .card {
              width: 100%;
              height: 120px;
              border-radius: 12px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              font-size: 14px;
              text-align: center;
              box-shadow: 0 0 12px var(--card-shadow);
              transition: 0.2s;
              
              .icon {
                font-size: 40px;
              }
              
              .title {
                font-size: 12px;
                margin-top: 10px;
              }
              
              &:hover {
                transform: scale(1.05);
                color: var(--main-color);
              }
              
              &:active {
                filter: brightness(0.9);
              }
            }
          }
        }
      }

      #big-cards-holder {
        width: 100%;
        position: relative;
        -webkit-app-region: no-drag;
        
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
              border-radius: 12px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              font-size: 14px;
              text-align: center;
              box-shadow: 0 0 12px var(--card-shadow);
              transition: 0.2s;
              
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
  }
}
</style>
