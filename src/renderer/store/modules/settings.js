export default {
  namespaced: true,
  state: {
    scale: 1.0,
  },
  mutations: {
    SET_SCALE (state, scale) {
      state.scale = scale
    }
  },
  actions: {
    setScale (context, scale) {
      return new Promise((resolve, reject) => {
        context.commit('SET_SCALE', scale)
        resolve()
      })
    }
  }
}