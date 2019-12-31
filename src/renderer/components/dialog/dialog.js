import Vue from 'vue'
import dialog from './dialog.vue'

const dialogConstructor = Vue.extend(dialog)

function showDialog(args) {
  let dialogElement = document.getElementById('dialog')
  if (!dialogElement) {
    let dialogDom = new dialogConstructor({
      el: document.createElement('div'),
      data() {
        return {
          type: args.type ? args.type : '',
          title: args.title ? args.title : '提示',
          text: args.text ? args.text : '',
          list: args.list ? args.list : [],
          showCancel: args.showCancel ? args.showCancel : false,
          confirmText: args.confirmText ? args.confirmText : '确定',
          cancelText: args.cancelText ? args.cancelText : '取消',
          confirmFunction: args.confirmFunction ? args.confirmFunction : function () {},
          cancelFunction: args.cancelFunction ? args.cancelFunction : function () {}
        }
      }
    })
    dialogDom.$el.id = 'dialog'
    document.body.appendChild(dialogDom.$el)
  }
}

function registryDialog() {
  Vue.prototype.$dialog = showDialog
}

export default registryDialog