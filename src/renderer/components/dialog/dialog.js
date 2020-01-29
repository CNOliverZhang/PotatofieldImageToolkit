import Vue from 'vue'
import dialog from './dialog.vue'

const dialogConstructor = Vue.extend(dialog)

function showDialog(args) {
  let dialogDom = new dialogConstructor({
    el: document.createElement('div'),
    data() {
      return {
        type: args.type !== undefined ? args.type : '',
        title: args.title !== undefined ? args.title : '提示',
        text: args.text !== undefined ? args.text : '',
        showCancel: args.showCancel !== undefined ? args.showCancel : false,
        showConfirm: args.showConfirm !== undefined ? args.showConfirm : true,
        confirmText: args.confirmText !== undefined ? args.confirmText : '确定',
        cancelText: args.cancelText !== undefined ? args.cancelText : '取消',
        confirmFunction: args.confirmFunction !== undefined ? args.confirmFunction : function () {},
        cancelFunction: args.cancelFunction !== undefined ? args.cancelFunction : function () {},
        onShowFunction: args.onShowFunction !== undefined ? args.onShowFunction : function () {}
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