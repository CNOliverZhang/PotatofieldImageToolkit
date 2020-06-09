<template>
  <div id="fonts">
    <div id="header">
      <div id="title">字体管理工具</div>
      <div id="minimize" class="control-button" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div id="close" class="control-button" @click="close">
        <object data="static/images/close.svg" type="image/svg+xml"></object>
      </div>
    </div>
    <el-tabs type="card" tab-position="top" id="content">
      <el-tab-pane>
        <span slot="label"><i class="fas fa-font"></i> 本地字体</span>
        <div class="tab-content">
          <div class="container" v-if="localFontsChinese && localChineseFonts.length != 0">
            <div
              v-for="font in localChineseFonts.slice(localFontListPage * 6 - 6, localFontListPage * 6)"
              :key="font.fontFamily"
              class="card-container">
              <el-card class="card">
                <div>
                  <img :src="font.image" class="font-preview">
                  <div class="row">
                    <div class="text">名称：{{ font.verbose }}</div>
                  </div>
                  <div class="row">
                    <div class="text">字形：{{ font.style }}</div>
                  </div>
                </div>
                <div class="row actions">
                  <div v-if="font.isDefault" class="action">
                    <span class="fa fa-cog"></span>
                    <div>当前默认字体</div>
                  </div>
                  <div v-else class="action active" @click="setDefaultFont(font.fontFamily)">
                    <span class="fa fa-cog"></span>
                    <div>设为默认字体</div>
                  </div>
                  <div v-if="font.builtin" class="action">
                    <span class="fa fa-trash-alt"></span>
                    <div>内置字体无法删除</div>
                  </div>
                  <div v-if="font.isDefault && !font.builtin" class="action">
                    <span class="fa fa-trash-alt"></span>
                    <div>默认字体无法删除</div>
                  </div>
                  <div v-if="!font.isDefault && !font.builtin" class="action active" @click="deleteFont(font.originalIndex)">
                    <span class="fa fa-trash-alt"></span>
                    <div>删除本地字体</div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          <div class="container" v-if="!localFontsChinese && localEnglishFonts.length != 0">
            <div
              v-for="font in localEnglishFonts.slice(localFontListPage * 6 - 6, localFontListPage * 6)"
              :key="font.fontFamily"
              class="card-container">
              <el-card class="card">
                <div>
                  <img :src="font.image" class="font-preview">
                  <div class="row">
                    <div class="text">名称：{{ font.verbose }}</div>
                  </div>
                  <div class="row">
                    <div class="text">字形：{{ font.style }}</div>
                  </div>
                </div>
                <div class="row actions">
                  <div v-if="font.isDefault" class="action">
                    <span class="fa fa-cog"></span>
                    <div>当前默认字体</div>
                  </div>
                  <div v-else class="action active" @click="setDefaultFont(font.fontFamily)">
                    <span class="fa fa-cog"></span>
                    <div>设为默认字体</div>
                  </div>
                  <div v-if="font.builtin" class="action">
                    <span class="fa fa-trash-alt"></span>
                    <div>内置字体无法删除</div>
                  </div>
                  <div v-if="font.isDefault && !font.builtin" class="action">
                    <span class="fa fa-trash-alt"></span>
                    <div>默认字体无法删除</div>
                  </div>
                  <div v-if="!font.isDefault && !font.builtin" class="action active" @click="deleteFont(font.originalIndex)">
                    <span class="fa fa-trash-alt"></span>
                    <div>删除本地字体</div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          <div class="container" v-if="(localFontsChinese && localChineseFonts.length == 0) || (!localFontsChinese && localEnglishFonts.length == 0)">
            <div  class="empty-container">
              <div class="empty">
                <i class="fas fa-folder-open"></i>
                <div>尚无符合要求的字体</div>
              </div>
            </div>
          </div>
          <div class="row">
            <el-pagination
              v-if="localFontsChinese"
              small
              background
              layout="prev, pager, next"
              :pager-count="5"
              :page-size="6"
              :total="localChineseFonts.length"
              :current-page="localFontListPage"
              @current-change="localFontListPageChange">
            </el-pagination>
            <el-pagination
              v-else
              small
              background
              layout="prev, pager, next"
              :pager-count="5"
              :page-size="6"
              :total="localEnglishFonts.length"
              :current-page="localFontListPage"
              @current-change="localFontListPageChange">
            </el-pagination>
            <el-switch
              v-model="localFontsChinese"
              active-color="var(--main-color)"
              inactive-color="var(--main-color)"
              active-text="中文字体"
              inactive-text="英文字体"
              @change="switchLanguage"></el-switch>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="fas fa-globe"></i> 在线字体</span>
        <div class="tab-content">
          <div class="container" v-if="onlineFontsChinese && onlineChineseFonts.length != 0">
            <div
              v-for="font in onlineChineseFonts.slice(onlineFontListPage * 6 - 6, onlineFontListPage * 6)"
              :key="font.fontFamily"
              class="card-container">
              <el-card class="card">
                <div>
                  <img :src="font.image" class="font-preview">
                  <div class="row">
                    <div class="text">名称：{{ font.verbose }}</div>
                  </div>
                  <div class="row">
                    <div class="text">字形：{{ font.style }}</div>
                  </div>
                </div>
                <div class="row actions">
                  <div v-if="font.downloaded" key="downloaded" class="action">
                    <span class="fa fa-check"></span>
                    <div>已下载字体</div>
                  </div>
                  <div v-else key="download" class="action active" @click="downloadFont(font)">
                    <span class="fa fa-download"></span>
                    <div>下载字体</div>
                  </div>
                  <div v-if="font.downloaded" key="install" class="action active" @click="installFont(font.fontFamily)">
                    <span class="fa fa-desktop"></span>
                    <div>安装到操作系统</div>
                  </div>
                  <div v-else key="explorer" class="action active" @click="downloadFontUsingExplorer(font.src)">
                    <span class="fab fa-chrome"></span>
                    <div>用浏览器下载</div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          <div class="container" v-if="!onlineFontsChinese && onlineEnglishFonts.length != 0">
            <div
              v-for="font in onlineEnglishFonts.slice(onlineFontListPage * 6 - 6, onlineFontListPage * 6)"
              :key="font.fontFamily"
              class="card-container">
              <el-card class="card">
                <div>
                  <img :src="font.image" class="font-preview">
                  <div class="row">
                    <div class="text">名称：{{ font.verbose }}</div>
                  </div>
                  <div class="row">
                    <div class="text">字形：{{ font.style }}</div>
                  </div>
                </div>
                <div class="row actions">
                  <div v-if="font.downloaded" key="downloaded" class="action">
                    <span class="fa fa-check"></span>
                    <div>已下载字体</div>
                  </div>
                  <div v-else key="download" class="action active" @click="downloadFont(font)">
                    <span class="fa fa-download"></span>
                    <div>下载字体</div>
                  </div>
                  <div v-if="font.downloaded" key="install" class="action active" @click="installFont(font.fontFamily)">
                    <span class="fa fa-desktop"></span>
                    <div>安装到操作系统</div>
                  </div>
                  <div v-else key="explorer" class="action active" @click="downloadFontUsingExplorer(font.src)">
                    <span class="fab fa-chrome"></span>
                    <div>用浏览器下载</div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          <div class="container" v-if="onlineFonts.length == 0">
            <div class="empty-container">
              <div class="empty">
                <i class="fas fa-folder-open"></i>
                <div>未获取到字体</div>
              </div>
            </div>
          </div>
          <div class="row">
            <el-pagination
              v-if="onlineFontsChinese"
              small
              background
              layout="prev, pager, next"
              :pager-count="5"
              :page-size="6"
              :total="onlineChineseFonts.length"
              :current-page="onlineFontListPage"
              @current-change="onlineFontListPageChange">
            </el-pagination>
            <el-pagination
              v-else
              small
              background
              layout="prev, pager, next"
              :pager-count="5"
              :page-size="6"
              :total="onlineEnglishFonts.length"
              :current-page="onlineFontListPage"
              @current-change="onlineFontListPageChange">
              </el-pagination>
            <el-switch
              v-model="onlineFontsChinese"
              active-color="var(--main-color)"
              inactive-color="var(--main-color)"
              active-text="中文字体"
              inactive-text="英文字体"
              @change="switchLanguage"></el-switch>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ipcRenderer, shell } from 'electron'
