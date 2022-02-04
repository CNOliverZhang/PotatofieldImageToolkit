export default {
  namespaced: true,
  state: {
    fileList: [],
    templates: []
  },
  mutations: {
    FILELIST_ASSIGN (state, fileList) {
      state.fileList = fileList
    },
    FILELIST_PUSH (state, file) {
      for (let i = 0; i < state.fileList.length; i++) {
        if (state.fileList[i].fullpath == file.fullpath) {
          return
        }
      }
      state.fileList.push(file)
    },
    FILELIST_DELETE (state, index) {
      state.fileList.splice(index, 1)
    },
    FILELIST_EMPTY (state) {
      state.fileList = []
    },
    TEMPLATES_ASSIGN (state, templates) {
      state.templates = templates
    },
    TEMPLATE_PUSH (state, template) {
      state.templates.push(template)
    },
    TEMPLATE_REPLACE (state, payload) {
      state.templates.splice(payload.index, 1, payload.template)
    },
    TEMPLATE_DELETE (state, index) {
      state.templates.splice(index, 1)
    },
    TEMPLATES_EMPTY (state) {
      state.templates = []
    }
  },
  actions: {
    fileListAssign (context, fileList) {
      return new Promise((resolve, reject) => {
        context.commit('FILELIST_ASSIGN', fileList)
        resolve()
      })
    },
    fileListPush (context, file) {
      return new Promise((resolve, reject) => {
        context.commit('FILELIST_PUSH', file)
        resolve()
      })
    },
    fileListDelete (context, index) {
      return new Promise((resolve, reject) => {
        context.commit('FILELIST_DELETE', index)
        resolve()
      })
    },
    fileListEmpty (context) {
      return new Promise((resolve, reject) => {
        context.commit('FILELIST_EMPTY')
        resolve()
      })
    },
    templatesAssign (context, templates) {
      return new Promise((resolve, reject) => {
        context.commit('TEMPLATES_ASSIGN', templates)
        resolve()
      })
    },
    templatePush (context, template) {
      return new Promise((resolve, reject) => {
        context.commit('TEMPLATE_PUSH', template)
        resolve()
      })
    },
    templateReplace (context, payload) {
      return new Promise((resolve, reject) => {
        context.commit('TEMPLATE_REPLACE', payload)
        resolve()
      })
    },
    templateDelete (context, index) {
      return new Promise((resolve, reject) => {
        context.commit('TEMPLATE_DELETE', index)
        resolve()
      })
    },
    templatesEmpty (context) {
      return new Promise((resolve, reject) => {
        context.commit('TEMPLATES_EMPTY')
        resolve()
      })
    }
  }
}