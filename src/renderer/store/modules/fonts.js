export default {
  namespaced: true,
  state: {
    fontsUpdated: false,
    defaultFont: 'NotoSansSCThin',
    fontList: [
      {
        fontFamily: 'NotoSansSCThin',
        verbose: '思源黑体',
        weight: '极细',
        language: '中英文',
        src: 'static/fonts/NotoSansSC-Thin.otf',
        image: 'static/fonts/思源黑体（极细）.png',
        builtin: true
      }
    ]
  },
  mutations: {
    MARK_FONTS_UPDATED (state) {
      state.fontsUpdated = true
    },
    MARK_FONTS_UNUPDATED (state) {
      state.fontsUpdated = false
    },
    SET_DEFAULT_FONT (state, defaultFont) {
      state.defaultFont = defaultFont
    },
    FONTLIST_PUSH (state, font) {
      state.fontList.push(font)
    },
    FONTLIST_DELETE (state, index) {
      state.fontList.splice(index, 1)
    }
  },
  actions: {
    markFontsUpdated (context) {
      context.commit('MARK_FONTS_UPDATED')
    },
    markFontsUnupdated (context) {
      context.commit('MARK_FONTS_UNUPDATED')
    },
    setDefaultFont (context, defaultFont) {
      context.commit('SET_DEFAULT_FONT', defaultFont)
    },
    fontListPush (context, font) {
      context.commit('FONTLIST_PUSH', font)
    },
    fontListDelete (context, index) {
      context.commit('FONTLIST_DELETE', index)
    }
  }
}