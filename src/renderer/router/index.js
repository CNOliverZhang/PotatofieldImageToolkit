import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: require('@/components/index').default
    },
    {
      path: '/about',
      name: 'about',
      component: require('@/components/about').default
    },
    {
      path: '/watermark',
      name: 'watermark',
      component: require('@/components/watermark').default,
      children: [
        {
          path: '/watermark/editor',
          name: 'watermarkEditor',
          component: require('@/components/watermark/editor').default
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
