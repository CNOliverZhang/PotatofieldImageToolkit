<template>
  <div id="editor">
    <div id="file-list" class="interactable">
      <div v-if="this.$store.state.watermark.fileList.length > 100" class="indicator">
        当前在第 {{ fileListPage }} 页，共 {{ totalPages }} 页
      </div>
      <div v-if="this.$store.state.watermark.fileList.length > 100" class="row control-row">
        <el-pagination
          class="interactable"
          small
          background
          layout="prev, jumper, next"
          :page-size="100"
          :total="this.$store.state.watermark.fileList.length"
          :current-page="fileListPage"
          :hide-on-single-page="true"
          @current-change="pageChange">
        </el-pagination>
      </div>
      <div class="list">
        <div
          v-for="(file, index) in this.$store.state.watermark.fileList.slice(fileListPage * 100 - 100, fileListPage * 100)"
          :key="file.fullpath"
          class="file"
          @click="preview(index)">
          <div class="filename">{{ file.name + '.' + file.ext }}</div>
          <div @click.stop="handleDelete(index)">
            <i class="fas fa-trash-alt delete"></i>
          </div>
        </div>
      </div>
    </div>
    <div id="control">
      <div>
        <div id="sample-container">
          <img :src="sample" id="sample" />
          <div
            id="watermark-container"
            :style="{
              'width': sampleWidth + 'px',
              'height': sampleHeight + 'px'
            }">
            <div
              id="watermark"
              :style="{
                'left': (position == 'left-top' || position == 'left-bottom' || position == 'left' || position == 'center' || position == 'top' || position == 'bottom') ? x + 'px' : null,
                'right': (position == 'right-top' || position == 'right-bottom' || position == 'right') ? x + 'px' : null,
                'top': (position == 'left-top' || position == 'right-top' || position == 'top' || position == 'center' || position == 'left' || position == 'right') ? y + 'px' : null,
                'bottom': (position == 'left-bottom' || position == 'right-bottom' || position == 'bottom') ? y + 'px' : null,
                'color': color,
                'font-family': font,
                'font-size': fontSize + 'px',
                'transform': 'rotate(' + rotation + 'deg)'
              }">{{ text }}</div>
          </div>
        </div>
        <div class="row control-row">
          <div class="text">水印内容</div>
          <el-input v-model="text" size="mini" placeholder="请输入水印文字" class="interactable slider"></el-input>
        </div>
        <div class="row control-row">
          <div class="text">水印位置基准</div>
          <el-select v-model="position" placeholder="请选择" size="mini" class="interactable">
            <el-option label="中央" value="center" class="interactable"/>
            <el-option label="左上角" value="left-top" class="interactable"/>
            <el-option label="右上角" value="right-top" class="interactable"/>
            <el-option label="左下角" value="left-bottom" class="interactable"/>
            <el-option label="右下角" value="right-bottom" class="interactable"/>
            <el-option label="上方" value="top" class="interactable"/>
            <el-option label="下方" value="bottom" class="interactable"/>
            <el-option label="左侧" value="left" class="interactable"/>
            <el-option label="右侧" value="right" class="interactable"/>
          </el-select>
        </div>
        <div
          v-if="position == 'left-top' || position == 'left-bottom' || position == 'left' || position == 'right-top' || position == 'right-bottom' || position == 'right'"
          class="row control-row">
          <div v-if="position == 'left-top' || position == 'left-bottom' || position == 'left'" class="text">水印与左边缘的距离</div>
          <div v-if="position == 'right-top' || position == 'right-bottom' || position == 'right'" class="text">水印与右边缘的距离</div>
          <el-slider
            v-model="offsetX"
            class="slider interactable"
            :min="0"
            :max="100"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div
          v-if="position == 'left-top' || position == 'left-bottom' || position == 'top' || position == 'right-top' || position == 'right-bottom' || position == 'bottom'"
          class="row control-row">
          <div v-if="position == 'left-top' || position == 'right-top' || position == 'top'" class="text">水印与上边缘的距离</div>
          <div v-if="position == 'left-bottom' || position == 'right-bottom' || position == 'bottom'" class="text">水印与下边缘的距离</div>
          <el-slider
            v-model="offsetY"
            class="slider interactable"
            :min="0"
            :max="100"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="row control-row">
          <div class="text">水印旋转角度</div>
          <el-slider
            v-model="rotation"
            class="slider interactable"
            :min="-180"
            :max="180"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="row control-row">
          <div class="text">水印字体</div>
          <el-select v-model="font" placeholder="请选择" size="mini" class="interactable">
            <el-option-group label="中英文字体">
              <el-option label="思源黑体(细)" value="NotoSansSCThin" class="interactable" style="font-family: NotoSansSCThin;"/>
              <el-option label="思源黑体(粗)" value="NotoSansSCBlack" class="interactable" style="font-family: NotoSansSCBlack;"/>
              <el-option label="思源宋体(细)" value="NotoSerifSCThin" class="interactable" style="font-family: NotoSerifSCThin;"/>
              <el-option label="思源宋体(粗)" value="NotoSerifSCBlack" class="interactable" style="font-family: NotoSerifSCBlack;"/>
              <el-option label="站酷庆科黄油体" value="ZCoolHuangyou" class="interactable" style="font-family: ZCoolHuangyou;"/>
              <el-option label="站酷小薇LOGO体" value="ZCoolXiaowei" class="interactable" style="font-family: ZCoolXiaowei;"/>
              <el-option label="站酷快乐体" value="ZCoolKuaile" class="interactable" style="font-family: ZCoolKuaile;"/>
              <el-option label="站酷文艺体" value="ZCoolWenyi" class="interactable" style="font-family: ZCoolWenyi;"/>
              <el-option label="站酷酷黑体" value="ZCoolKuhei" class="interactable" style="font-family: ZCoolKuhei;"/>
              <el-option label="站酷高端黑体" value="ZCoolGaoduanhei" class="interactable" style="font-family: ZCoolGaoduanhei;"/>
            </el-option-group>
            <el-option-group label="纯英文字体">
              <el-option label="ZCOOL Addict Italic" value="ZCoolAddict" class="interactable" style="font-family: ZCoolAddict;"></el-option>
            </el-option-group>
          </el-select>
        </div>
        <div class="row control-row">
          <div class="text">水印字体大小</div>
          <el-slider
            v-model="size"
            class="slider interactable"
            :min="1"
            :max="100"
            :step="1"
            :show-input="true"
            input-size="mini"></el-slider>
        </div>
        <div class="row control-row">
          <div class="text">水印颜色</div>
          <el-color-picker v-model="color" size="mini" class="interactable"></el-color-picker>
        </div>
      </div>
      <div class="row control-buttons">
        <el-button type="primary" size="mini" @click="exit" class="control-button interactable">退出编辑器</el-button>
        <el-button type="primary" size="mini" @click="saveAsTemplate" class="control-button interactable">将水印保存为模板</el-button>
        <el-button type="primary" size="mini" @click="start" class="control-button interactable">处理这张图片</el-button>
        <el-button type="primary" size="mini" @click="startAll" class="control-button interactable">处理全部图片</el-button>
      </div>
    </div>
    <div id="templates"></div>
  </div>
