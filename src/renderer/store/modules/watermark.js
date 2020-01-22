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
      state.fileList.push(file)
    },
    FILELIST_POP (state) {
      return state.fileList.pop()
    },
    FILELIST_DELETE (state, index) {
      state.fileList.splice(index, 1)
    },
    FILELIST_EMPTY (state) {
      state.fileList = []
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
    TEMPLATE_EMPTY (state) {
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
    fileListPop (context) {
      return context.commit('FILELIST_POP')
    },
    fileListDelete (context, index) {
      context.commit('FILELIST_DELETE', index)
    },
    fileListEmpty (context) {
      context.commit('FILELIST_EMPTY')
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
    templateEmpty (context) {
      context.commit('TEMPLATE_EMPTY')
    }
  }
}