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
      path: '/messages',
      name: 'messages',
      component: require('@/pages/messages').default
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('@/pages/settings').default
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
      path: '/splicer',
      name: 'splicer',
      component: require('@/pages/splicer').default,
    },
    {
      path: '/splicer/editor',
      name: 'splicerEditor',
      component: require('@/pages/splicer/editor').default
    },
    {
      path: '/splicer/template',
      name: 'splicerTemplate',
      component: require('@/pages/splicer/template').default
    },
    {
      path: '/cropper',
      name: 'cropper',
      component: require('@/pages/cropper').default
    },
    {
      path: '/cropper/editor',
      name: 'cropperEditor',
      component: require('@/pages/cropper/editor').default
    },
    {
      path: '/slice',
      name: 'slice',
      component: require('@/pages/slice').default
    },
    {
      path: '/slice/editor',
      name: 'sliceEditor',
      component: require('@/pages/slice/editor').default
    },
    {
      path: '/textToImage',
      name: 'textToImage',
      component: require('@/pages/textToImage').default
    },
    {
      path: '/textToImage/editor',
      name: 'textToImageEditor',
      component: require('@/pages/textToImage/editor').default
    },
    {
      path: '/textToImage/template',
      name: 'textToImageTemplate',
      component: require('@/pages/textToImage/template').default
    },
    {
      path: '/resizer',
      name: 'resizer',
      component: require('@/pages/resizer').default
    },
    {
      path: '/compress',
      name: 'compress',
      component: require('@/pages/compress').default
    },
    {
      path: '/convert',
      name: 'convert',
      component: require('@/pages/convert').default
    },
    {
      path: '/exif',
      name: 'exif',
      component: require('@/pages/exif').default
    },
    {
      path: '/palette',
      name: 'palette',
      component: require('@/pages/palette').default
    },
    {
      path: '/fonts',
      name: 'fonts',
      component: require('@/pages/fonts').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
