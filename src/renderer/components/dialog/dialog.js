import Vue from 'vue'
import dialog from './dialog.vue'

const dialogConstructor = Vue.extend(dialog)

function showDialog(args) {
  return new Promise((resolve, reject) => {
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
          cancelFunction: args.cancelFunction !== undefined ? args.cancelFunction : function () {}
        }
      },
    })
    if (args.content !== undefined) {
      dialogDom.$slots.default = [args.content]
    }
    dialogDom.$once('mounted', () => {
      setTimeout(() => {
        resolve(dialogDom)
      }, 100)
    })
    dialogDom.$mount()
    document.body.appendChild(dialogDom.$el)
  })
}

function registryDialog() {
  Vue.prototype.$dialog = showDialog
}

export default registryDialog