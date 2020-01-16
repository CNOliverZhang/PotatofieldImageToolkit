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
      <p v-if="text != ''">{{ text }}</p>
      <slot></slot>
    </div>
    <span v-if="showCancel || showConfirm" slot="footer">
      <el-button v-if="showCancel" size="mini" @click="cancel">{{ cancelText }}</el-button>
      <el-button v-if="showConfirm" type="primary" size="mini" @click="confirm">{{ confirmText }}</el-button>
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
      showCancel: false,
      showConfirm: true,
      confirmText: '确定',
      cancelText: '取消',
      confirmFunction: function () {},
      cancelFunction: function () {}
    }
  },
  methods: {
    cancel() {
      this.cancelFunction()
      this.close()
    },
    confirm() {
      this.confirmFunction()
      this.close()
    },
    close() {
      document.body.removeChild(this.$el)
      this.$destroy()
    },
    change(args) {
      this.type = args.type ? args.type : this.type
      this.title = args.title ? args.title : this.title
      this.text = args.text ? args.text : this.text
      this.confirmText = args.confirmText ? args.confirmText : this.confirmText
      this.cancelText = args.cancelText ? args.cancelText : this.cancelText
      this.confirmFunction = args.confirmFunction ? args.confirmFunction : this.confirmFunction
      this.cancelFunction = args.cancelFunction ? args.cancelFunction : this.cancelFunction
      if (args.showConfirm === true || false) {
        this.showConfirm = args.showConfirm
      }
      if (args.showCancel === true || false) {
        this.showCancel = args.showCancel
      }
      if (args.content !== undefined) {
        this.$slots.default = [args.content]
        this.$mount()
      }
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
        
        p {
          margin: 0;
          line-height: 18px;
          font-size: 12px;
          text-align: justify;
          text-indent: 2em;
        }
        
        div {
          margin-top: 10px;
          margin-bottom: 10px;
          
          &:first-child {
            margin-top: 0;
          }
          
          &:last-child {
            margin-bottom: 0;
          }
        }
        
        img {
          width: 100%;
          height: auto;
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
