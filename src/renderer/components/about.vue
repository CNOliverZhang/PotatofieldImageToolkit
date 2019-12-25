<template>
  <el-tabs type="card" tab-position="left" id="about">
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-info-circle"></i> 使用说明</span>
      <div class="tab-content">内容</div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-code"></i> 版权信息</span>
      <div class="tab-content">内容</div>
    </el-tab-pane>
    <el-tab-pane>
      <span slot="label" class="interactable"><i class="fas fa-sync-alt"></i> 版本更新</span>
      <div class="tab-content">内容</div>
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

export default {
  name: 'about',
  methods: {
    hide() {
      ipcRenderer.send('minimize')
    },
    close() {
      ipcRenderer.send('close')
    }
  }
}
</script>

<style lang="scss">
#about {
  width: 100%;
  height: 100%;
  
  .el-tabs__header {
    margin-right: 0;
    
    .el-tabs__nav-scroll {
      background-color: #EBEEF5;
      
      .el-tabs__nav {
        border: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        
        .el-tabs__item {
          width: 150px;
          height: 50px;
          line-height: 50px;
          color: #606266;
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
          
          &:hover:not(.is-disabled) {
            color: #2196F3;
          }
        }
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
        color: #2196F3;
      }
      
      &:active {
        filter: brightness(0.9);
      }
    }
  }
  
  .tab-content {
    padding: 20px;
  }
}
</style>
