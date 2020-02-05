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
      context.commit('FILELIST_ASSIGN', fileList)
    },
    fileListPush (context, file) {
      context.commit('FILELIST_PUSH', file)
    },
    fileListDelete (context, index) {
      context.commit('FILELIST_DELETE', index)
    },
    fileListEmpty (context) {
      context.commit('FILELIST_EMPTY')
    },
    templatesAssign (context, templates) {
      context.commit('TEMPLATES_ASSIGN', templates)
    },
    templatePush (context, template) {
      context.commit('TEMPLATE_PUSH', template)
    },
    templateReplace (context, payload) {
      context.commit('TEMPLATE_REPLACE', payload)
    },
    templateDelete (context, index) {
      context.commit('TEMPLATE_DELETE', index)
    },
    templatesEmpty (context) {
      context.commit('TEMPLATES_EMPTY')
    }
  }
}