export default {
  namespaced: true,
  state: {
    messageList: []
  },
  mutations: {
    MARK_READ (state, id) {
      state.messageList.push(id)
    }
  },
  actions: {
    markRead (context, id) {
      return new Promise((resolve, reject) => {
        context.commit('MARK_READ', id)
        resolve()
      })
    }
  }
}