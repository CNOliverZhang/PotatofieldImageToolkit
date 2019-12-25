<template>
  <div id="index">
    <div id="title-bar">
      <img class="logo" :src="require('../assets/logo.png')"/>
      <div class="title">洋芋田图像工具箱</div>
      <div class="flex-space"></div>
      <div class="control-button interactable">
        <span class="fa fa-question-circle icon"></span>
        <div>关于</div>
      </div>
      <div class="control-button interactable" @click="hide">
        <span class="fa fa-angle-double-down icon"></span>
        <div>隐藏</div>
      </div>
      <div class="control-button interactable" @click="exit">
        <span class="fa fa-sign-out-alt icon"></span>
        <div>退出</div>
      </div>
    </div>
    <div id="cards-holder" class="interactable">
      <div id="scroll">
        <div class="space">&nbsp;</div>
        <el-card shadow="always" class="card">
          <span class="fa fa-sign-out-alt icon"></span>
          <div class="title">水印工具</div>
          <div class="mask">喝海河</div>
        </el-card>
        <el-card shadow="always" class="card">
          <span class="fa fa-sign-out-alt icon"></span>
          <div class="title">水印工具</div>
          <div class="mask">喝海河</div>
        </el-card>
        <el-card shadow="always" class="card">
          <span class="fa fa-sign-out-alt icon"></span>
          <div class="title">水印工具</div>
          <div class="mask">喝海河</div>
        </el-card>
        <el-card shadow="always" class="card">
          <span class="fa fa-sign-out-alt icon"></span>
          <div class="title">水印工具</div>
          <div class="mask">喝海河</div>
        </el-card>
        <el-card shadow="always" class="card">
          <span class="fa fa-sign-out-alt icon"></span>
          <div class="title">水印工具</div>
          <div class="mask">喝海河</div>
        </el-card>
        <el-card shadow="always" class="card">
          <span class="fa fa-sign-out-alt icon"></span>
          <div class="title">水印工具</div>
          <div class="mask">喝海河</div>
        </el-card>
        <div class="space">&nbsp;</div>
      </div>
    </div>
  </div>
</template>

<script>
const ipcRenderer = require('electron').ipcRenderer

export default {
  name: 'index',
  data () {
    return {
      
    }
  },
  methods: {
    hide() {
      ipcRenderer.send('minimize')
    },
    exit() {
      ipcRenderer.send('exit')
    },
    open (path) {
      ipcRenderer.send('open', path)
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
  padding: 60px;
  
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
      color: #606266;
      transition: 0.2s;
      
      .icon {
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
      
      .card {
        width: 200px;
        height: 200px;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 10px;
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
        }
        
        .mask {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          z-index: 1;
          background-color: #2196F3;
          color: #FFFFFF;
          opacity: 0;
          transition: 0.2s;
          
          &:hover {
            opacity: 1;
          }
          
          &:active {
            filter: brightness(0.9);
          } 
        }
        
        &:first-child {
          margin-left: 0;
        }
        
        &:last-child {
          margin-right: 0;
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
          background-color: #EBEEF5;
        }
      }
      
      &::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background-color: #DCDFE6;
        z-index: 3;
        
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