</template>

<script>
import { Loading } from 'element-ui'
import ResizeObserver from 'resize-observer-polyfill'
import '../../utils/html2canvas.min.js'

const fs = require('fs')

export default {
  name: 'watermarkEditor',
  data () {
    return  {
      fileListPage: 1,
      sample: '',
      sampleIndex: 0,
      text: '',
      position: 'center',
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      color: '#FFFFFF',
      font: "NotoSansSCThin",
      size: 5,
      sizeBaseX: 0,
      sizeBaseY: 0,
      sampleWidth: 0,
      sampleHeight: 0,
      watermarkWidth: 0,
      watermarkHeight: 0
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.$store.state.watermark.fileList.length / 100)
    },
    fontSize() {
      return this.size * this.sizeBaseX
    },
    x() {
      let watermark = document.getElementById('watermark')
      if (this.position == 'top' || this.position == 'bottom' || this.position == 'center') {
        return ((this.sampleWidth - this.watermarkWidth) / 2)
      } else {
        let ratio = 1 - this.watermarkWidth / this.sampleWidth
        return this.offsetX * this.sizeBaseX * (ratio)
      }
    },
    y() {
      let watermark = document.getElementById('watermark')
      if (this.position == 'left' || this.position == 'right' || this.position == 'center') {
        return ((this.sampleHeight - this.watermarkHeight) / 2)
      } else {
        let ratio = 1 - this.watermarkHeight / this.sampleHeight
        return this.offsetY * this.sizeBaseY * (ratio)
      }
    }
  },
  methods: {
    pageChange(page) {
      this.fileListPage = page
    },
    handleDelete(index) {
      let targetIndex = index + (this.fileListPage - 1) * 100
      this.$store.commit('watermark/del', targetIndex)
      if (this.sampleIndex > targetIndex) {
        this.sampleIndex -= 1
      } else if (this.sampleIndex == targetIndex) {
        this.sampleIndex = 0
        let loading = Loading.service()
        this.sample = this.$store.state.watermark.fileList[0].fullpath
        setTimeout(() => {
          this.resizeWatermarkBase()
          loading.close()
        }, 500)
      }
    },
    resizeWatermarkBase() {
      let sample = document.getElementById('sample')
      let width = window.getComputedStyle(sample).getPropertyValue('width').slice(0, -2)
      let height = window.getComputedStyle(sample).getPropertyValue('height').slice(0, -2)
      this.sampleWidth = width
      this.sampleHeight = height
      this.sizeBaseX = width / 100
      this.sizeBaseY = height / 100
    },
    preview(index) {
      this.sample = this.$store.state.watermark.fileList[index + (this.fileListPage - 1) * 100].fullpath
      this.sampleIndex = index + (this.fileListPage - 1) * 100
      let loading = Loading.service()
      setTimeout(() => {
        this.resizeWatermarkBase()
        loading.close()
      }, 500)
    },
    exit() {
      this.$dialog({
        type: 'warning',
        title: '操作确认',
        text: '您确定要退出编辑器吗？这将清空待处理文件列表。',
        showCancel: true,
        confirmFunction: () => {
          this.$store.commit('watermark/empty')
        }
      })
    },
    saveAsTemplate() {},
    start() {
      if (this.text.length == 0) {
        this.$dialog({
          type: 'warning',
          text: '请您输入水印文字！'
        })
        return
      }
      let imageInfo = this.$store.state.watermark.fileList[this.sampleIndex]
      let img = new Image()
      img.src = this.sample
      let scale = img.width / this.sampleWidth
      let baseCanvas = document.createElement('canvas')
      let context = baseCanvas.getContext("2d")
      baseCanvas.width = img.width
      baseCanvas.height = img.height
      context.drawImage(img, 0, 0)
      html2canvas(document.getElementById('watermark-container'), {
        scale: scale,
        backgroundColor: null
      }).then(canvas => {
        context.drawImage(canvas, 0, 0)
        let url = baseCanvas.toDataURL('image/' + imageInfo.distExt, 1).replace(/^data:image\/\w+;base64,/, "")
        let buffer = new Buffer(url, 'base64')
        fs.writeFile(imageInfo.distFullpath, buffer, (error) => {
          if (error) {
            this.$dialog({
              type: 'error',
              title: '出现错误',
              text: '写入文件失败，请检查目标文件夹权限。'
            })
          } else {
            this.$store.commit('watermark/del', this.sampleIndex)
            this.sampleIndex = 0
            this.sample = this.$store.state.watermark.fileList[0].fullpath
            this.$dialog({
              type: 'success',
              title: '成功',
              text: '处理完成，添加水印后的图片已保存到目标文件夹。',
              confirmFunction: () => {
                this.resizeWatermarkBase()
              }
            })
          }
        })
      })
    },
    startAll() {
      
    }
  },
  mounted() {
    let loading = Loading.service()
    this.sample = this.$store.state.watermark.fileList[0].fullpath
    setTimeout(() => {
      this.resizeWatermarkBase()
      loading.close()
    }, 500)
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        this.watermarkWidth = entry.contentRect.width
        this.watermarkHeight = entry.contentRect.height
      })
    })
    observer.observe(document.getElementById('watermark'))
  }
}
</script>

