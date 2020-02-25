import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState, createSharedMutations } from 'vuex-electron'
import createPromiseAction from '../utils/ActionPromise'
import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  plugins: [
    createPersistedState({
      reducer: (state) => {
        return {
          watermark: {
            templates: state.watermark.templates
          },
          splicer: {
            templates: state.splicer.templates
          },
          textToImage: {
            templates: state.watermark.templates
          },
          fonts: {
            fontsUpdated: state.fonts.fontsUpdated,
            fontList: state.fonts.fontList
          },
          messages: {
            messages: state.messages.messages
          }
        }
      }
    }),
    createSharedMutations(),
    createPromiseAction()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