import CreateDirectory from '../utils/CreateDirectory'

const path = require('path')
const fs = require('fs')
const stream = require('stream')

export default {
  name: 'fonts',
  data () {
    return {
      fontsPath: '',
      onlineFonts: [],
      localFontListPage: 1,
      localFontsChinese: true,
      onlineFontListPage: 1,
      onlineFontsChinese: true
    }
  },
  computed: {
    localFonts() {
      let fonts = new Set()
      this.$store.state.fonts.fontList.forEach((font) => {
        fonts.add(font.fontFamily)
      })
      return fonts
    },
    localChineseFonts() {
      return this.$store.state.fonts.fontList.slice().map((font, index) => {
        font.originalIndex = index
        font.isDefault = font.fontFamily == this.$store.state.fonts.defaultFont
        return font
      }).filter((font) => {
        return font.language == '中文'
      })
    },
    localEnglishFonts() {
      return this.$store.state.fonts.fontList.slice().map((font, index) => {
        font.originalIndex = index
        font.isDefault = font.fontFamily == this.$store.state.fonts.defaultFont
        return font
      }).filter((font) => {
        return font.language == '英文'
      })
    },
    onlineChineseFonts() {
      return this.onlineFonts.map((font) => {
        font.downloaded = this.localFonts.has(font.fontFamily)
        return font
      }).filter((font) => {
        return font.language == '中文'
      })
    },
    onlineEnglishFonts() {
      return this.onlineFonts.map((font) => {
        font.downloaded = this.localFonts.has(font.fontFamily)
        return font
      }).filter((font) => {
        return font.language == '英文'
      })
    }
  },
  methods: {
    minimize() {
      ipcRenderer.send('minimize')
    },
    close() {
      ipcRenderer.send('close')
      this.$destroy()
    },
    localFontListPageChange(page) {
      this.localFontListPage = page
    },
    onlineFontListPageChange(page) {
      this.onlineFontListPage = page
    },
    switchLanguage() {
      this.localFontListPage = 1
      this.onlineFontListPage = 1
    },
    setDefaultFont(fontFamily) {
      this.$dialog({
        title: '操作确认',
        text: '更改默认字体后本程序将重启，确定执行操作吗？',
        showCancel: true,
        confirmFunction: () => {
          this.$store.dispatch('fonts/setDefaultFont', fontFamily)
          ipcRenderer.send('relaunch')
        }
      })
    },
    deleteFont(index) {
      this.$dialog({
        title: '操作确认',
        text: '确定要删除这个字体吗？',
        showCancel: true,
        confirmFunction: () => {
          try {
            fs.unlinkSync(this.$store.state.fonts.fontList[index].src)
            fs.unlinkSync(this.$store.state.fonts.fontList[index].image)
            fs.rmdirSync(path.join(this.fontsPath, this.$store.state.fonts.fontList[index].verbose))
            if (this.localFontListPage != 1) {
              if (this.localFontsChinese && (this.localFontListPage == Math.ceil(this.localChineseFonts.length / 6))) {
                if (this.localChineseFonts.length % 6 == 1) {
                  this.localFontListPage -= 1
                }
              }
              if (!this.localFontsChinese && (this.localFontListPage == Math.ceil(this.localEnglishFonts.length / 6))) {
                if (this.localEnglishFonts.length % 6 == 1) {
                  this.localFontListPage -= 1
                }
              }
            }
            this.$store.dispatch('fonts/fontListDelete', index)
            this.$dialog({
              type: 'success',
              title: '成功',
              text: '字体已从本程序的字体库中删除。'
            })
          } catch(e) {
            this.$dialog({
              type: 'error',
              title: '出现错误',
              text: '发生了未知错误，字体删除失败。'
            })
          }
        }
      })
    },
    downloadFont(font) {
      this.$dialog({
        title: '正在下载',
        text: '即将完成，请耐心等待。',
        showConfirm: false
      }).then((dialog) => {
        let image, fontFile
        this.$http({
          url: font.image,
          method: 'get',
          responseType: 'arraybuffer'
        }).catch((error) => {
          dialog.change({
            type: 'error',
            title: '出现错误',
            text: '下载字体失败，请检查您的网络。',
            showConfirm: true
          })
        }).then((res) => {
          image = new Uint8Array(res.data)
          this.$http({
            url: font.src,
            method: 'get',
            responseType: 'arraybuffer',
            onDownloadProgress: (download) => {
              let progress = Math.round(100 * (download.loaded / download.total))
              dialog.change({
                text: '',
                content: this.$createElement('el-progress', {
                  'props': {
                    'text-inside': true,
                    'stroke-width': 20,
                    'percentage': Math.round(progress)
                  }
                })
              })
            }
          }).catch((error) => {
            dialog.change({
              type: 'error',
              title: '出现错误',
              text: '下载字体失败，请检查您的网络。',
              content: null,
              showConfirm: true
            })
          }).then((res) => {
            fontFile = new Uint8Array(res.data)
            let fontFilename = decodeURI(font.src.split('/').pop())
            let imageFilename = decodeURI(font.image.split('/').pop())
            try {
              let directory = path.join(this.fontsPath, font.verbose)
              CreateDirectory(directory)
              fs.writeFileSync(path.join(directory, fontFilename), fontFile, 'binary')
              fs.writeFileSync(path.join(directory, imageFilename), image, 'binary')
              this.$store.dispatch('fonts/fontListPush', {
                fontFamily: font.fontFamily,
                verbose: font.verbose,
                style: font.style,
                language: font.language,
                src: path.join(directory, fontFilename).split(path.sep).join('/'),
                image: path.join(directory, imageFilename).split(path.sep).join('/'),
                builtin: false
              })
              dialog.change({
                type: 'success',
                title: '成功',
                text: '字体已安装到本程序的字体库中。',
                content: null,
                showConfirm: true
              })
            } catch(e) {
              dialog.change({
                type: 'error',
                title: '出现错误',
                text: '发生了未知错误，安装字体失败。',
                content: null,
                showConfirm: true
              })
            }
          })
        })
      })
    },
    installFont(fontFamily) {
      for (let i = 0; i < this.$store.state.fonts.fontList.length; i++) {
        if (this.$store.state.fonts.fontList[i].fontFamily == fontFamily) {
          shell.openItem(this.$store.state.fonts.fontList[i].src)
          return
        }
      }
    },
    downloadFontUsingExplorer(url) {
      shell.openExternal(url)
    }
  },
  mounted() {
    this.fontsPath = path.join(ipcRenderer.sendSync('app-data-path'), 'fonts')
    this.$dialog({
      title: '正在获取字体',
      text: '正在向服务器请求在线字体数据，请稍候。',
      showConfirm: false
    }).then((dialog) => {
      this.$http.get('https://api.potatofield.cn/fontlibrary/fonts').catch((error) => {
        dialog.change({
          type: 'error',
          title: '出现错误',
          text: '获取在线字体列表失败，请检查您的网络。您仍可以查看本地字体。',
          showConfirm: true
        })
      }).then((res) => {
        res.data.forEach((font) => {
          font.fontFamily = font.font_family
          delete font.font_family
        })
        this.onlineFonts = res.data
        dialog.close()
      })
    })
  }
}
</script>

