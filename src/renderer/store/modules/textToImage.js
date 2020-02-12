export default {
  namespaced: true,
  state: {
    content: '',
    templates: []
  },
  mutations: {
    CONTENT_ASSIGN (state, content) {
      state.content = content
    },
    CONTENT_RESET (state) {
      state.content = ''
    },
    TEMPLATES_ASSIGN (state, templates) {
      state.templates = templates
    },
    TEMPLATE_PUSH (state, template) {
      state.templates.push(template)
    },
    TEMPLATE_REPLACE (state, payload) {
      state.templates.splice(payload.index, 1, payload.template)
    },
    TEMPLATE_DELETE (state, index) {
      state.templates.splice(index, 1)
    },
    TEMPLATES_EMPTY (state) {
      state.templates = []
    }
  },
  actions: {
    contentAssign (context, content) {
      return new Promise((resolve, reject) => {
        context.commit('CONTENT_ASSIGN', content)
        resolve()
      })
    },
    contentReset (context) {
      return new Promise((resolve, reject) => {
        context.commit('CONTENT_RESET')
        resolve()
      })
    },
    templatesAssign (context, templates) {
      return new Promise((resolve, reject) => {
        context.commit('TEMPLATES_ASSIGN', templates)
        resolve()
      })
    },
    templatePush (context, template) {
      return new Promise((resolve, reject) => {
        context.commit('TEMPLATE_PUSH', template)
        resolve()
      })
    },
    templateReplace (context, payload) {
      return new Promise((resolve, reject) => {
        context.commit('TEMPLATE_REPLACE', payload)
        resolve()
      })
    },
    templateDelete (context, index) {
      return new Promise((resolve, reject) => {
        context.commit('TEMPLATE_DELETE', index)
        resolve()
      })
    },
    templatesEmpty (context) {
      return new Promise((resolve, reject) => {
        context.commit('TEMPLATES_EMPTY')
        resolve()
      })
    }
  }
}