<style lang="scss">
@font-face {
  font-family: NotoSansSCThin;
  src: url('../../assets/NotoSansSC-Thin.otf');
}

@font-face {
  font-family: NotoSansSCRegular;
  src: url('../../assets/NotoSansSC-Regular.otf');
}

@font-face {
  font-family: NotoSansSCBlack;
  src: url('../../assets/NotoSansSC-Black.otf');
}

@font-face {
  font-family: NotoSerifSCThin;
  src: url('../../assets/NotoSerifSC-ExtraLight.otf');
}

@font-face {
  font-family: NotoSerifSCRegular;
  src: url('../../assets/NotoSerifSC-Regular.otf');
}

@font-face {
  font-family: NotoSerifSCBlack;
  src: url('../../assets/NotoSerifSC-Black.otf');
}

@font-face {
  font-family: ZCoolHuangyou;
  src: url('../../assets/ZCOOLQingKeHuangYou-Regular.ttf');
}

@font-face {
  font-family: ZCoolXiaowei;
  src: url('../../assets/ZCOOLXiaoWei-Regular.ttf');
}

@font-face {
  font-family: ZCoolKuaile;
  src: url('../../assets/ZCOOLKuaiLe-Regular.ttf');
}

@font-face {
  font-family: ZCoolWenyi;
  src: url('../../assets/ZCOOLWenYi-Regular.ttf');
}

