export default {
  namespaced: true,
  state: {
    fileList: []
  },
  mutations: {
    assign (state, fileList) {
      state.fileList = fileList
    },
    push (state, file) {
      state.fileList.push(file)
    },
    pop (state) {
      return state.fileList.pop()
    },
    del (state, index) {
      state.fileList.splice(index, 1)
    },
    empty (state) {
      state.fileList = []
    }
  }
}