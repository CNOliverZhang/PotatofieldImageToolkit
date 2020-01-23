import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'index',
      component: require('@/pages/index').default
    },
    {
      path: '/about',
      name: 'about',
      component: require('@/pages/about').default
    },
    {
      path: '/watermark',
      name: 'watermark',
      component: require('@/pages/watermark').default,
    },
    {
      path: '/watermark/editor',
      name: 'watermarkEditor',
      component: require('@/pages/watermark/editor').default
    },
    {
      path: '/watermark/template',
      name: 'watermarkTemplate',
      component: require('@/pages/watermark/template').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
