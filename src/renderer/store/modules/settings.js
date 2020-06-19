import { stat } from "fs"

export default {
  namespaced: true,
  state: {
    scale: 1.0,
    smallHomeIcon: true
  },
  mutations: {
    SET_SCALE (state, scale) {
      state.scale = scale
    },
    CHANGE_HOME_ICON_STYLE (state) {
      state.smallHomeIcon = !state.smallHomeIcon
    }
  },
  actions: {
    setScale (context, scale) {
      return new Promise((resolve, reject) => {
        context.commit('SET_SCALE', scale)
        resolve()
      })
    },
    changeHomeIconStyle(context) {
      return new Promise((resolve, reject) => {
        context.commit('CHANGE_HOME_ICON_STYLE')
        resolve()
      })
    }
  }
}