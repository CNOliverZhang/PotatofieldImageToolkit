export default {
  namespaced: true,
  state: {
    fileList: [],
    config: {
      customDistDirectory: false,
      distDirectory: '',
      srcDirectory: '',
      keepDirectoryStructure: false,
      mimeType: 'JPEG',
      postPend: '_watermarked',
    },
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
    CONFIG_ASSIGN (state, config) {
      state.config = config
    },
    CONFIG_RESET (state) {
      state.config = {
        customDistDirectory: false,
        distDirectory: '',
        srcDirectory: '',
        keepDirectoryStructure: false,
        mimeType: 'JPEG',
        postPend: '_watermarked'
      }
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
    configAssign (context, config) {
      context.commit('CONFIG_ASSIGN', config)
    },
    configReset (context) {
      context.commit('CONFIG_RESET')
    }
  }
}