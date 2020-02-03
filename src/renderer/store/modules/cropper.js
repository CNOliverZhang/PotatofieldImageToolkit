export default {
  namespaced: true,
  state: {
    fileList: []
  },
  mutations: {
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
    }
  },
  actions: {
    fileListPush (context, file) {
      context.commit('FILELIST_PUSH', file)
    },
    fileListDelete (context, index) {
      context.commit('FILELIST_DELETE', index)
    },
    fileListEmpty (context) {
      context.commit('FILELIST_EMPTY')
    }
  }
}