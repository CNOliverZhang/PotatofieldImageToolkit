import { stat } from "fs"

export default {
  namespaced: true,
  state: {
    scale: 1.0,
    smallHomeIcon: true,
    identifier: null
  },
  mutations: {
    SET_SCALE (state, scale) {
      state.scale = scale
    },
    CHANGE_HOME_ICON_STYLE (state, smallHomeIcon) {
      state.smallHomeIcon = smallHomeIcon
    },
    SET_IDENTIFIER (state, identifier) {
      state.identifier = identifier
    }
  },
  actions: {
    setScale (context, scale) {
      return new Promise((resolve, reject) => {
        context.commit('SET_SCALE', scale)
        resolve()
      })
    },
    changeHomeIconStyle(context, smallHomeIcon) {
      return new Promise((resolve, reject) => {
        context.commit('CHANGE_HOME_ICON_STYLE', smallHomeIcon)
        resolve()
      })
    },
    setIdentifier(context, identifier) {
      return new Promise((resolve, reject) => {
        context.commit('SET_IDENTIFIER', identifier)
        resolve()
      })
    }
  }
}