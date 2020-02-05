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
      context.commit('CONTENT_ASSIGN', content)
    },
    contentReset (context) {
      context.commit('CONTENT_RESET')
    },
    templatesAssign (context, templates) {
      context.commit('TEMPLATES_ASSIGN', templates)
    },
    templatePush (context, template) {
      context.commit('TEMPLATE_PUSH', template)
    },
    templateReplace (context, payload) {
      context.commit('TEMPLATE_REPLACE', payload)
    },
    templateDelete (context, index) {
      context.commit('TEMPLATE_DELETE', index)
    },
    templatesEmpty (context) {
      context.commit('TEMPLATES_EMPTY')
    }
  }
}