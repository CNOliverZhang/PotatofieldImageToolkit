export default {
  namespaced: true,
  state: {
    templates: []
  },
  mutations: {
    TEMPLATE_PUSH (state, template) {
      state.templates.push(template)
    },
    TEMPLATE_REPLACE (state, payload) {
      state.templates.splice(payload.index, 1, payload.template)
    },
    TEMPLATE_DELETE (state, index) {
      state.templates.splice(index, 1)
    },
    TEMPLATE_EMPTY (state) {
      state.templates = []
    }
  },
  actions: {
    templatePush (context, template) {
      context.commit('TEMPLATE_PUSH', template)
    },
    templateReplace (context, payload) {
      context.commit('TEMPLATE_REPLACE', payload)
    },
    templateDelete (context, index) {
      context.commit('TEMPLATE_DELETE', index)
    },
    templateEmpty (context) {
      context.commit('TEMPLATE_EMPTY')
    }
  }
}