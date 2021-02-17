<template>
  <div id="fonts">
    <div class="page-header">
      <div class="page-title">字体管理工具</div>
      <div class="control-button minimize" @click="minimize">
        <object data="static/images/minimize.svg" type="image/svg+xml"></object>
      </div>
      <div class="control-button close" @click="close">
        <object data="static/images/close.svg" type="image/svg+xml"></object>
      </div>
    </div>
    <el-tabs type="card" tab-position="top" id="content" @tab-click="clearSearch">
      <el-tab-pane>
        <span slot="label"><i class="fas fa-font"></i> 本地字体</span>
        <div class="tab-content">
          <div class="row">
            <el-input size="mini" placeholder="请输入搜索关键词以搜索字体" v-model="searchKeyword">
              <el-button slot="append" size="mini" @click="clearSearch">清除关键词</el-button>
            </el-input>
            <el-button type="primary" size="mini" @click="openDirectory" id="open-directory">打开字体目录</el-button>
          </div>
          <div class="container" v-if="localDisplayFonts.length != 0">
            <div
              v-for="font in localDisplayFonts.slice(localFontListPage * 6 - 6, localFontListPage * 6)"
              :key="font.fontFamily"
              class="card-container">
              <div class="card">
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
              </div>
            </div>
          </div>
          <div class="container" v-else>
            <div  class="empty-container">
              <div class="empty">
                <i class="fas fa-folder-open"></i>
                <div>尚无符合要求的字体</div>
              </div>
            </div>
          </div>
          <div class="row">
            <el-pagination
              small
              background
              layout="prev, pager, next"
              :pager-count="5"
              :page-size="6"
              :total="localDisplayFonts.length"
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
          <div class="row">
            <el-input size="mini" placeholder="请输入搜索关键词以搜索字体" v-model="searchKeyword">
              <el-button slot="append" size="mini" @click="clearSearch">清除关键词</el-button>
            </el-input>
          </div>
          <div class="container" v-if="onlineDisplayFonts.length != 0">
            <div
              v-for="font in onlineDisplayFonts.slice(onlineFontListPage * 6 - 6, onlineFontListPage * 6)"
              :key="font.fontFamily"
              class="card-container">
              <div class="card">
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
              </div>
            </div>
          </div>
          <div class="container" v-else>
            <div class="empty-container">
              <div class="empty">
                <i class="fas fa-folder-open"></i>
                <div>未获取到字体</div>
              </div>
            </div>
          </div>
          <div class="row">
            <el-pagination
              small
              background
              layout="prev, pager, next"
              :pager-count="5"
              :page-size="6"
              :total="onlineDisplayFonts.length"
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

export default {
  name: 'fonts',
  data () {
    return {
      fontsPath: '',
      onlineFonts: [],
      localFontListPage: 1,
      localFontsChinese: true,
      onlineFontListPage: 1,
      onlineFontsChinese: true,
      searchKeyword: '',
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
    localDisplayFonts() {
      let language
      if (this.localFontsChinese) {
        language = '中文'
      } else {
        language = '英文'
      }
      return this.$store.state.fonts.fontList.slice().map((font, index) => {
        font.originalIndex = index
        font.isDefault = font.fontFamily == this.$store.state.fonts.defaultFont
        return font
      }).filter((font) => {
        if (this.searchKeyword != '' && !font.verbose.includes(this.searchKeyword)) {
          return false
        }
        if (font.language != language) {
          return false
        }
        return true
      })
    },
    onlineDisplayFonts() {
      let language
      if (this.onlineFontsChinese) {
        language = '中文'
      } else {
        language = '英文'
      }
      return this.onlineFonts.map((font) => {
        font.downloaded = this.localFonts.has(font.fontFamily)
        return font
      }).filter((font) => {
        if (this.searchKeyword != '' && !font.verbose.includes(this.searchKeyword)) {
          return false
        }
        if (font.language != language) {
          return false
        }
        return true
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
      this.clearSearch()
    },
    clearSearch() {
      this.searchKeyword = ''
    },
    openDirectory() {
      if (!fs.existsSync(this.fontsPath) || !fs.statSync(this.fontsPath).isDirectory()) {
        CreateDirectory(this.fontsPath)
      }
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '即将打开字体库目录，您可以随意查看和使用已下载的字体。但为保证本程序正常工作，请勿从目录中删除或修改任何文件。',
        showCancel: true,
        confirmFunction: () => {
          shell.openExternal(this.fontsPath)
        }
      })
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
              if (this.localFontListPage == Math.ceil(this.localDisplayFonts.length / 6)) {
                if (this.localDisplayFonts.length % 6 == 1) {
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
          shell.openPath(this.$store.state.fonts.fontList[i].src)
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

    #open-directory {
      margin-left: 10px;
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
          padding: 20px;
          box-sizing: border-box;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 12px var(--card-shadow);
          transition: 0.2s;
          
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
  }
}
</style>