@font-face {
  font-family: ZCoolKuhei;
  src: url('../../assets/ZCOOLKuHei-Regular.ttf');
}

@font-face {
  font-family: ZCoolGaoduanhei;
  src: url('../../assets/ZCOOLGaoDuanHei-Regular.ttf');
}

@font-face {
  font-family: ZCoolAddict;
  src: url('../../assets/ZCOOLAddict-Italic.ttf');
}
  
.el-color-picker__panel {
  -webkit-app-region: no-drag;
  
  button {
    font-family: "NotoSansSC";
  }
}

#editor {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  
  button {
    font-family: "NotoSansSC";
  }
  
  input {
    font-family: "NotoSansSC";
  }
  
  #file-list {
    width: 20%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    
    .indicator {
      height: 28px;
      width: 100%;
      line-height: 28px;
      font-size: 14px;
      text-align: center;
      color: #FFFFFF;
      background-color: #2196F3;
      border-radius: 14px;
    }
    
    .list {
      width: 100%;
      flex-grow: 1;
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
    
    .el-pagination {
      width: 100%;
      padding: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .el-pagination__jump {
        margin: 0;
      }
      
      .btn-prev {
        margin: 0;
      }
      
      .btn-next {
        margin: 0;
      }
    }
  }
  
  #control {
    height: 100%;
    margin-left: 10px;
    margin-right: 10px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    #sample-container {
      width: 100%;
      height: 300px;
      background-color: #606266;
      border-radius: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      position: relative;
        
      #sample {
        max-width: 100%;
        max-height: 100%;
      }
      
      #watermark-container {
        position: absolute;
        overflow: hidden;
        white-space: nowrap;
      }
      
      #watermark {
        position: absolute;
        width: fit-content;
        height: fit-content;
        line-height: 1em;
      }
    }
    
    .control-row {
      height: 28px;
      
      .slider {
        width: 70%;
      }
    }
    
    .control-buttons {
      display: flex;
      justify-content: space-between;
      justify-content: flex-end;
    }
    
    .control-button {
      width: 24%;
    }
  }
  
  #templates {
    width: 20%;
    height: 100%;
  }
}
</style>
