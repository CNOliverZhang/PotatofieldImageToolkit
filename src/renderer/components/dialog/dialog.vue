<template>
  <el-dialog
    :visible="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="interactable">
    <span slot="title">
      <span v-if="type == 'success'">
        <i class="el-alert__icon el-icon-success"></i>
      </span>
      <span v-if="type == 'warning'">
        <i class="el-alert__icon el-icon-warning"></i>
      </span>
      <span v-if="type == 'error'">
        <i class="el-alert__icon el-icon-error"></i>
      </span>
      <span>{{ title }}</span>
    </span>
    <div class="content">
      <div v-if="text != ''" class="text">{{ text }}</div>
      <div v-if="list.length != 0" v-for="item in list" :key="item" class="list-item">{{ item }}</div>
    </div>
    <span slot="footer">
      <el-button v-if="showCancel" size="mini" @click="cancel">{{ cancelText }}</el-button>
      <el-button type="primary" size="mini" @click="confirm">{{ confirmText }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'potatofield-dialog',
  data () {
    return {
      type: '',
      title: '提示',
      text: '',
      list: [],
      showCancel: false,
      confirmText: '确定',
      cancelText: '取消',
      confirmFunction: function () {},
      cancelFunction: function () {}
    }
  },
  methods: {
    cancel() {
      this.cancelFunction()
      document.body.removeChild(this.$el)
      this.$destroy()
    },
    confirm() {
      this.confirmFunction()
      document.body.removeChild(this.$el)
      this.$destroy()
    }
  }
}
</script>

<style lang="scss">
.el-dialog__wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  .el-dialog {
    margin: 0!important;
  
    .el-dialog__header {
      margin-top: 20px;
      margin-left: 20px;
      margin-right: 20px;
      font-size: 14px;
      padding: 0;
        
      .el-icon-success {
        color: #67C23A;
      }
      
      .el-icon-warning {
        color: #E6A23C;
      }
      
      .el-icon-error {
        color: #F56C6C;
      }
    }
    
    .el-dialog__body {
      margin: 20px;
      padding: 0;
      
      .content {
        width: 100%;
        max-height: 150px;
        overflow-x: hidden;
        overflow-y: auto;
        
        .text {
          margin-bottom: 10px;
          line-height: 18px;
          font-size: 12px;
          text-align: justify;
          text-indent: 2em;
        }
        
        .list-item {
          line-height: 24px;
          font-size: 12px;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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
    }
    
    .el-dialog__footer {
      margin-bottom: 20px;
      margin-left: 20px;
      margin-right: 20px;
      padding: 0;
      
      button {
        font-family: "SourceHanSansSC";
      }
    }
  }
}
</style>