<style lang="scss">
#fonts {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  button {
    font-family: var(--main-font);
  }
  
  #header {
    padding-left: 20px;
    padding-right: 20px;
    box-sizing: border-box;
    flex-basis: 40px;
    background-color: var(--dark-gray);
    display: flex;
    align-items: center;
    z-index: 3000;
    -webkit-app-region: drag;

    #title {
      color: var(--white);
      font-size: 16px;
      flex-grow: 1;
    }

    .control-button {
      -webkit-app-region: no-drag;
      width: 20px;
      height: 20px;
      margin-left: 5px;
      margin-right: 5px;
      border-radius: 10px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;

      object {
        width: 50%;
        color: var(--white);
      }

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;
      }

      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        border-radius: 50%;
        transition: 0.2s;
      }

      &:hover::after {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }

    #minimize {
      background-color: var(--success-green);
    }

    #close {
      background-color: var(--warning-red);
    }
  }

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
            color: var(--light-gray);
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
    
    .el-tabs__content {
      flex-grow: 1;
      
      .el-tab-pane {
        width: 100%;
        height: 100%;
        
        .tab-content {
          width: 100%;
          height: 100%;
          padding: 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
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
      
      .el-switch {
        display: flex;
        justify-content: flex-end;
      }
      
      &:first-child {
        margin-top: 0;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .bar-button {
      width: 0;
      height: 28px;
      flex-grow: 1;
      box-sizing: border-box;
      border: none;
      padding-left: 0;
      padding-right: 0;
      margin-left: 5px;
      margin-right: 5px;
      
      &:first-child {
        margin-left: 0;
      }
      
      &:last-child {
        margin-right: 0;
      }
    }
    
    .container {
      width: 100%;
      height: 0;
      flex-grow: 1;
      display: flex;
      flex-wrap: wrap;
      
      .card-container {
        width: calc(100% / 3);
        height: 50%;
        box-sizing: border-box;
        padding: 10px;
        
        .card {
          width: 100%;
          height: 100%;
          color: var(--dark-gray);
          
          .el-card__body {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            
            .font-preview {
              width: 100%;
            }
            
            .actions {
              width: 100%;
              flex-grow: 1;
              align-items: flex-end;
              
              .action {
                width: 100%;
                display: flex;
                align-items: center;
                color: var(--gray);
                font-size: 12px;
                transition: 0.2s;
                
                svg {
                  font-size: 14px;
                  margin-right: 5px;
                }
              }
              
              .active {
                color: var(--dark-gray);
                cursor: pointer;
                
                &:hover {
                  color: var(--main-color);
                }
                
                &:active {
                  filter: brightness(0.9);
                }
              }
            }
          }
          
          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }
    
    .empty-container {
      width: 100%;
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      
      .empty {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        
        svg {
          font-size: 40px;
          margin: 14px;
        }
      }
    }
    
    .el-pagination {
      padding: 0;
      margin-right: 10px;
      
      li {
        min-width: 24px;
        height: 28px;
        line-height: 28px;
      }
      
      .btn-prev {
        width: 24px;
        height: 28px;
        line-height: 28px;
        margin-left: 0;
      }
      
      .btn-next {
        width: 24px;
        height: 28px;
        line-height: 28px;
        margin-right: 0;
      }
    }
  }
}
</style>
