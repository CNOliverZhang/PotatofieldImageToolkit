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
    }
  }
}