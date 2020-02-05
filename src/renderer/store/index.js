import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState, createSharedMutations } from 'vuex-electron'

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
          }
        }
      }
    }),
    createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
