import Vue from 'vue'
import dialog from './dialog.vue'

const dialogConstructor = Vue.extend(dialog)

function showDialog(args) {
  let dialogDom = new dialogConstructor({
    el: document.createElement('div'),
    data() {
      return {
        type: args.type ? args.type : '',
        title: args.title ? args.title : '提示',
        text: args.text ? args.text : '',
        showCancel: args.showCancel ? args.showCancel : false,
        showConfirm: args.showConfirm === false ? false : true,
        confirmText: args.confirmText ? args.confirmText : '确定',
        cancelText: args.cancelText ? args.cancelText : '取消',
        confirmFunction: args.confirmFunction ? args.confirmFunction : function () {},
        cancelFunction: args.cancelFunction ? args.cancelFunction : function () {}
      }
    },
  })
  if (args.content) {
    dialogDom.$slots.default = [args.content]
  }
  dialogDom.$mount()
  document.body.appendChild(dialogDom.$el)
  return dialogDom
}

function registryDialog() {
  Vue.prototype.$dialog = showDialog
}

export default registryDialog