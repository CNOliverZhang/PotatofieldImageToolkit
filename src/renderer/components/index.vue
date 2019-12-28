<template>
  <div id="index">
    <div id="title-bar">
      <img class="logo" :src="require('../assets/logo.png')"/>
      <div class="title">洋芋田图像工具箱</div>
      <div class="flex-space"></div>
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
            <span class="fas fa-crop icon"></span>
            <div class="title">裁剪工具</div>
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
            <span class="fas fa-magic icon"></span>
            <div class="title">滤镜美化</div>
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
      let that = this
      ipcRenderer.send('open', {
        title: title,
        path: path
      })
      ipcRenderer.once('same-window-exists', function () {
        that.$message.closeAll()
        that.$message("不支持同时打开两个相同窗口")
      })
    },
    showDeveloping () {
      this.$message.closeAll()
      this.$message("功能正在开发中")
    }
  },
  mounted() {
    document.getElementById('scroll').addEventListener('mousewheel', function(event) {
      document.getElementById('scroll').scrollLeft -= event.wheelDelta / 5
      event.preventDefault()
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
    
    .logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }
    
    .title {
      margin-left: 20px;
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
        width: 16px;
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
          background-color: #DCDFE6;//#EBEEF5;
        }
      }
      
      &::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background-color: #DCDFE6;
        z-index: 3;
        transition: 0.2s;
        
        &:hover {
          background-color: #606266;//#C0C4CC;
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
