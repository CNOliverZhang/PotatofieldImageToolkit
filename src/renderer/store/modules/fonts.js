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
        language: '中文',
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
    },
    FONTLIST_ASSIGN (state, fontList) {
      state.fontList = fontList
    }
  },
  actions: {
    markFontsUpdated (context) {
      return new Promise((resolve, reject) => {
        context.commit('MARK_FONTS_UPDATED')
        resolve()
      })
    },
    markFontsUnupdated (context) {
      return new Promise((resolve, reject) => {
        context.commit('MARK_FONTS_UNUPDATED')
        resolve()
      })
    },
    setDefaultFont (context, defaultFont) {
      return new Promise((resolve, reject) => {
        context.commit('SET_DEFAULT_FONT', defaultFont)
        resolve()
      })
    },
    fontListPush (context, font) {
      return new Promise((resolve, reject) => {
        context.commit('FONTLIST_PUSH', font)
        resolve()
      })
    },
    fontListDelete (context, index) {
      return new Promise((resolve, reject) => {
        context.commit('FONTLIST_DELETE', index)
        resolve()
      })
    },
    fontListAssign (context, fontList) {
      return new Promise((resolve, reject) => {
        context.commit('FONTLIST_ASSIGN', fontList)
        resolve()
      })
    }
  }
}